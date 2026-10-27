#!/usr/bin/env node
// Mirrors the static, bot-maintained files that the site serves as-is into
// public/ (git-ignored), so both `next dev` and `next build` serve them:
// data files (read by the Streamlit app and Power BI from the live site),
// the RSS feed, ontology exports, journey icons, history snapshots, briefs
// and the Unitaid logo. The originals stay where the scripts and CI write
// them — never edit public/ by hand. Runs automatically before dev/build.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pub = path.join(root, "public");
const STATIC = ["data", "assets", "ontology", "history", "briefs", "feed.xml", "unitaid/assets"];

fs.rmSync(pub, { recursive: true, force: true });
fs.mkdirSync(pub, { recursive: true });
for (const rel of STATIC) {
  const src = path.join(root, rel);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(pub, rel), { recursive: true });
}
// GitHub Pages: never run Jekyll on the export (it would drop _next/)
fs.writeFileSync(path.join(pub, ".nojekyll"), "");
console.log(`public/ synced: ${STATIC.join(", ")}`);
