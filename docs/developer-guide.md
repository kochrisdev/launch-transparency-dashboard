# LAUNCH Dashboard — Developer Guide

*For anyone maintaining or extending the code, including RBM's web team at handover.*

> New to malaria product access? Read the **[domain primer](domain-primer.md)**
> first — it explains what the dataset means (the 8-stage pathway, the actors,
> why these four products, the terminology) and why the governance rules are
> shaped the way they are. Most schema decisions trace back to facts in it.

## 1. Architecture in one paragraph

A **static** site with no build step and no backend, on purpose: one HTML file renders
one data file in the browser. There is no framework, no bundler, no package.json
— the repo root is served as-is (GitHub Pages today; any static host later).
The reason: the dataset is tiny (a handful of products ×
~10 metrics), the maintainers are analysts rather than developers, and the
18-month initiative will be handed over — so there is nothing to install,
upgrade, or break.

## 2. Repo map

| Path | Role |
| --- | --- |
| `index.html` | Design option A (journey board): CSS (design tokens + components), HTML skeleton, and the render script. The full-featured page (glossary, CSV, print, timing chart, country map, schema.org JSON-LD injection for crawlers — skipped when `meta.synthetic`). |
| `option-b.html` | Design option B (comparison matrix): a standalone layout study for client review. Same data contract, feature subset. See §10. |
| `pipeline.html` | Pipeline poster view (MMV-style phase columns), complementary to A/B rather than competing. Placement driven by each product's `phase` field; cards deep-link to `index.html#<id>`. Single-theme poster by design. |
| `story.html` | Scroll-driven data story. Steps (left) drive a sticky layered visual (right) via IntersectionObserver (guarded — no IO means step 0 stays active). Every figure is derived from the data at render time — the hero product is `pyramax` falling back to the first `market` product, the headline gap is computed from its `journey`, so the narrative self-updates. Count-up respects `prefers-reduced-motion`. |
| `widget.html` | Embeddable one-row product tracker for partner sites (`?product=<id or name>`). Dependency-free; reads the same data file. |
| `data/products.js` | The data contract: `window.LAUNCH_DATA = { …strict JSON… }`. The only file analysts touch; **feeds all three pages**. |
| `data/world-map.js` | Generated geometry: `window.LAUNCH_MAP = { w, h, countries: { ISO3: { n, d } } }`. Natural Earth 110m, public domain. Committed output — regenerate with `scripts/build-map.js`, never hand-edit. |
| `history/` | Dated snapshots of the data file, bot-committed by `publish.yml` on every data change. Append-only; the raw material for future trend charts and playback. |
| `feed.xml` | RSS 2.0 feed of changelog entries, bot-rebuilt by `publish.yml`. |
| `scripts/validate-data.js` | Node validator: strict-JSON extraction + governance rules. Exit 1 on error. |
| `scripts/make-preview.js` | Inlines the data **and map** files into `preview.html` (single-file build of option A for email/artifact sharing). Optional; never required to deploy. |
| `scripts/make-feed.js` | Regenerates `feed.xml` from the changelog. Run by CI; safe by hand. |
| `ontology/` | Semantic layer: `launch.ttl` (hand-authored OWL/SKOS ontology) and `context.jsonld` (JSON-LD context) are source; `launch-data.jsonld` is the **generated** linked-data projection of the dataset, bot-rebuilt by `publish.yml`. See [docs/ontology.md](ontology.md). |
| `scripts/build-ontology.js` | Regenerates `ontology/launch-data.jsonld` from the data contract. Run by CI on data changes; run by hand after schema-layer edits. |
| `scripts/build-map.js` | One-off map-geometry generator (dev-only deps documented in its header). |
| `.github/workflows/validate.yml` | CI: validator + preview build on every push/PR. |
| `.github/workflows/publish.yml` | On `data/products.js` changes: validates, snapshots to `history/`, rebuilds `feed.xml` and `ontology/launch-data.jsonld`, bot-commits. Path-filtered so its own commit cannot retrigger it. |
| `.github/workflows/reminder.yml` | Monthly cron: opens the milestone-scan checklist issue. Also runnable manually (workflow_dispatch). |
| `.github/workflows/sourcing.yml` | Scheduled source fetch: weekly trial watch (Mon), monthly Global Fund + regulatory pulls (3rd); bot-commits outputs under `sourcing/` only and opens watch issues on changes. Manually runnable with a fetcher picker. |
| `sourcing/` | Public-source data collection area: append-only raw snapshots, regenerated staging CSVs, generated watch reports. Upstream of analyst edits — **never feeds the pages directly**. Self-documented in its own README; design in [docs/data-sourcing-plan.md](data-sourcing-plan.md). |
| `scripts/fetch-trials.js` | ClinicalTrials.gov v2 fetcher: portfolio trial snapshots + staging CSV + what-changed report (status, phase, completion-date, results diffs). |
| `scripts/fetch-globalfund.js` | Global Fund Data Service (OData v4.2) fetcher: malaria grants + disbursement transactions → grant and grant-year staging CSVs. |
| `scripts/fetch-regulatory.js` | WHO PQ (medicines + vector control, CSV export) and EMA EU-M4all (nightly xlsx, zero-dep ZIP/xlsx reader) fetcher → `regulatory_events` staging CSV + listings watch report. |
| `scripts/fetch-nafdac.js` | NAFDAC Greenbook (Nigeria) fetcher — server-side DataTables JSON endpoint, plain HTTP by necessity → `nafdac_registrations` staging CSV + registrations watch report. |
| `scripts/fetch-tmda.js` | TMDA IMIS2 (Tanzania) fetcher — common-name lookup + paged public-search JSON backend → `tmda_registrations` staging CSV + registrations watch report. |
| `scripts/normalize-pqr.js` | Normalizes a **manually downloaded** Global Fund PQR Tableau crosstab (UTF-16/TSV tolerant) → `procurement_transactions` staging CSV + gzipped raw copy. Scripted PQR export is WAF-blocked — don't automate it. |
| `.nojekyll` | Tells GitHub Pages to serve files verbatim. |
| `streamlit-app/` | Parallel Python platform (analyst workbench): same data contract, flexible sources (file/URL/upload), runtime config, Plotly charts. Self-documented in its own README; `launch_data.py` is the pure-Python data layer, `app.py` the UI. Not part of the static deploy. See §11. |
| `powerbi/` | Power BI kit: live Power Query (M) scripts against the Pages data URL, CSV exports + generator, LAUNCH report theme, DAX measures, page-by-page build guide. Self-documented in its own README. See §11. |
| `scripts/make-brief.js` | Generates the quarterly "what changed" brief into `briefs/` (diffs stage statuses against the closest `history/` snapshot before the window). |
| `briefs/` | Generated what-changed briefs; `latest.md` is the stable pointer. |
| `unitaid/` | **Generated** Unitaid brand edition (journey board, matrix, poster, story) per brandpad.io/unitaid. Never hand-edit — rerun the builder. Reads the same `../data/` files, so data pushes update it automatically; only *structural* changes to the source pages need a rebuild. |
| `scripts/build-unitaid-theme.js` | Rebuilds `unitaid/` from the current source pages: appends a brand-token override layer (pinned across all theme states), Source Sans 3, preview strip, official logo bar (unmodified lockup from brandpad.io in unitaid/assets/), path/link fixes. |
| `decks/` (gitignored) | Local-only stakeholder briefing decks (.pptx) — deliberately kept out of the public repository. |
| `docs/` | This documentation set, including the remaining-tasks checklist. |
| `UPDATING.md` | Pointer to the data-analyst guide (kept for old links). |

