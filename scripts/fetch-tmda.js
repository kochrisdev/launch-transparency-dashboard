#!/usr/bin/env node
// TMDA (Tanzania) register pull — queries the TMDA IMIS2 public register of
// medicines for the portfolio's active-ingredient families, snapshots the
// raw records, normalizes a staging CSV of country-registration rows, and
// diffs against the previous snapshot:
//   node scripts/fetch-tmda.js
//
// Endpoint (Angular SPA's JSON backend, no auth needed):
//   1. configurations/getCommonMisParams?table_name=<base64 "par_common_names">
//      &section_id=2 — the generic-name lookup (~10k entries). Candidate ids
//      are those whose name mentions a portfolio ingredient family.
//   2. publicaccess/onSearchPublicRegisteredproducts?skip&take&section_id=2
//      &sub_modulesin=7,8,9,20&extra_paramsdata={..,"common_name_id":<id>,..}
//      — paged results with brand, certificate no., dates, status,
//      manufacturer, active ingredient.
//
// Outputs (see docs/data-sourcing-plan.md §4 — collection pipeline rules):
//   sourcing/raw/tmda/<date>.json            dated snapshot (raw records)
//   sourcing/staging/tmda_registrations.csv  portfolio rows, iso3=TZA
//   sourcing/reports/tmda-watch-<date>.md    what changed
//
// Second NRA register after NAFDAC (scripts/fetch-nafdac.js) — same staging
// shape and watch pattern. Only ever writes under sourcing/.
//
// Requires Node 18+ (global fetch). No dependencies.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const RAW_DIR = path.join(root, "sourcing", "raw", "tmda");
const STAGING_DIR = path.join(root, "sourcing", "staging");
const REPORT_DIR = path.join(root, "sourcing", "reports");

const BASE = "https://imis2.tmda.go.tz";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36";
const PAGE = 100;
const COMMON_NAMES_TABLE = Buffer.from("par_common_names").toString("base64"); // cGFyX2NvbW1vbl9uYW1lcw==

// ingredient families that select candidate common names; final rows are
// still filtered through mapProductId, so over-broad candidates are fine
const FAMILY = /pyronaridine|piperaquine|amodiaquine|ganaplacide/i;

const today = new Date().toISOString().slice(0, 10);

// same portfolio matching as the other fetchers
function mapProductId(text) {
  const t = String(text || "").toLowerCase();
  if (/ganaplacide/.test(t)) return "ganlum";
  if (/pyronaridine/.test(t) && /artesunate/.test(t)) return "pyramax";
  if (/(dihydroartemisinin|artenimol)/.test(t) && /piperaquine/.test(t)) return "dhappq";
  if (/artemether/.test(t) && /lumefantrine/.test(t) && /amodiaquine/.test(t)) return "alaq";
  return "";
}

async function getJson(url, attempt = 1) {
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (attempt >= 2) throw new Error(`TMDA request failed twice (${url.slice(0, 90)}…): ${e.message || e}`);
    return getJson(url, attempt + 1);
  }
}

async function searchByCommonName(id) {
  const extra = JSON.stringify({
    registration_no: "", brand_name: "", classification_id: "", common_name_id: String(id),
    product_form_id: "", market_authorisation_holder: "", country_id: "",
    manufacturer_name: "", man_country_id: "", local_represenatative: "", nationalID: "",
  });
  const records = [];
  let skip = 0, total = Infinity;
  while (skip < total) {
    const p = new URLSearchParams({ skip: String(skip), take: String(PAGE), section_id: "2", sub_modulesin: "7,8,9,20", extra_paramsdata: extra });
    const body = await getJson(`${BASE}/publicaccess/onSearchPublicRegisteredproducts?${p}`);
    total = body.totalCount ?? 0;
    records.push(...(body.data || []));
    skip += PAGE;
  }
  return records;
}

