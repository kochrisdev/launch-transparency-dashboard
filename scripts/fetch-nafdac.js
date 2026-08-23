#!/usr/bin/env node
// NAFDAC Greenbook pull — queries Nigeria's public medicines register for the
// portfolio's active ingredients, snapshots the raw records, normalizes a
// staging CSV of country-registration rows, and diffs against the previous
// snapshot (new registrations, status/expiry changes):
//   node scripts/fetch-nafdac.js
//
// Endpoint: the Greenbook home page (greenbook.nafdac.gov.ng) is a Laravel /
// Yajra server-side DataTables app — GET the root with DataTables parameters
// and X-Requested-With: XMLHttpRequest to receive JSON records (product name,
// NAFDAC reg. no., composition, form, applicant, approval/expiry dates,
// status). Plain HTTP is used deliberately: the host's HTTPS handshake
// completes but requests then hang (checked 2026-08-23) — this is public
// register data, no credentials involved.
//
// Outputs (see docs/data-sourcing-plan.md §4 — collection pipeline rules):
//   sourcing/raw/nafdac/<date>.json           dated snapshot (raw records)
//   sourcing/staging/nafdac_registrations.csv portfolio rows, iso3=NGA
//   sourcing/reports/nafdac-watch-<date>.md   what changed
//
// This is the first NRA register in the plan's Category C — the pattern to
// replicate for other portfolio countries. Only ever writes under sourcing/.
//
// Requires Node 18+ (global fetch). No dependencies. The server is slow —
// expect ~10-60s per query; the script retries each query once.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const RAW_DIR = path.join(root, "sourcing", "raw", "nafdac");
const STAGING_DIR = path.join(root, "sourcing", "staging");
const REPORT_DIR = path.join(root, "sourcing", "reports");

const BASE = "http://greenbook.nafdac.gov.ng/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36";
const PAGE = 500;

// One search term per active ingredient family; matched rows are filtered to
// portfolio products afterwards, so over-broad terms are fine.
const SEARCH_TERMS = ["ganaplacide", "pyronaridine", "piperaquine", "amodiaquine"];

const today = new Date().toISOString().slice(0, 10);

// same portfolio matching as fetch-regulatory.js / normalize-pqr.js
function mapProductId(text) {
  const t = String(text || "").toLowerCase();
  if (/ganaplacide/.test(t)) return "ganlum";
  if (/pyronaridine/.test(t) && /artesunate/.test(t)) return "pyramax";
  if (/(dihydroartemisinin|artenimol)/.test(t) && /piperaquine/.test(t)) return "dhappq";
  if (/artemether/.test(t) && /lumefantrine/.test(t) && /amodiaquine/.test(t)) return "alaq";
  return "";
}

function dtParams(term, start) {
  const p = new URLSearchParams();
  p.set("draw", "1");
  p.set("start", String(start));
  p.set("length", String(PAGE));
  p.set("search[value]", term);
  p.set("search[regex]", "false");
  // Yajra needs at least the searchable columns declared
  const cols = ["product_name", "ingredient.ingredient_name", "NAFDAC"];
  cols.forEach((c, i) => {
    p.set(`columns[${i}][data]`, c);
    p.set(`columns[${i}][name]`, c);
    p.set(`columns[${i}][searchable]`, "true");
    p.set(`columns[${i}][orderable]`, "true");
    p.set(`columns[${i}][search][value]`, "");
    p.set(`columns[${i}][search][regex]`, "false");
  });
  return p;
}

async function query(term, start, attempt = 1) {
  const url = `${BASE}?${dtParams(term, start)}`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, "x-requested-with": "XMLHttpRequest", accept: "application/json" },
      signal: AbortSignal.timeout(180000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (attempt >= 2) throw new Error(`Greenbook query "${term}" failed twice: ${e.message || e}`);
    console.log(`  retry (${e.message || e})`);
    return query(term, start, attempt + 1);
  }
}

async function fetchTerm(term) {
  const records = [];
  let start = 0, filtered = Infinity;
  while (start < filtered) {
    const body = await query(term, start);
    filtered = body.recordsFiltered ?? 0;
    records.push(...(body.data || []));
    start += PAGE;
  }
  console.log(`${term}: ${records.length} records`);
  return records;
}

