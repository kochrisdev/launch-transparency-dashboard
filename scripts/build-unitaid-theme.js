#!/usr/bin/env node
// Generates the Unitaid-brand edition of the dashboards into unitaid/
// (per brandpad.io/unitaid: navy #212E92, blue #0066FF, red #CC0033,
// supporting greens/sky/orange, Source Sans 3 / Arial, white space).
//
//   node scripts/build-unitaid-theme.js
//
// Approach: copy each dashboard page and APPEND a brand-override stylesheet
// that redefines the design tokens under every theme state (bare :root, the
// dark media query's guard, and the explicit dark stamp), so the brand look
// wins in all modes. No surgery on the source CSS — rerun after any change
// to the originals and the skin stays in sync. Committed output; regenerate,
// don't hand-edit.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "unitaid");
fs.mkdirSync(outDir, { recursive: true });

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800&display=swap" rel="stylesheet">';

// Unitaid palette mapped onto the dashboards' token names.
// Status semantics: complete=Unitaid Green, moving=Unitaid Blue,
// stuck=Unitaid Red, idle=navy-grey. Single committed light theme (brand
// is navy-on-white) — the override pins all three theme states to it.
const TOKENS = `
  --ground: #FFFFFF; --surface: #FFFFFF; --surface-2: #E6EAEE;
  --ink: #212E92; --ink-2: #4A5578; --ink-3: #7A84AD; --line: #CBD4E6;
  --accent: #0066FF; --accent-ink: #FFFFFF; --accent-soft: #E5F0FF;
  --good: #00C77D; --good-soft: #DFFAF0;
  --warn: #FF451A; --warn-soft: #FFE9E4;
  --crit: #CC0033; --crit-soft: #FAE0E7;
  --idle: #8A93B8; --idle-soft: #EEF1F7;
  --map1: #75D8F7; --map2: #0066FF; --map3: #212E92;
  --band: #212E92; --band-ink: #FFFFFF; --band-ink-2: #75D8F7;
  --cat-newclass: #0066FF; --cat-tact: #212E92; --cat-market: #00C77D; --cat-prevention: #FF451A;
  --shadow: 0 1px 2px rgba(33,46,146,.08), 0 4px 16px rgba(33,46,146,.08);`;

const OVERRIDE = `
<style id="unitaid-brand">
  /* Unitaid brand skin — pins the palette in every theme state */
  :root, :root:not([data-theme="light"]), :root[data-theme="dark"] {${TOKENS}
  }
  body, button, input, select, textarea {
    font-family: "Source Sans 3", Arial, "Segoe UI", sans-serif;
  }
  /* brand strip so reviewers know which edition they are looking at */
  body::before {
    content: "UNITAID BRAND PREVIEW — same data and features as the main dashboards";
    display: block; background: #212E92; color: #75D8F7; padding: 6px 24px;
    font: 600 11px/1.5 "Source Sans 3", Arial, sans-serif; letter-spacing: .05em;
  }
  /* de-serif option B's display face; keep one brand voice */
  .band h1, .pcard .pname, .stuck h2, .drawer h2, .viz h2 {
    font-family: "Source Sans 3", Arial, "Segoe UI", sans-serif !important;
  }
  .band h1 em { color: #00F7B6; }
  .band a { color: #75D8F7; }
  /* pipeline poster hardcodes an alternate header colour — rebrand it */
  .phase-head { background: #0066FF !important; }
  .phase-head:nth-of-type(odd) { background: #212E92 !important; }
  #tip { background: #212E92; color: #FFFFFF; }
</style>`;

const PAGES = [
  { src: "index.html", out: "index.html",
    title: "LAUNCH Dashboard · Unitaid Brand" },
  { src: "option-b.html", out: "option-b.html",
    title: "LAUNCH Dashboard · Unitaid Brand (Option B)" },
  { src: "pipeline.html", out: "pipeline.html",
    title: "LAUNCH Pipeline Poster · Unitaid Brand" },
];

for (const p of PAGES) {
  let html = fs.readFileSync(path.join(root, p.src), "utf8");
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${p.title}</title>`);
  // fonts after the viewport meta
  html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n${FONTS}`);
  // data files live one level up
  html = html.replace(/src="data\//g, 'src="../data/');
  // the data story stays single-edition at the repo root
  html = html.replace(/href="story\.html"/g, 'href="../story.html"');
  // inside the themed folder, the brand-preview link becomes the way back
  html = html.replace(
    '<a href="unitaid/index.html" style="color:var(--accent)">Unitaid brand preview</a>',
    '<a href="../index.html" style="color:var(--accent)">LAUNCH brand original</a>');
  // append the brand override as the LAST style so its tokens win
  html = html.replace(/<\/style>/, "</style>" + OVERRIDE);
  fs.writeFileSync(path.join(outDir, p.out), html);
  console.log(`unitaid/${p.out} <- ${p.src}`);
}
console.log("Done. Regenerate with: node scripts/build-unitaid-theme.js");
