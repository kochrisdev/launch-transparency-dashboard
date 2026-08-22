#!/usr/bin/env node
// Trial watch — fetches ClinicalTrials.gov (API v2) records for the portfolio
// products, snapshots them, normalizes a staging CSV, and diffs against the
// previous snapshot so slipped dates / status changes surface early:
//   node scripts/fetch-trials.js
//
// Outputs (see docs/data-sourcing-plan.md §4 — collection pipeline rules):
//   sourcing/raw/clinicaltrials/<date>.json   append-only dated snapshot
//   sourcing/staging/trials.csv               regenerated staging dataset
//   sourcing/reports/trials-watch-<date>.md   what changed vs previous snapshot
//
// This script only ever writes under sourcing/ — never data/products.js.
// Findings become dashboard edits by analyst decision (validator = the gate).
//
// Requires Node 18+ (global fetch). No dependencies. CT.gov rate limit is
// ~50 req/min; this makes one request per page per product (a handful total).

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const RAW_DIR = path.join(root, "sourcing", "raw", "clinicaltrials");
const STAGING_DIR = path.join(root, "sourcing", "staging");
const REPORT_DIR = path.join(root, "sourcing", "reports");

const API = "https://clinicaltrials.gov/api/v2/studies";
const FIELDS = [
  "protocolSection.identificationModule",
  "protocolSection.statusModule",
  "protocolSection.designModule",
  "protocolSection.sponsorCollaboratorsModule",
  "hasResults",
].join(",");

// Search terms per product (Essie expressions on the intervention field).
// `cond` narrows large legacy sets; the small pipeline products go unfiltered
// so Phase I / healthy-volunteer supporting studies are captured too.
const PRODUCTS = [
  { id: "ganlum", intr: "ganaplacide OR KAF156 OR KLU156" },
  { id: "alaq", intr: "artemether AND lumefantrine AND amodiaquine" },
  { id: "pyramax", intr: '"pyronaridine-artesunate" OR pyramax' },
  { id: "dhappq", intr: '"dihydroartemisinin-piperaquine" OR eurartesim', cond: "malaria" },
];

const today = new Date().toISOString().slice(0, 10);

async function fetchStudies(product) {
  const studies = [];
  let pageToken = null;
  do {
    const url = new URL(API);
    url.searchParams.set("query.intr", product.intr);
    if (product.cond) url.searchParams.set("query.cond", product.cond);
    url.searchParams.set("fields", FIELDS);
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${product.id}: HTTP ${res.status} from ${url}`);
    const body = await res.json();
    studies.push(...(body.studies || []));
    pageToken = body.nextPageToken || null;
  } while (pageToken);
  return studies;
}

// flatten one API study into the staging row shape
function toRow(productId, study) {
  const p = study.protocolSection || {};
  const idm = p.identificationModule || {};
  const st = p.statusModule || {};
  const dsg = p.designModule || {};
  const sp = p.sponsorCollaboratorsModule || {};
  const nctId = idm.nctId || "";
  return {
    productId,
    nctId,
    briefTitle: idm.briefTitle || "",
    phase: (dsg.phases || []).join("|"),
    studyType: dsg.studyType || "",
    overallStatus: st.overallStatus || "",
    leadSponsor: (sp.leadSponsor || {}).name || "",
    enrollment: (dsg.enrollmentInfo || {}).count ?? "",
    startDate: (st.startDateStruct || {}).date || "",
    primaryCompletionDate: (st.primaryCompletionDateStruct || {}).date || "",
    completionDate: (st.completionDateStruct || {}).date || "",
    lastUpdatePostDate: (st.lastUpdatePostDateStruct || {}).date || "",
    hasResults: study.hasResults === true,
    sourceUrl: nctId ? `https://clinicaltrials.gov/study/${nctId}` : "",
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

// previous snapshot = latest dated file in RAW_DIR before today's
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

function diffRows(prevRows, rows) {
  const prevBy = new Map(prevRows.map(r => [`${r.productId}:${r.nctId}`, r]));
  const currBy = new Map(rows.map(r => [`${r.productId}:${r.nctId}`, r]));
  const changes = [];
  for (const [key, r] of currBy) {
    const old = prevBy.get(key);
    if (!old) { changes.push(`- **NEW** [${r.nctId}](${r.sourceUrl}) (${r.productId}) — ${r.briefTitle} · ${r.overallStatus}`); continue; }
    const watched = [
      ["overallStatus", "status"],
      ["primaryCompletionDate", "primary completion"],
      ["completionDate", "completion"],
      ["phase", "phase"],
      ["hasResults", "results posted"],
    ];
    for (const [field, label] of watched) {
      if (String(old[field]) !== String(r[field])) {
        changes.push(`- [${r.nctId}](${r.sourceUrl}) (${r.productId}) — ${label}: \`${old[field] || "—"}\` → \`${r[field] || "—"}\``);
      }
    }
  }
  for (const [key, old] of prevBy) {
    if (!currBy.has(key)) changes.push(`- **GONE** ${old.nctId} (${old.productId}) — no longer matches the search (check registry)`);
  }
  return changes;
}

(async () => {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(STAGING_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const previous = loadPrevious();

  const byProduct = {};
  const rows = [];
  for (const product of PRODUCTS) {
    const studies = await fetchStudies(product);
    byProduct[product.id] = studies;
    for (const s of studies) rows.push(toRow(product.id, s));
    console.log(`${product.id}: ${studies.length} trials`);
  }
  rows.sort((a, b) => a.productId.localeCompare(b.productId) || a.nctId.localeCompare(b.nctId));

  // raw snapshot (append-only; same-day rerun overwrites today's file only)
  const rawPath = path.join(RAW_DIR, `${today}.json`);
  fs.writeFileSync(rawPath, JSON.stringify({ retrieved: today, source: API, products: byProduct }, null, 1));

  // staging CSV
  const columns = ["productId", "nctId", "briefTitle", "phase", "studyType", "overallStatus",
    "leadSponsor", "enrollment", "startDate", "primaryCompletionDate", "completionDate",
    "lastUpdatePostDate", "hasResults", "sourceUrl", "retrievedDate"];
  fs.writeFileSync(path.join(STAGING_DIR, "trials.csv"), toCsv(rows, columns));

  // watch report vs previous snapshot
  let reportBody;
  if (!previous) {
    reportBody = `First snapshot — no previous run to diff against. ${rows.length} trials tracked.`;
  } else {
    const prevRows = [];
    for (const [productId, studies] of Object.entries(previous.snapshot.products || {})) {
      for (const s of studies) prevRows.push(toRow(productId, s));
    }
    const changes = diffRows(prevRows, rows);
    reportBody = changes.length
      ? `Changes since ${previous.date}:\n\n${changes.join("\n")}`
      : `No changes since ${previous.date}. ${rows.length} trials tracked.`;
  }
  const report = `# Trial watch — ${today}\n\nSource: ClinicalTrials.gov API v2 (US public domain).\n\n${reportBody}\n`;
  fs.writeFileSync(path.join(REPORT_DIR, `trials-watch-${today}.md`), report);

  console.log(`\n${rows.length} rows → sourcing/staging/trials.csv`);
  console.log(`Snapshot → sourcing/raw/clinicaltrials/${today}.json`);
  console.log(`Report → sourcing/reports/trials-watch-${today}.md`);
  console.log("\n" + reportBody);
})().catch(err => { console.error(err.message || err); process.exit(1); });