## 3. The data contract

`index.html` loads `<script src="data/products.js">`, which assigns
`window.LAUNCH_DATA`. A plain `.js` assignment (rather than `fetch`ing `.json`)
is deliberate: it works from `file://` when an analyst double-clicks
`index.html`, with no CORS or server requirement. The body after the assignment
must still be strict JSON — the validator extracts it with a line-anchored
regex (`/^window\.LAUNCH_DATA\s*=\s*/m`) and `JSON.parse`s it, so JS-only
syntax (comments, single quotes, trailing commas) inside the object fails CI.

Schema reference: see the [data analyst guide](data-analyst-guide.md) §4;
entity relationships, keys and the lineage of every derived data product are
in [data-model.md](data-model.md). The renderer and validator must agree on
the schema; change both together.

## 4. Rendering pipeline (`index.html`, bottom `<script>`)

Order matters:

1. **Guard** — if `window.LAUNCH_DATA` is missing, show the error banner and stop.
2. **Meta** — format `lastUpdated`; pick the banner text from `meta.dataStatus`
   (`illustrative` / `draft` / `live`); populate the header note.
3. **Changelog** — first 8 entries into the Recent updates panel.
4. **Summary stats** — *derived*, never hand-typed: tracked = non-placeholder
   products; bottlenecks = products with any `late` stage; pipeline = products
   with `class: "pipeline"`. Keep it this way — a stat that can't disagree with
   the board is the point.
