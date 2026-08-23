#!/usr/bin/env node
// PQR normalizer — turns a manually downloaded Global Fund PQR crosstab into
// the procurement_transactions staging dataset:
//   node scripts/normalize-pqr.js <downloaded-crosstab-file>
//
// Where the input comes from (the one manual step — ~2 minutes):
//   1. Open https://insights.theglobalfund.org/t/Public/views/PriceQualityReportingTransactionSummary/TransactionSummary
//   2. Toolbar → Download → Crosstab → pick the transactions sheet → CSV → Download.
//   (Scripted access is confirmed blocked: the server's WAF drops direct .csv
//   requests even from a real browser session, and the vizql export commands
//   only work inside a fully rendered client — checked 2026-08-22. Do not
//   build automation against those endpoints; see docs/data-sourcing-plan.md.)
//
// Outputs:
//   sourcing/raw/pqr/<date>-crosstab.csv.gz     gzipped verbatim copy of the
//                                               download (the raw crosstab is
//                                               ~60 MB — all components)
//   sourcing/staging/procurement_transactions.csv
//                                               scoped to the malaria-relevant
//                                               market: rows whose product
//                                               category mentions malaria or
//                                               vector control, plus any row
//                                               matched to a portfolio product
//
// Tableau crosstabs vary (UTF-16 TSV or UTF-8 CSV; column names shift between
// workbook revisions), so this normalizer makes no hard column assumptions:
// it auto-detects encoding and delimiter, normalizes headers to camelCase,
// passes ALL columns through, and prepends portfolio productId matching plus
// provenance columns. Downstream consumers select the columns they need.
//
// Requires Node 18+. No dependencies.

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.join(__dirname, "..");
const RAW_DIR = path.join(root, "sourcing", "raw", "pqr");
const STAGING_DIR = path.join(root, "sourcing", "staging");
const SOURCE_URL = "https://insights.theglobalfund.org/t/Public/views/PriceQualityReportingTransactionSummary/TransactionSummary";

const input = process.argv[2];
if (!input || !fs.existsSync(input)) {
  console.error("Usage: node scripts/normalize-pqr.js <downloaded-crosstab-file>");
  console.error(input ? `Not found: ${input}` : "Missing input file.");
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

// ---- encoding detection: Tableau crosstab CSVs are often UTF-16LE ----
function decode(buf) {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) return buf.toString("utf16le", 2);
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    return buf.swap16().toString("utf16le", 2); // UTF-16BE → LE
  }
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return buf.toString("utf8", 3);
  // heuristic: lots of NUL bytes means BOM-less UTF-16LE
  const nuls = buf.slice(0, 200).filter(b => b === 0).length;
  return nuls > 40 ? buf.toString("utf16le") : buf.toString("utf8");
}

// ---- delimiter detection on the header line ----
function detectDelimiter(text) {
  const firstLine = text.slice(0, text.indexOf("\n"));
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const semis = (firstLine.match(/;/g) || []).length;
  if (tabs >= commas && tabs >= semis) return "\t";
  return semis > commas ? ";" : ",";
}

function parseDelimited(text, delim) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delim) { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// "Unit Cost (USD)" -> unitCostUsd ; keeps headers stable for consumers
function camelize(header) {
  return header.trim()
    .replace(/[^A-Za-z0-9]+/g, " ").trim().toLowerCase()
    .replace(/ (\w)/g, (_, c) => c.toUpperCase()) || "column";
}

// Portfolio matching — medicines subset of fetch-regulatory.js's mapping
// (PQR is procurement, so the emanators vector-control mapping isn't needed);
// keep the patterns themselves in sync with that script.
function mapProductId(text) {
  const t = String(text || "").toLowerCase();
  if (/ganaplacide/.test(t)) return "ganlum";
  if (/pyronaridine/.test(t) && /artesunate/.test(t)) return "pyramax";
  if (/(dihydroartemisinin|artenimol)/.test(t) && /piperaquine/.test(t)) return "dhappq";
  if (/artemether/.test(t) && /lumefantrine/.test(t) && /amodiaquine/.test(t)) return "alaq";
  return "";
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ---- run ----
const text = decode(fs.readFileSync(input));
const delim = detectDelimiter(text);
const rows = parseDelimited(text, delim);
if (rows.length < 2) { console.error("Parsed fewer than 2 rows — is this the right file?"); process.exit(1); }

const rawHeader = rows[0];
const header = rawHeader.map(camelize);
console.log(`Encoding/delimiter: ${delim === "\t" ? "TSV" : "CSV"} · ${rows.length - 1} data rows`);
console.log(`Columns: ${header.join(", ")}`);

// the columns the productId match reads: every column named like product
// (name, description, category…) joined — never just the first hit, which
// can be a category column that hides the INN
const productCols = header.map((h, i) => (/product/i.test(h) ? i : -1)).filter(i => i >= 0);
if (!productCols.length) console.warn("Warning: no column name contains 'product' — productId will be matched against the whole row.");

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(STAGING_DIR, { recursive: true });
fs.writeFileSync(path.join(RAW_DIR, `${today}-crosstab.csv.gz`), zlib.gzipSync(fs.readFileSync(input)));

// staging scope: the malaria-relevant market (drops ARV/TB/diagnostics bulk)
const catCol = header.findIndex(h => /category/i.test(h));
const inScope = (r, productId) =>
  productId !== "" ||
  (catCol >= 0 && /malaria|vector control/i.test(r[catCol] || ""));

const outHeader = ["productId", ...header, "sourceUrl", "retrievedDate"];
const out = [outHeader.join(",")];
let matched = 0, kept = 0;
for (const r of rows.slice(1)) {
  const basis = productCols.length ? productCols.map(i => r[i]).join(" ") : r.join(" ");
  const productId = mapProductId(basis);
  if (!inScope(r, productId)) continue;
  kept++;
  if (productId) matched++;
  out.push([productId, ...header.map((_, i) => r[i] || ""), SOURCE_URL, today].map(csvEscape).join(","));
}
fs.writeFileSync(path.join(STAGING_DIR, "procurement_transactions.csv"), out.join("\n") + "\n");

console.log(`\n${rows.length - 1} rows parsed → ${kept} in the malaria-relevant scope (${matched} matched to portfolio products)`);
console.log(`Staging → sourcing/staging/procurement_transactions.csv`);
console.log(`Raw copy (gzipped, full crosstab) → sourcing/raw/pqr/${today}-crosstab.csv.gz`);
console.log("Reminder: PQR is self-reported with reporting lags — treat recent quarters as incomplete (see the PQR Data Caveats note).");
