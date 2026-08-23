#!/usr/bin/env node
// Validates data/products.js (or another data file passed as the first
// argument, e.g. the synthetic development set). Run after every data edit:
//   node scripts/validate-data.js
//   node scripts/validate-data.js data/products.synthetic.js
// Exits 1 on any error (bad JSON, broken rules); prints warnings for
// missing provenance. Rules are the governance of the dashboard — a
// traffic light must never be able to lie silently.

const fs = require("fs");
const path = require("path");

const FILE = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(__dirname, "..", "data", "products.js");
const STATUSES = ["done", "prog", "late", "idle"];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---- extract the strict-JSON body -----------------------------------------
const raw = fs.readFileSync(FILE, "utf8");
// Anchor to line start so the mention in the comment header doesn't match.
const m = raw.match(/^window\.LAUNCH_DATA\s*=\s*/m);
if (!m) {
  console.error(`ERROR: could not find \`window.LAUNCH_DATA = { ... }\` at a line start in ${path.relative(process.cwd(), FILE)}`);
  process.exit(1);
}
const body = raw.slice(m.index + m[0].length).replace(/;?\s*$/, "");
let data;
try {
  data = JSON.parse(body);
} catch (e) {
  console.error("ERROR: data body is not strict JSON — " + e.message);
  console.error("Check for single quotes, trailing commas, or comments inside the object.");
  process.exit(1);
}

// ---- meta ------------------------------------------------------------------
const DATA_STATUSES = ["illustrative", "draft", "live"];
if (!data.meta) err("meta: missing");
else {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.meta.lastUpdated || ""))
    err(`meta.lastUpdated: must be YYYY-MM-DD, got "${data.meta.lastUpdated}"`);
  if (!DATA_STATUSES.includes(data.meta.dataStatus))
    err(`meta.dataStatus: must be one of ${DATA_STATUSES.join("/")} (controls the on-page banner), got "${data.meta.dataStatus}"`);
}

// ---- glossary ----------------------------------------------------------------
if (data.glossary !== undefined) {
  if (typeof data.glossary !== "object" || Array.isArray(data.glossary)) err("glossary: must be an object of term → definition");
  else for (const [term, def] of Object.entries(data.glossary)) {
    if (!term.trim()) err("glossary: empty term key");
    if (typeof def !== "string" || def.trim().length < 20) err(`glossary["${term}"]: definition must be a real sentence`);
  }
}

// ---- changelog ---------------------------------------------------------------
if (data.changelog !== undefined) {
  if (!Array.isArray(data.changelog)) err("changelog: must be an array");
  else {
    data.changelog.forEach((c, ci) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date || "")) err(`changelog[${ci}]: date must be YYYY-MM-DD`);
      if (!c.product) err(`changelog[${ci}]: "product" is required (product name or "All")`);
      if (!c.change || c.change.trim().length < 10) err(`changelog[${ci}]: "change" must describe what changed`);
      // The RSS feed takes the first N entries as the newest — order matters.
      if (ci > 0 && (data.changelog[ci - 1].date || "") < (c.date || ""))
        warn(`changelog[${ci}]: dates not newest-first ("${data.changelog[ci - 1].date}" before "${c.date}") — the feed would drop the newest entries`);
    });
  }
}

// ---- stages ----------------------------------------------------------------
if (!Array.isArray(data.stages) || data.stages.length < 2)
  err("stages: must be an array of stage names");
else if (data.stages.some((s) => typeof s !== "string" || !s.trim()))
  err("stages: every entry must be a non-empty string");
const nStages = Array.isArray(data.stages) ? data.stages.length : 0;

