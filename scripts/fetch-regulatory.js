#!/usr/bin/env node
// Regulatory pull — fetches the WHO Prequalification lists (medicines +
// vector control, CSV export) and the EMA EU-M4all / Article 58 opinions
// table (xlsx, regenerated nightly), snapshots them, normalizes a
// regulatory_events staging CSV, and diffs against the previous snapshot
// (new listings, delistings, opinion changes):
//   node scripts/fetch-regulatory.js
//
// Outputs (see docs/data-sourcing-plan.md §4 — collection pipeline rules):
//   sourcing/raw/whopq/<date>-fpp.csv                    full PQ medicines list
//   sourcing/raw/whopq/<date>-vector-control.csv         full PQ VC list
//   sourcing/raw/ema/<date>-opinions-outside-eu.xlsx     EU-M4all opinions
//   sourcing/staging/regulatory_events.csv               normalized events
//   sourcing/reports/regulatory-watch-<date>.md          what changed
//
// Staging keeps malaria FPPs, all vector-control products and all EU-M4all
// opinions; the raw snapshots keep everything. This script only ever writes
// under sourcing/ — never data/products.js.
//
// Requires Node 18+ (global fetch). No dependencies (the xlsx is unpacked
// with zlib and a minimal ZIP central-directory reader).

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.join(__dirname, "..");
const RAW_PQ = path.join(root, "sourcing", "raw", "whopq");
const RAW_EMA = path.join(root, "sourcing", "raw", "ema");
const STAGING_DIR = path.join(root, "sourcing", "staging");
const REPORT_DIR = path.join(root, "sourcing", "reports");

// The WHO extranet and EMA both 403 default fetch user agents.
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36";

const SOURCES = {
  fpp: {
    url: "https://extranet.who.int/prequal/medicines/prequalified/finished-pharmaceutical-products/export?page&_format=csv",
    page: "https://extranet.who.int/prequal/medicines/prequalified/finished-pharmaceutical-products",
  },
  vc: {
    url: "https://extranet.who.int/prequal/vector-control-products/prequalified-product-list/export?page&_format=csv",
    page: "https://extranet.who.int/prequal/vector-control-products/prequalified-product-list",
  },
  ema: {
    url: "https://www.ema.europa.eu/en/documents/report/medicines-output-opinions_outside_eu-report_en.xlsx",
    page: "https://www.ema.europa.eu/en/medicines/download-medicine-data",
  },
};

const today = new Date().toISOString().slice(0, 10);

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// ---- CSV (handles quoted fields, doubled quotes, embedded newlines) ----
function parseCsv(text) {
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
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  return rows.map(r => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] || "").trim()])));
}
function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(rows, columns) {
  return [columns.join(","), ...rows.map(r => columns.map(c => csvEscape(r[c])).join(","))].join("\n") + "\n";
}

// ---- minimal xlsx reader (ZIP central directory + inflateRaw) ----
function unzip(buf) {
  const files = {};
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error("not a zip/xlsx file");
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(off + 10);
    const csize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const cmtLen = buf.readUInt16LE(off + 32);
    const lho = buf.readUInt32LE(off + 42);
    const name = buf.toString("utf8", off + 46, off + 46 + nameLen);
    const start = lho + 30 + buf.readUInt16LE(lho + 26) + buf.readUInt16LE(lho + 28);
    const raw = buf.slice(start, start + csize);
    files[name] = method === 8 ? zlib.inflateRawSync(raw) : raw;
    off += 46 + nameLen + extraLen + cmtLen;
  }
  return files;
}
const xmlDecode = s => s
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&amp;/g, "&");

function readSheet(xlsxBuf) {
  const files = unzip(xlsxBuf);
  const shared = [];
  if (files["xl/sharedStrings.xml"]) {
    for (const m of files["xl/sharedStrings.xml"].toString("utf8").matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      shared.push(xmlDecode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => t[1]).join("")));
    }
  }
  const xml = files["xl/worksheets/sheet1.xml"].toString("utf8");
  const rows = [];
  for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = {};
    for (const cm of rm[1].matchAll(/<c ([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cm[1];
      const col = (attrs.match(/r="([A-Z]+)\d+"/) || [])[1];
      const type = (attrs.match(/t="([^"]*)"/) || [])[1];
      const v = (cm[2].match(/<v>([\s\S]*?)<\/v>/) || [])[1];
      const is = (cm[2].match(/<is>([\s\S]*?)<\/is>/) || [])[1];
      let val = "";
      if (type === "s" && v !== undefined) val = shared[+v] ?? "";
      else if (is) val = xmlDecode([...is.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => t[1]).join(""));
      else if (v !== undefined) val = xmlDecode(v);
      if (col) cells[col] = val.trim();
    }
    rows.push(cells);
  }
  return rows;
}

// ---- date normalization: "26  Apr,  2004" / "Thu, 11/18/2021 - 12:00" / "23/07/2015" ----
const MONTHS = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
function isoDate(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  let m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})[a-z]*,?\s+(\d{4})$/);           // 26 Apr, 2004
  if (m) return `${m[3]}-${MONTHS[m[2].slice(0, 3).toLowerCase()]}-${m[1].padStart(2, "0")}`;
  m = s.match(/(\d{2})\/(\d{2})\/(\d{4})\s*-/);                                // Thu, 11/18/2021 - 12:00 (US order)
  if (m) return `${m[3]}-${m[1]}-${m[2]}`;
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);                                  // 23/07/2015 (EMA, day first)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = s.match(/^\d{4}-\d{2}-\d{2}/);
  if (m) return m[0];
  return s; // unknown format — pass through verbatim rather than guess
}

