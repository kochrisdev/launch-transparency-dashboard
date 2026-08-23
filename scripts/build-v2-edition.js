#!/usr/bin/env node
// Generates the VERSION 2 PREVIEW edition of the dashboards into v2/ —
// the same pages as the originals, pointed at data/products.v2.js (the v1
// dataset plus proposed updates from the public-source staging layer:
// Global Fund PQR volumes, WHO PQ listings, EMA EU-M4all dates,
// ClinicalTrials.gov records). The root dashboards and data/products.js
// are never touched — v1 stays live while v2 is reviewed.
//
//   node scripts/build-v2-edition.js
//
// Approach (same pattern as build-synthetic-edition.js): copy each page,
// rewrite the data <script> to the v2 file one level up, prepend a preview
// strip. Committed output; regenerate after any change to the originals or
// to the v2 data — don't hand-edit v2/. When the v2 values are signed off
// and merged into data/products.js, delete v2/ and this script.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "v2");
fs.mkdirSync(outDir, { recursive: true });

const STRIP = `
<style id="v2-strip">
  /* preview strip so reviewers know this edition carries proposed v2 values */
  body::before {
    content: "VERSION 2 PREVIEW — v1 data plus collected public-source updates (Global Fund PQR volumes, WHO PQ listings, EMA dates, trial registry), pending LAUNCH verification. The current edition remains at the site root.";
    display: block; background: #0B4F43; color: #C8EADF; padding: 6px 24px;
    font: 600 11px/1.5 "Segoe UI", Arial, sans-serif; letter-spacing: .05em;
  }
</style>`;

const PAGES = [
  { src: "index.html", out: "index.html",
    title: "LAUNCH Dashboard · v2 preview", strip: true },
  { src: "option-b.html", out: "option-b.html",
    title: "LAUNCH Dashboard · v2 preview (Option B)", strip: true },
  { src: "pipeline.html", out: "pipeline.html",
    title: "LAUNCH Pipeline Poster · v2 preview", strip: true },
  { src: "story.html", out: "story.html",
    title: "The Waiting Years · v2 preview", strip: true },
  // the widget is 200px tall — the data status banner suffices
  { src: "widget.html", out: "widget.html",
    title: "LAUNCH Product Tracker Widget · v2 preview", strip: false },
];

for (const p of PAGES) {
  let html = fs.readFileSync(path.join(root, p.src), "utf8");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${p.title}</title>`);
  // the v2 dataset, then everything else in data/, live one level up
  html = html.replace(/src="data\/products\.js"/g, 'src="../data/products.v2.js"');
  html = html.replace(/src="data\//g, 'src="../data/');
  // drop the Unitaid brand-preview link (and its separator) — that edition
  // runs on v1 data and doesn't belong in the v2 navigation
  html = html.replace(/\s*·\s*<a href="unitaid\/[^"]*"[^>]*>Unitaid brand preview<\/a>/g, "");
  if (p.strip) html = html.replace(/<\/style>/, "</style>" + STRIP);
  fs.writeFileSync(path.join(outDir, p.out), html);
  console.log(`v2/${p.out} <- ${p.src}`);
}
console.log("Done. Regenerate with: node scripts/build-v2-edition.js");
