#!/usr/bin/env node
// Projects the data contract into the linked-data instance file
// ontology/launch-data.jsonld (JSON-LD, using ontology/context.jsonld and
// the classes/vocabularies defined in ontology/launch.ttl).
//
//   node scripts/build-ontology.js                                  # real data
//   node scripts/build-ontology.js data/products.synthetic.js out.jsonld
//
// Rules (see docs/ontology.md):
// - Generated output — regenerate after any data change, never hand-edit.
// - The 8 pathway-stage concepts and the glossary concepts are emitted from
//   the data file itself so they can never drift from the contract; the
//   fixed enumerations (status, level, class, phase, dataStatus) live in
//   launch.ttl and are only referenced here.
// - Governance semantics travel with the data: dataStatus, coverage status,
//   confirmedInWriting, bottleneck flags and "TBC" literals are all carried
//   through verbatim. Empty-string fields are omitted (not coerced).
// - Placeholder products are emitted as launch:PlaceholderProduct (identity
//   + note only), mirroring the dashboards, which render them greyed and
//   exclude them from stats.

const fs = require("fs");
const path = require("path");

const DATA_FILE = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(__dirname, "..", "data", "products.js");
const OUT_FILE = process.argv[3]
  ? path.resolve(process.cwd(), process.argv[3])
  : path.join(__dirname, "..", "ontology", "launch-data.jsonld");

// If the Pages URL ever changes (repo transfer), this is the one constant to
// edit — together with the matching prefixes in ontology/launch.ttl and
// ontology/context.jsonld.
const SITE = "https://kochrisdev.github.io/launch-transparency-dashboard";
const DATA_NS = SITE + "/ontology/launch-data.jsonld#";

// External alignments not stored in the data file: WHO ATC codes for the
// marketed combinations (the pipeline pair has no ATC code assigned yet).
// seeAlso points at the BioPortal ATC PURL for the same code.
const ATC = {
  pyramax: "P01BF06", // artesunate and pyronaridine
  dhappq: "P01BF05"   // artenimol (DHA) and piperaquine
};

// Wikidata items (owl:sameAs), verified against wikidata.org 2026-08-25.
// Products: only where an item for the actual COMBINATION exists — compound
// or brand items don't qualify (ganaplacide Q28209255 is the compound alone,
// Eurartesim Q29005826 is one brand of dhappq — neither is the product row).
const WIKIDATA_PRODUCT = {
  pyramax: "Q39053484", // artesunate/pyronaridine (fixed-dose combination)
  dhappq: "Q17048104"   // dihydroartemisinin/piperaquine
};
// Countries by ISO-3166 alpha-3 (Wikidata P298). Extend when a new country
// enters any product's list — the generator warns on a missing entry.
const WIKIDATA_COUNTRY = {
  BFA: "Q965", CHN: "Q148", CIV: "Q1008", CMR: "Q1009", COD: "Q974",
  GHA: "Q117", IDN: "Q252", IND: "Q668", KEN: "Q114", KHM: "Q424",
  LAO: "Q819", MLI: "Q912", MMR: "Q836", MOZ: "Q1029", NGA: "Q1033",
  RWA: "Q1037", SEN: "Q1041", THA: "Q869", TZA: "Q924", UGA: "Q1036",
  VNM: "Q881", ZMB: "Q953"
};
const wd = (qid) => "http://www.wikidata.org/entity/" + qid;

// Organization registry (generator-side enrichment — the contract's
// manufacturerLabel display string stays authoritative). QIDs verified
// against wikidata.org 2026-08-25; Guilin Pharmaceutical has no Wikidata
// item, so its node carries a name only.
const ORGS = {
  "novartis":     { name: "Novartis", qid: "Q507154" },
  "mmv":          { name: "Medicines for Malaria Venture", qid: "Q6806774" },
  "fosun-pharma": { name: "Fosun Pharmaceutical", qid: "Q11071241" },
  "moru":         { name: "Mahidol Oxford Tropical Medicine Research Unit", qid: "Q61931169" },
  "shin-poong":   { name: "Shin Poong Pharmaceutical", qid: "Q56583278" },
  "alfasigma":    { name: "Alfasigma", qid: "Q30268742" },
  "guilin-pharma": { name: "Guilin Pharmaceutical" },
  "sc-johnson":   { name: "S. C. Johnson & Son", qid: "Q683170" },
  // Pathway institutions. WHO's hats are distinct units (never conflate
  // recommender / quality assessor); GMP has no Wikidata item of its own.
  "who":          { name: "World Health Organization", qid: "Q7817" },
  "who-gmp":      { name: "WHO Global Malaria Programme", parent: "who" },
  "who-pq":       { name: "WHO Prequalification", qid: "Q105963063", parent: "who" },
  "ema":          { name: "European Medicines Agency", qid: "Q130146" },
  "fda":          { name: "United States Food and Drug Administration", qid: "Q204711" },
  "global-fund":  { name: "The Global Fund to Fight AIDS, Tuberculosis and Malaria", qid: "Q1414657" },
  "pmi":          { name: "President's Malaria Initiative", qid: "Q25101993" },
  "unicef":       { name: "UNICEF", qid: "Q740308" },
  "ama":          { name: "African Medicines Agency", qid: "Q97167520" }
};
// Which organizations play which role for each product. suppliedBy is not
// necessarily exhaustive ("…and other PQ'd suppliers" stays in the label).
const PRODUCT_ORGS = {
  ganlum:    { manufacturedBy: ["novartis"], coDevelopedBy: ["mmv"] },
  alaq:      { manufacturedBy: ["fosun-pharma"], coDevelopedBy: ["moru"] },
  pyramax:   { manufacturedBy: ["shin-poong"], coDevelopedBy: ["mmv"] },
  dhappq:    { manufacturedBy: ["alfasigma"], suppliedBy: ["guilin-pharma"] },
  emanators: { manufacturedBy: ["sc-johnson"] }
};

