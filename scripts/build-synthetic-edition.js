#!/usr/bin/env node
// Generates the synthetic-data edition of the dashboards into synthetic/ —
// the same pages as the originals, pointed at data/products.synthetic.js
// (fully fictional companies, products, prices, volumes and country statuses)
// so development can continue while real data is collected. The real
// dashboards and data/products.js are never touched.
//
//   node scripts/build-synthetic-edition.js
//
// Approach: copy each dashboard page, rewrite the data <script> to the
// synthetic file one level up, and prepend a warning strip so nobody can
// mistake the edition. Committed output; regenerate after any change to the
// originals or to the synthetic data — don't hand-edit synthetic/.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "synthetic");
fs.mkdirSync(outDir, { recursive: true });

const STRIP = `
<style id="synthetic-strip">
  /* warning strip so reviewers know every figure on the page is fictional */
  body::before {
    content: "SYNTHETIC DATA EDITION — every company, product and figure on this page is fictional (development preview)";
    display: block; background: #4B2E83; color: #D9C9F2; padding: 6px 24px;
    font: 600 11px/1.5 "Segoe UI", Arial, sans-serif; letter-spacing: .05em;
  }
</style>`;

const PAGES = [
  { src: "index.html", out: "index.html",
    title: "LAUNCH Dashboard · Synthetic Data", strip: true },
  { src: "option-b.html", out: "option-b.html",
    title: "LAUNCH Dashboard · Synthetic Data (Option B)", strip: true },
  { src: "pipeline.html", out: "pipeline.html",
    title: "LAUNCH Pipeline Poster · Synthetic Data", strip: true },
  { src: "story.html", out: "story.html",
    title: "The Waiting Years · Synthetic Data", strip: true },
  // the widget is 200px tall — its own "illustrative data" tag suffices
  { src: "widget.html", out: "widget.html",
    title: "LAUNCH Product Tracker Widget · Synthetic Data", strip: false },
];

for (const p of PAGES) {
  let html = fs.readFileSync(path.join(root, p.src), "utf8");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${p.title}</title>`);
  // the synthetic dataset, then everything else in data/, live one level up
  html = html.replace(/src="data\/products\.js"/g, 'src="../data/products.synthetic.js"');
  html = html.replace(/src="data\//g, 'src="../data/');
  // drop the Unitaid brand-preview link (and its separator) — that edition
  // runs on real data and doesn't belong in the synthetic navigation
  html = html.replace(/\s*·\s*<a href="unitaid\/[^"]*"[^>]*>Unitaid brand preview<\/a>/g, "");
  if (p.strip) html = html.replace(/<\/style>/, "</style>" + STRIP);
  fs.writeFileSync(path.join(outDir, p.out), html);
  console.log(`synthetic/${p.out} <- ${p.src}`);
}
console.log("Done. Regenerate with: node scripts/build-synthetic-edition.js");