const isoDate = v => (v ? String(v).slice(0, 10) : "");
function toRow(r) {
  const matchBasis = `${r.product_name} ${r.composition} ${(r.ingredient || {}).ingredient_name || r.ingredient_name || ""}`;
  return {
    productId: mapProductId(matchBasis),
    iso3: "NGA",
    nafdacNo: r.NAFDAC || "",
    productName: String(r.product_name || "").replace(/[#*]/g, "").trim(),
    ingredients: (r.ingredient || {}).ingredient_name || r.ingredient_name || "",
    composition: r.composition || "",
    form: (r.form || {}).name || r.form_name || "",
    strength: r.strength || "",
    packSize: String(r.pack_size || "").replace(/&#0?39;/g, "'"),
    route: (r.route || {}).name || r.route_name || "",
    applicant: (r.applicant || {}).name || r.applicant_name || "",
    atc: r.atc || "",
    approvalDate: isoDate(r.approval_date),
    expiryDate: isoDate(r.expiry_date),
    status: r.status || "",
    sourceUrl: "https://greenbook.nafdac.gov.ng/",
    retrievedDate: today,
  };
}

function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(rows, columns) {
  return [columns.join(","), ...rows.map(r => columns.map(c => csvEscape(r[c])).join(","))].join("\n") + "\n";
}

function loadPrevious() {
  if (!fs.existsSync(RAW_DIR)) return null;
  const dates = fs.readdirSync(RAW_DIR)
    .map(f => (f.match(/^(\d{4}-\d{2}-\d{2})\.json$/) || [])[1])
    .filter(d => d && d < today)
    .sort();
  if (!dates.length) return null;
  const date = dates[dates.length - 1];
  return { date, snapshot: JSON.parse(fs.readFileSync(path.join(RAW_DIR, `${date}.json`), "utf8")) };
}

function diff(prevRows, rows) {
  const key = r => `${r.nafdacNo}|${r.productName}`;
  const label = r => `${r.productName} (${r.nafdacNo}${r.productId ? `, **${r.productId}**` : ""})`;
  const prevBy = new Map(prevRows.map(r => [key(r), r]));
  const currBy = new Map(rows.map(r => [key(r), r]));
  const changes = [];
  for (const [k, r] of currBy) {
    const old = prevBy.get(k);
    if (!old) { changes.push(`- **NEW** ${label(r)} — approved ${r.approvalDate}, ${r.status}, applicant ${r.applicant}`); continue; }
    for (const field of ["status", "expiryDate", "approvalDate"]) {
      if (old[field] !== r[field]) changes.push(`- ${label(r)} — ${field}: \`${old[field] || "—"}\` → \`${r[field] || "—"}\``);
    }
  }
  for (const [k, old] of prevBy) {
    if (!currBy.has(k)) changes.push(`- **GONE** ${label(old)} — no longer returned by the register (check for deregistration)`);
  }
  return changes;
}

(async () => {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(STAGING_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const previous = loadPrevious();

  // sequential — the server is slow and fragile; don't hammer it
  const byId = new Map();
  for (const term of SEARCH_TERMS) {
    for (const r of await fetchTerm(term)) byId.set(r.product_id, r);
  }
  const all = [...byId.values()];
  const rows = all.map(toRow).filter(r => r.productId)
    .sort((a, b) => a.productId.localeCompare(b.productId) || a.nafdacNo.localeCompare(b.nafdacNo));

  fs.writeFileSync(path.join(RAW_DIR, `${today}.json`),
    JSON.stringify({ retrieved: today, source: BASE, searchTerms: SEARCH_TERMS, records: all }, null, 1));

  const columns = ["productId", "iso3", "nafdacNo", "productName", "ingredients", "composition",
    "form", "strength", "packSize", "route", "applicant", "atc",
    "approvalDate", "expiryDate", "status", "sourceUrl", "retrievedDate"];
  fs.writeFileSync(path.join(STAGING_DIR, "nafdac_registrations.csv"), toCsv(rows, columns));

  let reportBody;
  if (!previous) {
    reportBody = `First snapshot — no previous run to diff against. ${rows.length} portfolio registrations staged (${all.length} raw records across ${SEARCH_TERMS.length} searches).`;
  } else {
    const prevRows = (previous.snapshot.records || []).map(toRow).filter(r => r.productId);
    const changes = diff(prevRows, rows);
    reportBody = changes.length
      ? `Changes since ${previous.date}:\n\n${changes.join("\n")}`
      : `No changes since ${previous.date}. ${rows.length} portfolio registrations staged.`;
  }
  const report = `# NAFDAC watch — ${today}\n\nSource: NAFDAC Greenbook (Nigeria public register of medicines), greenbook.nafdac.gov.ng.\n\n${reportBody}\n`;
  fs.writeFileSync(path.join(REPORT_DIR, `nafdac-watch-${today}.md`), report);

  const byProduct = rows.reduce((m, r) => (m[r.productId] = (m[r.productId] || 0) + 1, m), {});
  console.log(`\n${rows.length} portfolio rows (${Object.entries(byProduct).map(([k, v]) => `${k} ${v}`).join(" · ")}) → sourcing/staging/nafdac_registrations.csv`);
  console.log(`Snapshot → sourcing/raw/nafdac/${today}.json`);
  console.log(`Report → sourcing/reports/nafdac-watch-${today}.md`);
  console.log("\n" + reportBody);
})().catch(err => { console.error(err.message || err); process.exit(1); });
