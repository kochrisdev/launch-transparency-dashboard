#!/usr/bin/env node
// Projects the append-only history/ snapshots into the temporal knowledge
// graph ontology/launch-history.jsonld: one launch:StatusPeriod per
// continuous run of snapshots in which a product held one traffic-light
// status at one pathway stage.
//
//   node scripts/build-history-graph.js [outFile]
//
// Semantics (documented in docs/ontology.md):
// - validFrom  = date of the FIRST snapshot observing the status. The actual
//   change happened between the previous snapshot and that one — snapshot
//   dates bound a change, they don't pinpoint it.
// - validUntil = date of the first snapshot observing a DIFFERENT status
//   (exclusive). Absent on the current, open period.
// - Snapshots whose stage-array length differs from the current stage list
//   are skipped with a warning (the same positional-diff discontinuity
//   caveat as make-brief.js).
// - The live data/products.js is included as the newest observation when
//   meta.lastUpdated is newer than the last snapshot (normally they match —
//   publish.yml snapshots every data change).
//
// Generated output, bot-rebuilt by publish.yml on data changes — regenerate,
// never hand-edit. Zero dependencies.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_FILE = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(ROOT, "ontology", "launch-history.jsonld");

const SITE = "https://kochrisdev.github.io/launch-transparency-dashboard";
const DATA_NS = SITE + "/ontology/launch-data.jsonld#";
const HIST_NS = SITE + "/ontology/launch-history.jsonld#";

function load(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^window\.LAUNCH_DATA\s*=\s*/m);
  if (!m) throw new Error(`no window.LAUNCH_DATA in ${file}`);
  return JSON.parse(raw.slice(m.index + m[0].length).replace(/;?\s*$/, ""));
}

// ---- collect observations, oldest first --------------------------------------
const snapshots = fs.readdirSync(path.join(ROOT, "history"))
  .filter((f) => /^products-\d{4}-\d{2}-\d{2}\.js$/.test(f))
  .sort()
  .map((f) => load(path.join(ROOT, "history", f)));

const live = load(path.join(ROOT, "data", "products.js"));
const lastSnapDate = snapshots.length ? snapshots[snapshots.length - 1].meta.lastUpdated : "";
if (live.meta.lastUpdated > lastSnapDate) snapshots.push(live);
if (!snapshots.length) { console.error("ERROR: no history snapshots found"); process.exit(1); }

const nStages = live.stages.length;
const usable = snapshots.filter((s) => {
  const ok = s.products.filter((p) => !p.placeholder).every((p) => (p.stages || []).length === nStages);
  if (!ok) console.warn(`WARN: skipping snapshot ${s.meta.lastUpdated} — stage-array shape differs from the current ${nStages}-stage list (positional diff would misreport)`);
  return ok;
});

// ---- build runs per product × stage --------------------------------------------
// runs[productId][stageIndex] = [{ status, from, until? }, ...]
const runs = {};
for (const snap of usable) {
  const date = snap.meta.lastUpdated;
  for (const p of snap.products) {
    if (p.placeholder || !Array.isArray(p.stages)) continue;
    const perStage = (runs[p.id] = runs[p.id] || Array.from({ length: nStages }, () => []));
    p.stages.forEach((s, i) => {
      const track = perStage[i];
      const last = track[track.length - 1];
      if (last && !last.until) {
        if (last.status === s.status) return; // run continues
        last.until = date;                    // close it at this observation
      }
      track.push({ status: s.status, from: date });
    });
  }
}

// ---- emit -------------------------------------------------------------------------
const graph = [];
let periods = 0, closed = 0;
for (const [pid, perStage] of Object.entries(runs)) {
  perStage.forEach((track, i) => {
    track.forEach((run, n) => {
      periods++;
      const node = {
        "@id": HIST_NS + `period-${pid}-s${i}-${n}`,
        "@type": "StatusPeriod",
        "periodProduct": DATA_NS + `product-${pid}`,
        "atStage": `launch:stage-${i}`,
        "hasStatus": `launch:status-${run.status}`,
        "validFrom": run.from
      };
      if (run.until) { node.validUntil = run.until; closed++; }
      graph.push(node);
    });
  });
}
graph.unshift({
  "@id": HIST_NS + "history",
  "@type": "HistoryGraph",
  "firstSnapshot": usable[0].meta.lastUpdated,
  "lastSnapshot": usable[usable.length - 1].meta.lastUpdated,
  "snapshotCount": usable.length
});

fs.writeFileSync(OUT_FILE, JSON.stringify(
  { "@context": SITE + "/ontology/context.jsonld", "@graph": graph }, null, 2) + "\n");

console.log(
  `Wrote ${path.relative(process.cwd(), OUT_FILE)} — ${periods} status periods ` +
  `(${closed} closed, ${periods - closed} open) from ${usable.length} snapshot(s), ` +
  `${usable[0].meta.lastUpdated} → ${usable[usable.length - 1].meta.lastUpdated}`
);
