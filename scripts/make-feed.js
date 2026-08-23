#!/usr/bin/env node
// Generates feed.xml (RSS 2.0) from the changelog in data/products.js so
// partners can subscribe to dashboard updates. Run by CI on every data change
// (see .github/workflows/publish.yml); safe to run by hand too.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const SITE = "https://kochrisdev.github.io/launch-transparency-dashboard/";

const raw = fs.readFileSync(path.join(root, "data", "products.js"), "utf8");
const m = raw.match(/^window\.LAUNCH_DATA\s*=\s*/m);
const data = JSON.parse(raw.slice(m.index + m[0].length).replace(/;?\s*$/, ""));

const escXml = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rfc822 = d => new Date(d + "T12:00:00Z").toUTCString();

// Sort newest-first before taking the top 30 — don't rely on file order.
const items = (data.changelog || []).slice()
  .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
  .slice(0, 30).map(c => `    <item>
      <title>${escXml(c.product)}: ${escXml(c.change.length > 80 ? c.change.slice(0, 77) + "…" : c.change)}</title>
      <description>${escXml(c.change)}</description>
      <link>${SITE}</link>
      <guid isPermaLink="false">${escXml(c.date + ":" + c.product + ":" + c.change.slice(0, 40))}</guid>
      <pubDate>${rfc822(c.date)}</pubDate>
    </item>`).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>LAUNCH Transparency Dashboard — updates</title>
    <link>${SITE}</link>
    <description>Changes to tracked antimalarial product statuses on the LAUNCH dashboard (${escXml(data.meta.dataStatus)} data).</description>
    <language>en</language>
    <lastBuildDate>${rfc822(data.meta.lastUpdated)}</lastBuildDate>
${items}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(root, "feed.xml"), xml);
console.log("Wrote feed.xml (" + (data.changelog || []).length + " changelog entries, newest 30 kept)");