5. **Board render** — one `<section class="product">` per tracked product:
   identity column, 8-stage track (dots carry `data-*` attributes for the
   tooltip), optional red `flagnote`, and a hidden `detail` panel (metric cards,
   optional journey timeline, milestone table).
6. **Placeholder rows** — greyed sections for `placeholder: true` products.
7. **Interactions** — expand/collapse (`aria-expanded` kept in sync); a single
   shared tooltip element (`showTipAt(el, html)` positions it, clamped to the
   viewport, flipping below when near the top).
8. **Glossary** — after the board exists: a TreeWalker wraps the **first**
   occurrence of each term per product in `<span class="gloss" tabindex="0">`
   (word-boundary regex, longest term first, skips inside existing `.gloss`).
   First-occurrence-only is a readability decision.
9. **Country access map** — guarded on `window.LAUNCH_MAP`: builds the SVG once
   from the geometry file, then `selectMap(id)` re-classes paths per product
   from `detail.countries.list` (`lvl-registered/guidelines/mft` + focusable).
   The warning overlay shows unless `countries.status === "verified"`; products
   without a `countries` block get the empty-state message instead. Only
   colored countries get tooltips and tab stops.
10. **Pathway timing chart** — products whose `journey` has ≥ 2 dated gates,
    plotted on a shared year axis (percent-positioned divs, no chart library):
    gate markers with tooltips, gap segments colored by the same ≤2/3–5/>5-year
    classes as the per-product cards, a dashed run-to-today when a `"TBC"` gate
    is pending, and an elapsed-total label. Products not yet plottable are
    named under the chart rather than silently omitted.
11. **CSV export** — builds rows from the same data (stages + milestones),
    quotes per RFC 4180, prepends a UTF-8 BOM (`﻿`) so Excel detects the
    encoding, downloads via a Blob URL.
12. **Print** — `beforeprint` opens the reference panels; CSS `@media print`
    forces detail panels open and hides interactive chrome.

**Escaping**: all data values pass through `esc()` before being interpolated
into HTML. Any new render code must do the same — the data file is trusted-ish
(repo-controlled) but analysts paste text from anywhere.

## 5. CSS system

- **Design tokens** on `:root` (light palette), redefined in
  `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])`,
  and again under `:root[data-theme="dark"]` — so system preference and an
  explicit host toggle both work. **Never** give a color its only definition
  inside a theme block; components use tokens only.
- **Status colors** (`--good/--warn/--crit/--idle` + `-soft` fills) are semantic
  and reserved — don't reuse them for decoration. Status is always **shape +
  color** (✓ › ! dashed-circle), never color alone.
- Rebranding to RBM: change the token block(s); components inherit.
- Layout uses flex/grid with `gap`; wide content (tracks, tables, timelines)
  scrolls inside its own `overflow-x: auto` container.

## 6. Validator (`scripts/validate-data.js`)

Plain Node, no dependencies. Structure: extract strict-JSON body → parse →
rule checks pushing to `errors[]` / `warnings[]` → report, exit 1 if errors.

To add a rule: push a clear, **actionable** message (every message names its
fix — keep that property), decide error vs warning (error = the dashboard would
lie or break; warning = provenance debt), and update the analyst guide's
troubleshooting table.

## 7. Testing

No test framework by design; two layers instead:

- **CI**: the validator plus the preview build on every push.
- **Manual/agent smoke test** (jsdom, used during development):

  ```bash
  npm i jsdom   # anywhere outside the repo, or in a scratch dir
  node -e "
  const {JSDOM}=require('jsdom'); const fs=require('fs');
  const html='<!doctype html><html><body>'+fs.readFileSync('preview.html','utf8')+'</body></html>';
  const dom=new JSDOM(html,{runScripts:'dangerously'});
  setTimeout(()=>{ const d=dom.window.document;
    console.log('products', d.querySelectorAll('.product').length,
                'dots', d.querySelectorAll('.stage .dot').length); },300);
  "
  ```

  Run `node scripts/make-preview.js` first. Check: product count, 8 dots per
  tracked product, flags present, expand/collapse toggles `open`.

