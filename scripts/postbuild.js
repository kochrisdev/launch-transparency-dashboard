#!/usr/bin/env node
// Runs after `next build` (static export to out/). Static files reach out/
// via public/ (see sync-public.js); this script only writes redirect stubs at the old single-file URLs (option-b.html,
//     synthetic/story.html, …) so links shared before the Next.js migration
//     keep working on GitHub Pages.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "out");
if (!fs.existsSync(out)) { console.error("out/ not found — run `next build` first"); process.exit(1); }

const LEGACY = {
  "": ["option-b", "illustrated-journey-dashboard", "pipeline", "story", "explainer", "widget"],
  "synthetic/": ["option-b", "pipeline", "story", "widget"],
  "unitaid/": ["option-b", "pipeline", "story"],
};
const stub = to => `<!doctype html><meta charset="utf-8"><title>Moved</title>
<meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}">
<script>location.replace(${JSON.stringify(to)} + location.search + location.hash)</script>
<p>This page has moved to <a href="${to}">${to}</a>.</p>\n`;
let n = 0;
for (const [prefix, pages] of Object.entries(LEGACY)) for (const p of pages) {
  const file = path.join(out, prefix, `${p}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, stub(`./${p}/`)); // relative, so it works under any basePath
  n++;
}
console.log(`wrote ${n} legacy redirect stubs`);