// portfolio productId mapping — order matters (ALAQ before plain AL)
function mapProductId(text) {
  const t = String(text || "").toLowerCase();
  if (/ganaplacide/.test(t)) return "ganlum";
  if (/pyronaridine/.test(t) && /artesunate/.test(t)) return "pyramax";
  if (/(dihydroartemisinin|artenimol)/.test(t) && /piperaquine/.test(t)) return "dhappq";
  if (/artemether/.test(t) && /lumefantrine/.test(t) && /amodiaquine/.test(t)) return "alaq";
  if (/spatial emanator/.test(t)) return "emanators";
  return "";
}

// ---- normalizers: raw file → regulatory_events rows ----
function normalizeFpp(csvText, retrievedDate) {
  return parseCsv(csvText)
    .filter(r => r["Therapeutic Area"] === "Malaria")
    .map(r => ({
      refId: r["WHO Reference Number"],
      productId: mapProductId(r["INN, Dosage Form and Strength"]),
      productName: r["INN, Dosage Form and Strength"],
      authorityType: "WHO-PQ",
      authority: "WHO Prequalification (medicines)",
      iso3: "",
      event: /alternative/i.test(r["Basis of Listing"]) ? "listed (alternative)" : "prequalified",
      eventDate: isoDate(r["Date of Prequalification"]),
      procedure: r["Basis of alternative listing"] || r["Basis of Listing"],
      applicant: r["Applicant"],
      status: "",
      sourceUrl: SOURCES.fpp.page,
      retrievedDate,
    }));
}
function normalizeVc(csvText, retrievedDate) {
  return parseCsv(csvText).map(r => ({
    refId: r["PQT/VC Ref Number"],
    productId: mapProductId(r["Product Type"] + " " + r["Product Name"]),
    productName: `${r["Product Name"]} (${r["Product Type"]})`,
    authorityType: "WHO-PQ-VC",
    authority: "WHO Prequalification (vector control)",
    iso3: "",
    event: "prequalified",
    eventDate: isoDate(r["Date of Prequalification"]),
    procedure: r["Active Ingredient/Synergist"],
    applicant: r["Applicant"],
    status: "",
    sourceUrl: SOURCES.vc.page,
    retrievedDate,
  }));
}
function normalizeEma(xlsxBuf, retrievedDate) {
  const rows = readSheet(xlsxBuf);
  const hi = rows.findIndex(r => Object.values(r).includes("Name of medicine"));
  if (hi < 0) throw new Error("EMA xlsx: header row not found — layout changed?");
  const header = rows[hi]; // column letter -> column title
  const colOf = title => Object.keys(header).find(c => header[c].replace(/\s+/g, " ").startsWith(title));
  const cols = {
    name: colOf("Name of medicine"), number: colOf("EMA opinion number"),
    status: colOf("EMA opinion status"), inn: colOf("International non-proprietary name"),
    area: colOf("Therapeutic area"), opinionDate: colOf("Date of opinion"),
    outcomeDate: colOf("Date of outcome"), url: colOf("Opinion on medicines for use outside EU URL"),
  };
  return rows.slice(hi + 1)
    .filter(r => r[cols.number])
    .map(r => ({
      refId: r[cols.number],
      productId: mapProductId(`${r[cols.name]} ${r[cols.inn]}`),
      productName: `${r[cols.name]} — ${r[cols.inn]}`,
      authorityType: "SRA",
      authority: "EMA",
      iso3: "",
      event: "opinion (EU-M4all / Art. 58)",
      eventDate: isoDate(r[cols.opinionDate]),
      procedure: r[cols.area] ? `EU-M4all · ${r[cols.area]}` : "EU-M4all",
      applicant: "",
      status: `${r[cols.status]}${r[cols.outcomeDate] ? ` (outcome ${isoDate(r[cols.outcomeDate])})` : ""}`,
      sourceUrl: r[cols.url] || SOURCES.ema.page,
      retrievedDate,
    }));
}