// Who runs each pathway gate (domain-primer §2), keyed by stage index —
// positional like everything else stage-related; a change to the stage list
// means updating this map. operatedBy links only concrete institutions;
// actor classes (manufacturers, national regulators, ministries) live in
// the note.
const STAGE_OPERATORS = [
  { orgs: [], note: "Manufacturer and product development partnerships — product-specific; see each product's manufacturedBy / coDevelopedBy." },
  { orgs: ["ema", "fda"], note: "Stringent regulatory authorities — for malaria medicines usually the EMA via the Article 58 / EU-M4all procedure." },
  { orgs: ["who-gmp"], note: "WHO Global Malaria Programme — its Guidelines Development Group weighs the evidence and decides whether WHO recommends." },
  { orgs: ["who-pq"], note: "WHO Prequalification — quality and manufacturing assessment, separate from the guideline decision." },
  { orgs: ["ama"], note: "National regulatory authorities, country by country — accelerated by the African Medicines Agency and WHO collaborative registration." },
  { orgs: [], note: "Ministries of health and national malaria control programmes — they write the national treatment guidelines." },
  { orgs: ["global-fund", "pmi", "unicef"], note: "Global Fund, US PMI, UNICEF, domestic budgets and procurement agents — tenders, reference pricing, forecasting." },
  { orgs: [], note: "Governments and implementing partners — supply chain, health-worker training, pharmacovigilance." }
];

// ---- load the contract (same extraction as validate-data.js) ---------------
const raw = fs.readFileSync(DATA_FILE, "utf8");
const m = raw.match(/^window\.LAUNCH_DATA\s*=\s*/m);
if (!m) {
  console.error(`ERROR: could not find \`window.LAUNCH_DATA = { ... }\` in ${path.relative(process.cwd(), DATA_FILE)}`);
  process.exit(1);
}
const data = JSON.parse(raw.slice(m.index + m[0].length).replace(/;?\s*$/, ""));

// ---- helpers ----------------------------------------------------------------
const id = (frag) => DATA_NS + frag;
const set = (obj, key, val) => {
  if (val === undefined || val === null || val === "") return;
  obj[key] = val;
};
const slug = (s) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Enrichment-completeness warnings apply to real data only — a synthetic
// dataset's fictional companies and countries are unmapped by design.
const warnGaps = !data.meta.synthetic;

const graph = [];

// ---- generated concepts: pathway stages + glossary ---------------------------
if (data.stages.length !== STAGE_OPERATORS.length && warnGaps)
  console.warn(`WARN: ${data.stages.length} stages but ${STAGE_OPERATORS.length} STAGE_OPERATORS entries — realign the map`);
data.stages.forEach((label, i) => {
  const node = {
    "@id": `launch:stage-${i}`,
    "@type": "Concept",
    "inScheme": "launch:PathwayStageScheme",
    "notation": String(i),
    "prefLabel": label,
    "stageIndex": i
  };
  const op = STAGE_OPERATORS[i];
  if (op) {
    const refs = op.orgs.filter((k) => ORGS[k]).map((k) => id(`org-${k}`));
    if (refs.length) node.operatedBy = refs.length === 1 ? refs[0] : refs;
    set(node, "operatorNote", op.note);
  }
  graph.push(node);
});

for (const [term, def] of Object.entries(data.glossary || {})) {
  graph.push({
    "@id": `launch:term-${slug(term)}`,
    "@type": "Concept",
    "inScheme": "launch:GlossaryScheme",
    "prefLabel": term,
    "definition": def
  });
}

