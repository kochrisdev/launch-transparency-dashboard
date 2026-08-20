#!/usr/bin/env node
// Exports the LAUNCH data contract as flat CSVs for Power BI (offline path).
//   node powerbi/export-powerbi-data.js
// The online path (Power Query loading the live URL) is in queries.m and
// needs no export at all — use these CSVs only when working disconnected.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(__dirname, "data");
fs.mkdirSync(outDir, { recursive: true });

const raw = fs.readFileSync(path.join(root, "data", "products.js"), "utf8");
const m = raw.match(/^window\.LAUNCH_DATA\s*=\s*/m);
const data = JSON.parse(raw.slice(m.index + m[0].length).replace(/;?\s*$/, ""));

const STATUS_LABEL = { done: "Complete", prog: "In progress", late: "Delayed", idle: "Not started" };
const STATUS_RANK = { idle: 0, late: 1, prog: 2, done: 3 };
const LEVEL_RANK = { registered: 1, guidelines: 2, mft: 3 };

const cell = v => {
  v = String(v == null ? "" : v);
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};
function write(name, header, rows) {
  const csv = "﻿" + [header, ...rows].map(r => r.map(cell).join(",")).join("\r\n");
  fs.writeFileSync(path.join(outDir, name), csv);
  console.log(`${name}: ${rows.length} rows`);
}

const tracked = data.products.filter(p => !p.placeholder);

write("meta.csv", ["lastUpdated", "dataStatus", "host"],
  [[data.meta.lastUpdated, data.meta.dataStatus, data.meta.host || ""]]);

write("products.csv",
  ["productId", "name", "inn", "manufacturer", "class", "classLabel", "phase",
   "currentStageIndex", "currentStageName", "flag", "priceValue", "priceNote",
   "priceConfirmedInWriting", "useCase", "registered", "inGuidelines", "inMft", "forecastDemand"],
  tracked.map(p => [p.id, p.name, p.inn, p.manufacturer, p.class, p.classLabel, p.phase || "",
    p.currentStage, data.stages[p.currentStage], p.flag || "",
    p.detail.price.value, p.detail.price.note || "", p.detail.price.confirmedInWriting,
    p.detail.useCase, p.detail.country.registered, p.detail.country.inGuidelines,
    p.detail.country.inMft, p.detail.country.forecastDemand]));

write("stages.csv",
  ["productId", "productName", "stageIndex", "stageName", "status", "statusLabel",
   "statusRank", "note", "date", "nextStep", "anticipated", "source", "asOf"],
  tracked.flatMap(p => p.stages.map((s, i) =>
    [p.id, p.name, i, data.stages[i], s.status, STATUS_LABEL[s.status], STATUS_RANK[s.status],
     s.note || "", s.date || "", s.next || "", s.nextDate || "", s.source || "", s.asOf || ""])));

write("milestones.csv",
  ["productId", "productName", "milestone", "status", "statusLabel", "label",
   "date", "nextStep", "anticipated", "source"],
  tracked.flatMap(p => (p.detail.milestones || []).map(mi =>
    [p.id, p.name, mi.milestone, mi.status, STATUS_LABEL[mi.status], mi.label || "",
     mi.date || "", mi.next || "", mi.anticipated || "", mi.source || ""])));

write("countries.csv",
  ["productId", "productName", "iso3", "level", "levelLabel", "levelRank", "dataStatus"],
  tracked.flatMap(p => {
    const c = p.detail.countries;
    if (!c) return [];
    return c.list.map(e => [p.id, p.name, e.iso3, e.level,
      { registered: "Registered", guidelines: "In national guidelines", mft: "In MFT plans" }[e.level],
      LEVEL_RANK[e.level], c.status]);
  }));

write("journeyGates.csv",
  ["productId", "productName", "gateIndex", "gateLabel", "year"],
  tracked.flatMap(p => (p.detail.journey || []).map((g, i) =>
    [p.id, p.name, i, g.label, g.year])));

const nowYear = parseInt(data.meta.lastUpdated.slice(0, 4), 10);
write("journeySegments.csv",
  ["productId", "productName", "fromGate", "toGate", "startYear", "endYear", "years", "pace"],
  tracked.flatMap(p => {
    const dated = (p.detail.journey || []).filter(g => Number.isInteger(g.year));
    if (dated.length < 2) return [];
    const rows = [];
    for (let i = 1; i < dated.length; i++) {
      const gap = dated[i].year - dated[i - 1].year;
      if (!gap) continue;
      rows.push([p.id, p.name, dated[i - 1].label, dated[i].label, dated[i - 1].year, dated[i].year,
        gap, gap <= 2 ? "On track" : gap <= 5 ? "Slow" : "Delayed"]);
    }
    const last = dated[dated.length - 1];
    if ((p.detail.journey || []).some(g => g.year === "TBC") && last.year < nowYear)
      rows.push([p.id, p.name, last.label, "next gate (pending)", last.year, nowYear,
        nowYear - last.year, "Pending"]);
    return rows;
  }));

write("changelog.csv", ["date", "product", "change"],
  (data.changelog || []).map(c => [c.date, c.product, c.change]));

console.log("Done -> powerbi/data/");