## 8. Deployment and handover

- **Now**: GitHub Pages from `main` root; every push is live in ~1–2 min.
  CI gates data quality but does not gate the Pages deploy (branch-based Pages
  deploys regardless) — treat a red CI run as a revert-now signal.
- **Bot commits**: `publish.yml` pushes snapshot/feed commits to `main` after
  data changes — always `git pull` before pushing local work, or a
  fast-forward rejection will greet you.
- **RBM options**: (a) copy the static set — `index.html`, `pipeline.html`,
  `story.html`, `widget.html`, `data/`, `feed.xml`, `.nojekyll` (plus
  `option-b.html` while the design review runs) — to any path on their site; (b) iframe the Pages URL (snippet
  in the README); (c) transfer the repo to an RBM GitHub org (history and CI
  move; Pages URL changes). The `feed.xml` URL and widget embed URLs change
  with the host — update the constants in `scripts/make-feed.js` and partner
  snippets when they do.
- No secrets exist anywhere in the repo or its history; the confirmation
  register lives outside the repo by policy.

## 9. Extension notes

- **Add a pipeline stage**: append/insert in `stages` *and* add the matching
  entry to every product's `stages` array (the validator enforces the count).
  Track min-width may need adjusting (`.track { min-width }`).
- **Country access map** (implemented): geometry lives in the generated
  `data/world-map.js` (Natural Earth 110m via `scripts/build-map.js` — dev-only
  deps documented in that script; rerun only to change projection or country
  set). The renderer colors countries from `detail.countries.list` and shows a
  warning overlay unless `countries.status === "verified"` — the map can never
  silently present unverified coverage. Self-contained by design: no tiles, no
  CDN.
- **History snapshots + RSS feed** (implemented): `.github/workflows/publish.yml`
  runs only on `data/products.js` changes, commits `history/products-<date>.js`
  and a rebuilt `feed.xml` as a bot. It cannot retrigger itself (path filter).
  The `history/` folder is the raw material for future trend charts and
  "as of" playback.
- **Embeddable widget** (implemented): `widget.html?product=<id or name>` —
  one-row tracker for partner sites; keep it dependency-free and tiny.
- **Analytics**: add the chosen provider's script tag in `index.html` only for
  the production host (consider a hostname guard so localhost/preview isn't
  counted). Prefer a cookieless option (e.g. Plausible) to avoid consent
  banners.
- **Prevention products** (spatial emanators): the stage names are per-dataset,
  not per-product — if prevention needs different gate names (PQ/Vector
  Control), either generalize `stages` to per-product overrides (renderer reads
  `p.stageNames || DATA.stages`) or run a second board section. Decide when the
  product activates.
- **New detail cards**: add the field to the schema (analyst guide §4), the
  validator, and the card template in the product render — in that order.

## 9b. Testing the Streamlit app

Streamlit's own harness runs the whole script headlessly and surfaces
exceptions — use it after any `app.py` change:

```python
from streamlit.testing.v1 import AppTest
at = AppTest.from_file("app.py", default_timeout=60)
at.run()
assert not at.exception, [e.value for e in at.exception]
at.sidebar.multiselect[0].set_value(["ASPY"]).run()      # product filter
at.sidebar.radio[0].set_value("Live site (URL)").run()   # live data source
assert not at.exception
```

Widget indices are position-based — keep the sidebar's control order stable
(source radio first, then the Configuration expander's multiselect → sliders →
toggle) or update the tests. `launch_data.py` has no Streamlit imports, so its
loaders/builders are testable with plain `python -c`.

## 10. Design options (temporary, during client review)

`option-b.html` is a deliberate **fork of the presentation, not of the data or
governance**: it loads the same `data/products.js`, derives the same stats, and
uses the same status semantics, but renders a stages-as-rows × products-as-columns
matrix with its own visual identity (deep green, serif display, dark header
band, single light theme). Both options now include the country access map,
the cross-product pathway timing chart, CSV download, and the Recent updates
panel (the renderers are duplicated per page by design — no shared module
until a winner is chosen). A-only extras: glossary tooltips and print handling.

Maintenance rules while both are live:

- Data/schema changes must keep **both** renderers working — option B reads
  `stages`, `products[*].stages`, `flag`, `currentStage`, `detail.*` and
  `meta.dataStatus`.