// ---- products ----------------------------------------------------------------
if (!Array.isArray(data.products) || data.products.length === 0) {
  err("products: must be a non-empty array");
} else {
  const ids = new Set();
  data.products.forEach((p, pi) => {
    const tag = `products[${pi}] (${p.id || p.name || "?"})`;
    if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) err(`${tag}: id required (lowercase letters/digits/hyphens)`);
    if (ids.has(p.id)) err(`${tag}: duplicate id "${p.id}"`);
    ids.add(p.id);
    for (const k of ["name", "inn", "manufacturer", "classLabel"])
      if (!p[k]) err(`${tag}: "${k}" is required`);

    // Placeholder rows (e.g. spatial emanators) only need identity + note.
    if (p.placeholder) {
      if (!p.note) err(`${tag}: placeholder products need a "note"`);
      return;
    }

    if (!["pipeline", "market"].includes(p.class))
      err(`${tag}: class must be "pipeline" or "market", got "${p.class}"`);
    const PHASES = ["preclinical", "phase1", "phase2", "phase3", "regulatory", "access"];
    if (p.phase !== undefined && !PHASES.includes(p.phase))
      err(`${tag}: phase must be one of ${PHASES.join("/")}, got "${p.phase}"`);
    if (p.phase === undefined)
      warn(`${tag}: no "phase" — the product will not appear on the pipeline poster view`);

    // stage track
    if (!Array.isArray(p.stages) || p.stages.length !== nStages) {
      err(`${tag}: stages must have exactly ${nStages} entries (one per stage), got ${p.stages ? p.stages.length : 0}`);
    } else {
      let hasLate = false;
      p.stages.forEach((s, si) => {
        const stag = `${tag} stage "${data.stages[si]}"`;
        if (!STATUSES.includes(s.status)) err(`${stag}: status must be one of ${STATUSES.join("/")}, got "${s.status}"`);
        if (s.status === "late") {
          hasLate = true;
          if (!s.note || s.note.trim().length < 15)
            err(`${stag}: a delayed stage must carry a substantive reason in "note"`);
        }
        if (s.status !== "idle" && !s.asOf)
          warn(`${stag}: no "asOf" verification date`);
        if (s.asOf && !/^\d{4}-\d{2}-\d{2}$/.test(s.asOf))
          err(`${stag}: asOf must be YYYY-MM-DD, got "${s.asOf}"`);
      });
      if (hasLate && !p.flag)
        err(`${tag}: has a delayed stage but no top-level "flag" sentence explaining the bottleneck`);
      if (!hasLate && p.flag)
        warn(`${tag}: has a "flag" but no stage is marked late — flag will show without a red light`);
    }
    if (!Number.isInteger(p.currentStage) || p.currentStage < 0 || p.currentStage >= nStages)
      err(`${tag}: currentStage must be an integer 0–${nStages - 1}`);

    // detail
    const d = p.detail;
    if (!d) { err(`${tag}: "detail" is required`); return; }
    // == null also catches JSON null — a null shape must not slip past the
    // governance rules below (a null price would skip the price rule entirely).
    for (const k of ["price", "useCase", "access", "adoption", "research", "country", "milestones"])
      if (d[k] == null) err(`${tag}: detail.${k} is required (and must not be null)`);

    if (d.price != null && (typeof d.price !== "object" || Array.isArray(d.price)))
      err(`${tag}: detail.price must be an object`);
    else if (d.price) {
      if (typeof d.price.confirmedInWriting !== "boolean")
        err(`${tag}: detail.price.confirmedInWriting must be true or false`);
      const shown = d.price.value && !["TBC", "TBD", "—", "-"].includes(d.price.value.trim());
      if (shown && !d.price.confirmedInWriting && !d.price.source)
        err(`${tag}: a displayed price needs confirmedInWriting=true or a public "source" — governance rule`);
      if (shown && !d.price.asOf) warn(`${tag}: detail.price has no "asOf" date`);
    }
    if (d.country != null && (typeof d.country !== "object" || Array.isArray(d.country)))
      err(`${tag}: detail.country must be an object`);
    else if (d.country) {
      for (const k of ["registered", "inGuidelines", "inMft"]) {
        const v = d.country[k];
        // "TBC" is the honest value for a count we haven't verified yet —
        // an invented number is worse than an admitted gap.
        if (v !== "TBC" && (!Number.isInteger(v) || v < 0))
          err(`${tag}: detail.country.${k} must be a non-negative integer or "TBC"`);
      }
    }
    if (d.countries !== undefined) {
      const c = d.countries;
      if (!["illustrative", "draft", "verified"].includes(c.status))
        err(`${tag}: detail.countries.status must be illustrative/draft/verified`);
      if (c.status !== "verified" && (!c.note || c.note.trim().length < 20))
        err(`${tag}: unverified detail.countries needs a substantive "note" (shown as the map warning)`);
      if (!Array.isArray(c.list) || !c.list.length) err(`${tag}: detail.countries.list must be a non-empty array`);
      else {
        const seenIso = new Set();
        c.list.forEach((e, ei) => {
          if (!/^[A-Z]{3}$/.test(e.iso3 || "")) err(`${tag}: countries.list[${ei}].iso3 must be a 3-letter uppercase ISO code`);
          if (seenIso.has(e.iso3)) err(`${tag}: countries.list has duplicate iso3 "${e.iso3}"`);
          seenIso.add(e.iso3);
          if (!["registered", "guidelines", "mft"].includes(e.level))
            err(`${tag}: countries.list[${ei}].level must be registered/guidelines/mft`);
        });
      }
    }
    if (d.journey !== undefined) {
      if (!Array.isArray(d.journey) || d.journey.length < 2) err(`${tag}: detail.journey must be an array of at least 2 gates`);
      else {
        let prev = null;
        d.journey.forEach((g, gi) => {
          if (!g.label || !g.label.trim()) err(`${tag}: journey[${gi}] needs a "label"`);
          const y = g.year;
          if (y !== "TBC" && (!Number.isInteger(y) || y < 1990 || y > 2100))
            err(`${tag}: journey[${gi}].year must be a year (1990–2100) or "TBC"`);
          if (Number.isInteger(y) && Number.isInteger(prev) && y < prev)
            warn(`${tag}: journey[${gi}] year ${y} is earlier than the previous gate (${prev}) — check the order`);
          if (Number.isInteger(y)) prev = y;
        });
      }
    }
    if (d.volume == null && !d.volumeNote)
      warn(`${tag}: no volume data and no "volumeNote" explaining why`);
    if (d.volume) {
      if (!d.volume.total || !d.volume.period || !Array.isArray(d.volume.split))
        err(`${tag}: detail.volume needs total, period and split[]`);
      else {
        const sum = d.volume.split.reduce((a, s) => a + (s.pct || 0), 0);
        if (Math.abs(sum - 100) > 1) err(`${tag}: detail.volume.split percentages sum to ${sum}, expected 100`);
        d.volume.split.forEach((s) => { if (!s.channel) err(`${tag}: every volume split entry needs a "channel"`); });
      }
    }
    if (d.milestones != null && !Array.isArray(d.milestones)) {
      err(`${tag}: detail.milestones must be an array`);
    } else if (Array.isArray(d.milestones)) {
      d.milestones.forEach((mrow, mi) => {
        const mtag = `${tag} milestone[${mi}]`;
        for (const k of ["milestone", "status", "label", "date", "next", "anticipated"])
          if (mrow[k] === undefined) err(`${mtag}: "${k}" is required`);
        if (!STATUSES.includes(mrow.status)) err(`${mtag}: bad status "${mrow.status}"`);
        if (mrow.status === "done" && (!mrow.source || !mrow.source.trim()))
          warn(`${mtag}: completed milestone "${mrow.milestone}" has no source citation`);
      });
    }
  });
}

// ---- report -----------------------------------------------------------------
for (const w of warnings) console.log("WARN  " + w);
for (const e of errors) console.log("ERROR " + e);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
if (errors.length) {
  console.log("Fix the errors above before committing — the dashboard must not publish inconsistent data.");
  process.exit(1);
}
console.log("Data file is valid.");