// previous snapshot date = latest date before today with all three raw files
function previousDate() {
  if (!fs.existsSync(RAW_PQ) || !fs.existsSync(RAW_EMA)) return null;
  const dates = fs.readdirSync(RAW_PQ)
    .map(f => (f.match(/^(\d{4}-\d{2}-\d{2})-fpp\.csv$/) || [])[1])
    .filter(d => d && d < today &&
      fs.existsSync(path.join(RAW_PQ, `${d}-vector-control.csv`)) &&
      fs.existsSync(path.join(RAW_EMA, `${d}-opinions-outside-eu.xlsx`)))
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}

function diff(prevRows, rows) {
  const label = r => `${r.refId} — ${r.productName}${r.productId ? ` (**${r.productId}**)` : ""}`;
  const prevBy = new Map(prevRows.map(r => [`${r.authorityType}:${r.refId}`, r]));
  const currBy = new Map(rows.map(r => [`${r.authorityType}:${r.refId}`, r]));
  const changes = [];
  for (const [key, r] of currBy) {
    const old = prevBy.get(key);
    if (!old) { changes.push(`- **NEW** ${r.authorityType}: ${label(r)} · ${r.event} ${r.eventDate}`); continue; }
    for (const field of ["event", "eventDate", "status"]) {
      if (old[field] !== r[field]) changes.push(`- ${r.authorityType}: ${label(r)} — ${field}: \`${old[field] || "—"}\` → \`${r[field] || "—"}\``);
    }
  }
  for (const [key, old] of prevBy) {
    if (!currBy.has(key)) changes.push(`- **REMOVED** ${old.authorityType}: ${label(old)} — dropped from the list (check for suspension/delisting notice)`);
  }
  return changes;
}

(async () => {
  fs.mkdirSync(RAW_PQ, { recursive: true });
  fs.mkdirSync(RAW_EMA, { recursive: true });
  fs.mkdirSync(STAGING_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const prevDate = previousDate();

  const [fppBuf, vcBuf, emaBuf] = await Promise.all([
    fetchBuffer(SOURCES.fpp.url), fetchBuffer(SOURCES.vc.url), fetchBuffer(SOURCES.ema.url),
  ]);
  fs.writeFileSync(path.join(RAW_PQ, `${today}-fpp.csv`), fppBuf);
  fs.writeFileSync(path.join(RAW_PQ, `${today}-vector-control.csv`), vcBuf);
  fs.writeFileSync(path.join(RAW_EMA, `${today}-opinions-outside-eu.xlsx`), emaBuf);

  const rows = [
    ...normalizeFpp(fppBuf.toString("utf8"), today),
    ...normalizeVc(vcBuf.toString("utf8"), today),
    ...normalizeEma(emaBuf, today),
  ].sort((a, b) => a.authorityType.localeCompare(b.authorityType) || a.refId.localeCompare(b.refId));

  const columns = ["refId", "productId", "productName", "authorityType", "authority", "iso3",
    "event", "eventDate", "procedure", "applicant", "status", "sourceUrl", "retrievedDate"];
  fs.writeFileSync(path.join(STAGING_DIR, "regulatory_events.csv"), toCsv(rows, columns));

  const counts = rows.reduce((m, r) => (m[r.authorityType] = (m[r.authorityType] || 0) + 1, m), {});
  const portfolio = rows.filter(r => r.productId);
  console.log(`Rows: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(" · ")} (portfolio-matched: ${portfolio.length})`);

  let reportBody;
  if (!prevDate) {
    reportBody = `First snapshot — no previous run to diff against. ${rows.length} events staged.`;
  } else {
    const prevRows = [
      ...normalizeFpp(fs.readFileSync(path.join(RAW_PQ, `${prevDate}-fpp.csv`), "utf8"), prevDate),
      ...normalizeVc(fs.readFileSync(path.join(RAW_PQ, `${prevDate}-vector-control.csv`), "utf8"), prevDate),
      ...normalizeEma(fs.readFileSync(path.join(RAW_EMA, `${prevDate}-opinions-outside-eu.xlsx`)), prevDate),
    ];
    const changes = diff(prevRows, rows);
    reportBody = changes.length
      ? `Changes since ${prevDate}:\n\n${changes.join("\n")}`
      : `No changes since ${prevDate}. ${rows.length} events staged.`;
  }
  const report = `# Regulatory watch — ${today}\n\nSources: WHO PQ medicines + vector-control lists (CSV export), EMA EU-M4all opinions table (nightly).\n\n${reportBody}\n`;
  fs.writeFileSync(path.join(REPORT_DIR, `regulatory-watch-${today}.md`), report);

  console.log(`${rows.length} rows → sourcing/staging/regulatory_events.csv`);
  console.log(`Snapshots → sourcing/raw/whopq/${today}-*.csv, sourcing/raw/ema/${today}-opinions-outside-eu.xlsx`);
  console.log(`Report → sourcing/reports/regulatory-watch-${today}.md`);
  console.log("\n" + reportBody);
})().catch(err => { console.error(err.message || err); process.exit(1); });