- Copy changes that state facts (hosting note, prototype badge, banner texts)
  should be applied to both pages.
- `scripts/make-preview.js` covers option A only; a self-contained option B is
  built the same way (replace its `<script src>` with the inlined data file).

**Consolidation** (when the client decides — tracked in `docs/checklist.md`):
delete the losing file, remove the cross-links, and if B wins, port A's
glossary/CSV/print/timing blocks into it (they are self-contained sections of
A's script and CSS).

## 11. Parallel platforms (Streamlit, Power BI)

The static site is the public flagship; two parallel platforms consume the
same contract. Their per-folder READMEs are the operating manuals — this
section is what a developer must know to keep all three coherent.

**Streamlit** (`streamlit-app/`): `launch_data.py` (pure Python — parser
accepts the `window.LAUNCH_DATA` wrapper or bare JSON, loaders for local
file/URL/uploaded bytes, a lightweight mirror of the validator, row builders)
+ `app.py` (six tabbed views, injected brand CSS, sidebar data-source and
configuration controls). Gotchas learned the hard way: Streamlit floats a
~3.7rem header bar *over* the page — keep the transparent-strip + top-padding
CSS or the branded header clips (and never `display:none` the header: the
mobile sidebar toggle lives in it); alert `icon=` accepts only real emoji
(`ℹ️` yes, `🛈` no); `st.columns` stack automatically on phones — design with
that, custom HTML needs its own media queries. Deploys free on Streamlit
Community Cloud (main file `streamlit-app/app.py`), auto-redeploys on push.

**Power BI** (`powerbi/`): a kit, not a `.pbix` — `queries.m` (the
`fnLaunchData` parser + 8 shaped tables, loading live from the Pages URL, so
published reports refresh with the site), CSV exports for offline work,
`LAUNCH-theme.json`, `measures.dax` (including the governance measures:
`Data Status Banner`, `Map Verification Warning`). M can only execute inside
Power BI/Excel — it cannot be CI-tested here, so treat `queries.m` as
schema-coupled code reviewed by hand. If the hosting URL changes, `DataUrl`
in `queries.m` is the one constant to edit.

### Schema-change checklist

When you add, rename, or restructure a field in `data/products.js`, touch —
in this order:

1. `data/products.js` — the field itself, with provenance where applicable.
   Mirror it in the other dataset implementing the contract:
   `data/products.synthetic.js` (populated value so the feature is testable).
2. `scripts/validate-data.js` — a rule (error for governance, warning for
   provenance debt) + the analyst guide's troubleshooting table.
3. **Static renderers that surface it**: `index.html`, and as applicable
   `option-b.html`, `pipeline.html`, `story.html`, `widget.html` (B reads
   stages/flag/detail; poster reads `phase`; story derives from `journey`,
   `countries`, `flag`; widget reads stages/flag only). Then rerun the
   edition builders so the generated copies pick up the structural change:
   `node scripts/build-unitaid-theme.js` and
   `node scripts/build-synthetic-edition.js`.
4. `streamlit-app/launch_data.py` (row builders / validator mirror) and
   `app.py` (the view that shows it).
5. `powerbi/export-powerbi-data.js` **and** `powerbi/queries.m` (keep the two
   table shapes identical), plus `measures.dax`/README if visualized.
6. The semantic layer, if the field should appear in the linked-data export:
   term in `ontology/launch.ttl`, mapping in `ontology/context.jsonld`,
   emission in `scripts/build-ontology.js` — then
   `node scripts/build-ontology.js` to regenerate
   `ontology/launch-data.jsonld` (see [docs/ontology.md](ontology.md) §9).
7. `scripts/make-brief.js` if the brief should report it.
8. `docs/data-analyst-guide.md` §4 (dictionary) — and a changelog entry in the
   data file.

Skipping a consumer fails silently (the platforms ignore unknown fields), so
grep the field name across the repo before calling a schema change done.

## 12. Conventions

- Match the existing style: vanilla ES2017+, template literals for markup,
  `esc()` on every interpolated value, no dependencies.
- Accessibility floor: keyboard focusability for anything hoverable
  (`tabindex="0"` + focus/blur mirroring mouse events), `aria-expanded` on
  toggles, `aria-label` on status dots, visible `:focus-visible` outlines.
- Commit style: imperative subject, body explains the *why*; data-only commits
  should also appear in the on-page changelog.