const isoDate = v => (v ? String(v).slice(0, 10) : "");
function toRow(r, commonName) {
  const basis = `${r.brand_name} ${r.generic_name} ${r.active_ingredient} ${commonName}`;
  return {
    productId: mapProductId(basis),
    iso3: "TZA",
    certificateNo: String(r.certificate_no || "").replace(/\s+/g, " ").trim(),
    nationalId: r.nationalID || "",
    brandName: r.brand_name || "",
    genericName: r.generic_name || "",
    activeIngredient: r.active_ingredient || "",
    form: r.dosage_form || "",
    strength: r.product_strength || "",
    manufacturer: r.manufacturer || "",
    manufacturerCountry: r.manufacturer_country || "",
    registrant: r.registrant || "",
    issueDate: isoDate(r.certificate_issue_date),
    expiryDate: isoDate(r.app_expiry_Date),
    status: r.registration_status || r.validity_status || "",
    sourceUrl: "https://imis2.tmda.go.tz/portal/#/public/registered-medicines",
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

function rowsFromSnapshot(snapshot) {
  return (snapshot.records || []).map(e => toRow(e.record, e.commonName)).filter(r => r.productId);
}

function diff(prevRows, rows) {
  const key = r => `${r.certificateNo}|${r.brandName}|${r.strength}`;
  const label = r => `${r.brandName} ${r.strength} (${r.certificateNo}${r.productId ? `, **${r.productId}**` : ""})`;
  const prevBy = new Map(prevRows.map(r => [key(r), r]));
  const currBy = new Map(rows.map(r => [key(r), r]));
  const changes = [];
  for (const [k, r] of currBy) {
    const old = prevBy.get(k);
    if (!old) { changes.push(`- **NEW** ${label(r)} — issued ${r.issueDate}, ${r.status}, ${r.manufacturer}`); continue; }
    for (const field of ["status", "expiryDate", "issueDate"]) {
      if (old[field] !== r[field]) changes.push(`- ${label(r)} — ${field}: \`${old[field] || "—"}\` → \`${r[field] || "—"}\``);
    }
  }
  for (const [k, old] of prevBy) {
    if (!currBy.has(k)) changes.push(`- **GONE** ${label(old)} — no longer returned by the register (check for deregistration/expiry)`);
  }
  return changes;
}

(async () => {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(STAGING_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const previous = loadPrevious();

  // 1. candidate common names
  const lookup = await getJson(`${BASE}/configurations/getCommonMisParams?table_name=${COMMON_NAMES_TABLE}&section_id=2`);
  const names = (lookup.data || lookup || []).filter(n => FAMILY.test(n.name || ""));
  console.log(`Common-name candidates: ${names.length}`);

  // 2. query each candidate id (sequential — be polite to the register)
  const byProductId = new Map();
  for (const n of names) {
    const recs = await searchByCommonName(n.id);
    for (const r of recs) {
      if (!byProductId.has(r.product_id)) byProductId.set(r.product_id, { record: r, commonName: n.name });
    }
    if (recs.length) console.log(`  ${n.id} "${String(n.name).slice(0, 50)}": ${recs.length}`);
  }
  const all = [...byProductId.values()];

  const rows = all.map(e => toRow(e.record, e.commonName)).filter(r => r.productId)
    .sort((a, b) => a.productId.localeCompare(b.productId) || a.certificateNo.localeCompare(b.certificateNo));

  fs.writeFileSync(path.join(RAW_DIR, `${today}.json`),
    JSON.stringify({ retrieved: today, source: BASE, candidateNames: names.map(n => ({ id: n.id, name: n.name })), records: all }, null, 1));

  const columns = ["productId", "iso3", "certificateNo", "nationalId", "brandName", "genericName",
    "activeIngredient", "form", "strength", "manufacturer", "manufacturerCountry", "registrant",
    "issueDate", "expiryDate", "status", "sourceUrl", "retrievedDate"];
  fs.writeFileSync(path.join(STAGING_DIR, "tmda_registrations.csv"), toCsv(rows, columns));

  let reportBody;
  if (!previous) {
    reportBody = `First snapshot — no previous run to diff against. ${rows.length} portfolio registrations staged (${all.length} raw records across ${names.length} candidate names).`;
  } else {
    const changes = diff(rowsFromSnapshot(previous.snapshot), rows);
    reportBody = changes.length
      ? `Changes since ${previous.date}:\n\n${changes.join("\n")}`
      : `No changes since ${previous.date}. ${rows.length} portfolio registrations staged.`;
  }
  const report = `# TMDA watch — ${today}\n\nSource: TMDA IMIS2 public register of medicines (Tanzania), imis2.tmda.go.tz.\n\n${reportBody}\n`;
  fs.writeFileSync(path.join(REPORT_DIR, `tmda-watch-${today}.md`), report);

  const byProduct = rows.reduce((m, r) => (m[r.productId] = (m[r.productId] || 0) + 1, m), {});
  console.log(`\n${rows.length} portfolio rows (${Object.entries(byProduct).map(([k, v]) => `${k} ${v}`).join(" · ") || "none"}) → sourcing/staging/tmda_registrations.csv`);
  console.log(`Snapshot → sourcing/raw/tmda/${today}.json`);
  console.log(`Report → sourcing/reports/tmda-watch-${today}.md`);
  console.log("\n" + reportBody);
})().catch(err => { console.error(err.message || err); process.exit(1); });
