# Updating the LAUNCH dashboard

This manual has moved to **[docs/data-analyst-guide.md](docs/data-analyst-guide.md)**,
which covers the full update loop, the data dictionary, governance rules, the
manufacturer confirmation register, and the cadence/ownership table.

Quick version:

1. Edit `data/products.js` (strict JSON after the `window.LAUNCH_DATA =` line).
2. Run `node scripts/validate-data.js` and fix every error.
3. Add a `changelog` entry and bump `meta.lastUpdated`.
4. Commit and push — the live site updates automatically, and CI snapshots the
   change into `history/` and rebuilds the `feed.xml` RSS feed for you.