// ---- countries (deduplicated across products) --------------------------------
const countries = new Set();
for (const p of data.products) {
  for (const c of ((p.detail || {}).countries || {}).list || []) countries.add(c.iso3);
}
for (const iso3 of [...countries].sort()) {
  const node = { "@id": id(`country-${iso3}`), "@type": "Country", "iso3": iso3 };
  if (WIKIDATA_COUNTRY[iso3]) node.sameAs = wd(WIKIDATA_COUNTRY[iso3]);
  else if (warnGaps) console.warn(`WARN: no Wikidata mapping for country ${iso3} — add it to WIKIDATA_COUNTRY`);
  graph.push(node);
}

// ---- organizations (those referenced by a product or a pathway stage) ----------
const usedOrgs = new Set();
for (const p of data.products) {
  const roles = PRODUCT_ORGS[p.id];
  if (!roles) { if (warnGaps) console.warn(`WARN: no organization registry entry for product "${p.id}" — add it to PRODUCT_ORGS`); continue; }
  Object.values(roles).flat().forEach((o) => usedOrgs.add(o));
}
STAGE_OPERATORS.forEach((op) => op.orgs.forEach((o) => usedOrgs.add(o)));
for (const key of [...usedOrgs]) {
  const parent = (ORGS[key] || {}).parent;
  if (parent) usedOrgs.add(parent);
}
for (const key of [...usedOrgs].sort()) {
  const o = ORGS[key];
  if (!o) { console.warn(`WARN: registry references unknown org "${key}" — add it to ORGS`); continue; }
  const node = { "@id": id(`org-${key}`), "@type": "Organization", "name": o.name };
  if (o.qid) node.sameAs = wd(o.qid);
  if (o.parent && ORGS[o.parent]) node.parentOrg = id(`org-${o.parent}`);
  graph.push(node);
}
const attachOrgs = (node, productId) => {
  const roles = PRODUCT_ORGS[productId] || {};
  for (const [role, keys] of Object.entries(roles)) {
    const refs = keys.filter((k) => ORGS[k]).map((k) => id(`org-${k}`));
    if (refs.length) node[role] = refs.length === 1 ? refs[0] : refs;
  }
};

