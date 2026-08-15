#!/usr/bin/env node
// Builds preview.html — a single self-contained file with the data inlined,
// for sharing as one attachment or publishing where relative paths don't
// resolve. The hosted site itself uses index.html + data/products.js; this
// is optional and never required to deploy.
//   node scripts/make-preview.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

let out = html;
for (const rel of ["data/products.js", "data/world-map.js"]) {
  const tag = `<script src="${rel}"></script>`;
  if (!out.includes(tag)) {
    console.error(`ERROR: could not find ${tag} in index.html`);
    process.exit(1);
  }
  out = out.replace(tag, "<script>\n" + fs.readFileSync(path.join(root, ...rel.split("/")), "utf8") + "\n</script>");
}
fs.writeFileSync(path.join(root, "preview.html"), out);
console.log("Wrote preview.html (" + Math.round(out.length / 1024) + " KB)");
