# LAUNCH Dashboard — Power BI kit

Everything needed to rebuild the LAUNCH dashboards as a Power BI report:
live-refreshing Power Query scripts, offline CSV exports, the LAUNCH theme,
ready DAX measures, and a page-by-page build guide. Assembly in Power BI
Desktop takes roughly an hour; no step requires writing new code.

> Why a kit and not a .pbix? Report files are authored interactively in Power
> BI Desktop; a hand-built binary shipped untested would risk being broken.
> The kit contains 100% of the logic (queries, measures, theme, layout spec) —
> only the visual placement is manual, and the guide below specifies it.

## Contents

| File | Role |
| --- | --- |
| `queries.m` | Power Query definitions that load **live** from the GitHub Pages data URL — the report refreshes with the site. One function + 8 tables. |
| `export-powerbi-data.js` | Offline alternative: `node powerbi/export-powerbi-data.js` regenerates the CSVs below from the repo's data file. |
| `data/*.csv` | Pre-generated flat tables (products, stages, milestones, countries, journey gates/segments, changelog, meta). |
| `LAUNCH-theme.json` | Report theme: LAUNCH palette, status colors, card styling. |
| `measures.dax` | All DAX measures, with the conditional-formatting color rules in comments. |

## Build steps

### 1. Data (choose one path)

**Live (recommended):** Power BI Desktop → *Get data → Blank query → Advanced
Editor* → paste the `fnLaunchData` section from `queries.m`, name it
`fnLaunchData`. Repeat for each commented table section (`Meta`, `Products`,
`Stages`, `Milestones`, `Countries`, `JourneyGates`, `JourneySegments`,
`Changelog`) — uncomment when pasting, name exactly as shown. Credentials:
Anonymous / Public. The report now refreshes from the live site (schedule
refresh after publishing).

**Offline:** *Get data → Text/CSV* for each file in `data/`.

### 2. Model

Relationships (one-to-many, single direction), from `Products[productId]` to
`productId` in: `Stages`, `Milestones`, `Countries`, `JourneySegments`,
`JourneyGates`. `Meta` and `Changelog` stay disconnected.

### 3. Theme and measures

*View → Themes → Browse* → `LAUNCH-theme.json`. Then create each measure from
`measures.dax` on the table noted in its section header.

### 4. Pages (mirroring the web views)

**Page 1 — Journey board.**
Top: card visuals for `Medicines Tracked`, `Active Bottlenecks`,
`Pipeline Products`, `Open TBC Gaps`; a card with `Data Status Banner`; a card
with `Last Updated`. Main visual: **Matrix** — Rows `Stages[productName]`,
Columns `Stages[stageName]` (sort by `stageIndex`), Values `Status Emoji`.
Conditional formatting → Cell background → rules on `MAX(Stages[statusRank])`:
0 → `#EEF1F3`, 1 → `#C0392B`, 2 → `#B87500`, 3 → `#1E8A5A`. Tooltip:
`Stage Tooltip`. Below: a table of `Products[name]`, `Products[flag]` filtered
to non-blank flags (the bottleneck panel), and a multi-row card from
`Products` for the profile fields (price, use case, counts).

**Page 2 — Country map.**
**Filled map** (enable *Options → Security → Map visuals* if prompted):
Location `Countries[iso3]`, tooltips `productName`, `levelLabel`. Format →
Fill colors → rules on `Access Level Rank`: 1 → `#B7D3DD`, 2 → `#5E97AC`,
3 → `#14657E`. Slicer on `Countries[productName]`. Add a card with
`Map Verification Warning` — it self-displays the ILLUSTRATIVE notice until
`countries.status` is verified in the data (governance rule carried over).

**Page 3 — Pathway timing.**
**Stacked bar chart**: Y `JourneySegments[productName]`, X `years`, Legend
`pace`, colors On track `#1E8A5A` / Slow `#B87500` / Delayed `#C0392B` /
Pending `#9AA8B1`; tooltips `fromGate`, `toGate`, `startYear`, `endYear`.
(For a true date Gantt, Microsoft's Gantt custom visual from AppSource also
works with startYear/endYear.) Add a card with `Total Years Elapsed`.

**Page 4 — Pipeline poster.**
**Matrix**: Rows `Products[classLabel]`, Columns `Products[phase]` (sort:
preclinical, phase1, phase2, phase3, regulatory, access), Values `name`
(concatenated). Or small multiples of cards per phase. Color by class using
the theme palette.

**Page 5 — Data & changelog.**
Tables for `Stages`, `Milestones`, `Changelog` (sorted by date desc). Power
BI's built-in *Export data* on each visual replaces the CSV button.

### 5. Publish

*Publish → Power BI Service* (workspace of your choice) → in the dataset
settings, set **scheduled refresh** (daily is plenty; anonymous web source
needs no gateway). Share via app/workspace, or embed in a page with *Embed →
Website or portal*. RBM could embed the report exactly like the static site's
iframe option.

## Governance notes (unchanged from the main project)

The data contract, TBC convention and prototype caveat all carry over — the
`Data Status Banner` and `Map Verification Warning` measures surface them
inside the report. Verify against [docs/data-analyst-guide.md](../docs/data-analyst-guide.md)
before circulating anything externally.