// ---- products -----------------------------------------------------------------
const stageEntryCount = { total: 0 };
for (const p of data.products) {
  const pid = id(`product-${p.id}`);

  if (p.placeholder) {
    const node = { "@id": pid, "@type": "PlaceholderProduct", "name": p.name, "productId": p.id };
    set(node, "inn", p.inn);
    set(node, "manufacturerLabel", p.manufacturer);
    set(node, "classLabel", p.classLabel);
    set(node, "placeholderNote", p.note);
    attachOrgs(node, p.id);
    graph.push(node);
    continue;
  }

  const node = {
    "@id": pid,
    "@type": "Medicine",
    "name": p.name,
    "productId": p.id,
    "inn": p.inn,
    "manufacturerLabel": p.manufacturer,
    "classLabel": p.classLabel,
    "productClass": `launch:class-${p.class}`,
    "currentStage": `launch:stage-${p.currentStage}`
  };
  set(node, "developmentPhase", p.phase && `launch:phase-${p.phase}`);
  set(node, "bottleneckFlag", p.flag);
  if (ATC[p.id]) {
    node.atcCode = { "@type": "schema:MedicalCode", "codeValue": ATC[p.id], "codingSystem": "ATC" };
    node.seeAlso = `http://purl.bioontology.org/ontology/ATC/${ATC[p.id]}`;
  }
  if (WIKIDATA_PRODUCT[p.id]) node.sameAs = wd(WIKIDATA_PRODUCT[p.id]);
  attachOrgs(node, p.id);

  node.hasStageEntry = p.stages.map((s, i) => {
    stageEntryCount.total++;
    const e = {
      "@id": id(`product-${p.id}-stage-${i}`),
      "@type": "StageEntry",
      "atStage": `launch:stage-${i}`,
      "hasStatus": `launch:status-${s.status}`
    };
    set(e, "note", s.note);
    set(e, "dateLabel", s.date);
    set(e, "nextStep", s.next);
    set(e, "nextDate", s.nextDate);
    set(e, "source", s.source);
    set(e, "asOf", s.asOf);
    return e;
  });

  const d = p.detail || {};
  set(node, "useCase", d.useCase);
  if (Array.isArray(d.access) && d.access.length) node.accessCommitment = d.access;
  if (Array.isArray(d.adoption) && d.adoption.length) node.adoptionRequirement = d.adoption;

  if (d.price) {
    const pr = { "@id": id(`product-${p.id}-price`), "@type": "Price", "priceValue": d.price.value };
    set(pr, "note", d.price.note);
    set(pr, "source", d.price.source);
    if (typeof d.price.confirmedInWriting === "boolean") pr.confirmedInWriting = d.price.confirmedInWriting;
    set(pr, "asOf", d.price.asOf);
    node.hasPrice = pr;
  }

  if (d.research) {
    const r = { "@id": id(`product-${p.id}-research`), "@type": "OperationalResearch" };
    set(r, "researchLead", d.research.lead);
    set(r, "researchGeographies", d.research.geographies);
    set(r, "researchTimeline", d.research.timeline);
    set(r, "researchQuestion", d.research.question);
    node.hasResearch = r;
  }

  if (d.country) {
    set(node, "registeredCount", d.country.registered);
    set(node, "inGuidelinesCount", d.country.inGuidelines);
    set(node, "inMftCount", d.country.inMft);
    set(node, "forecastDemand", d.country.forecastDemand);
  }

  if (d.countries) {
    const cm = {
      "@id": id(`product-${p.id}-countrymap`),
      "@type": "CountryMap",
      "coverageStatus": `launch:coverage-${d.countries.status}`
    };
    set(cm, "note", d.countries.note);
    cm.hasCountryStatus = (d.countries.list || []).map((c) => ({
      "@id": id(`product-${p.id}-country-${c.iso3}`),
      "@type": "CountryAccessStatus",
      "country": id(`country-${c.iso3}`),
      "accessLevel": `launch:level-${c.level}`
    }));
    node.hasCountryMap = cm;
  }

  if (Array.isArray(d.journey)) {
    node.hasJourneyGate = d.journey.map((g, i) => ({
      "@id": id(`product-${p.id}-gate-${i}`),
      "@type": "JourneyGate",
      "gateLabel": g.label,
      "gateYear": g.year
    }));
  }

  if (d.volume) {
    const v = { "@id": id(`product-${p.id}-volume`), "@type": "ProcurementVolume" };
    set(v, "volumeTotal", d.volume.total);
    set(v, "volumePeriod", d.volume.period);
    set(v, "source", d.volume.source);
    if (Array.isArray(d.volume.split)) {
      v.hasSplit = d.volume.split.map((sp) => ({
        "@id": id(`product-${p.id}-split-${slug(sp.channel)}`),
        "@type": "VolumeSplit",
        "channel": sp.channel,
        "splitPct": sp.pct
      }));
    }
    node.hasVolume = v;
  } else {
    set(node, "volumeNote", d.volumeNote);
  }

  if (Array.isArray(d.milestones)) {
    node.hasMilestone = d.milestones.map((mrow, i) => {
      const mn = {
        "@id": id(`product-${p.id}-milestone-${i}`),
        "@type": "Milestone",
        "milestoneName": mrow.milestone,
        "hasStatus": `launch:status-${mrow.status}`
      };
      set(mn, "statusLabel", mrow.label);
      set(mn, "dateLabel", mrow.date);
      set(mn, "nextStep", mrow.next);
      set(mn, "anticipated", mrow.anticipated);
      set(mn, "source", mrow.source);
      return mn;
    });
  }

  graph.push(node);
}

// ---- dataset + changelog -------------------------------------------------------
const dataset = {
  "@id": id("dataset"),
  "@type": "Dataset",
  "lastUpdated": data.meta.lastUpdated,
  "dataStatus": `launch:datastatus-${data.meta.dataStatus}`,
  "tracksProduct": data.products.map((p) => id(`product-${p.id}`))
};
set(dataset, "host", data.meta.host);
if (typeof data.meta.synthetic === "boolean") dataset.synthetic = data.meta.synthetic;
graph.unshift(dataset);

(data.changelog || []).forEach((c, i) => {
  graph.push({
    "@id": id(`change-${i}`),
    "@type": "ChangelogEntry",
    "changeDate": c.date,
    "productDisplayName": c.product,
    "changeText": c.change
  });
});

// ---- write ----------------------------------------------------------------------
const doc = { "@context": SITE + "/ontology/context.jsonld", "@graph": graph };
fs.writeFileSync(OUT_FILE, JSON.stringify(doc, null, 2) + "\n");

const products = data.products.filter((p) => !p.placeholder).length;
console.log(
  `Wrote ${path.relative(process.cwd(), OUT_FILE)} — ${graph.length} nodes ` +
  `(${products} medicines, ${data.products.length - products} placeholder(s), ` +
  `${stageEntryCount.total} stage entries, ${countries.size} countries, ` +
  `${(data.changelog || []).length} changelog entries) from ${path.relative(process.cwd(), DATA_FILE)}`
);
