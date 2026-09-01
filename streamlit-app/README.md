# LAUNCH Dashboard — Streamlit platform

A parallel, Python-based implementation of the LAUNCH Transparency Dashboard.
Same data contract as the static site, rebuilt with **flexible data input** and
**runtime configuration** — the things a server-rendered platform is good at
that a static page is not.

| | Static site (repo root) | This Streamlit app |
| --- | --- | --- |
| Hosting | Any static host (GitHub Pages, RBM) | Needs a Python host (Streamlit Community Cloud is free) |
| Data | `data/products.js` committed to the repo | Bundled file, **any URL**, or **file upload** at runtime |
| Configuration | Fixed at build time | Sidebar: product filter, timing thresholds, governance toggles |
| Best for | The public, embeddable production dashboard | Analyst workbench: previewing draft data files, what-if configuration, quick internal reviews |

## Run locally

```bash
cd streamlit-app
pip install -r requirements.txt
streamlit run app.py
```

Opens at http://localhost:8501.

## Deploy free on Streamlit Community Cloud

1. Sign in at https://share.streamlit.io with GitHub.
2. New app → repo `kochrisdev/launch-transparency-dashboard`, branch `main`,
   main file path `streamlit-app/app.py`.
3. Deploy. The app auto-redeploys on every push.

## Data input options

The sidebar's **Data source** control accepts, in the same contract
(`window.LAUNCH_DATA = {…strict JSON…}` or a bare JSON object):

- **Bundled repo file** — `../data/products.js`, the same file the static site
  uses. Zero-drift default.
- **Live site (URL)** — any URL serving the contract; defaults to the GitHub
  Pages data file. Point it at a staging copy to preview unpublished data.
- **Upload file** — drag in a draft `products.js`/`.json` to preview a data
  update **before** committing it. Combined with the built-in governance
  checks, this is a pre-flight review tool for analysts.

Data checks in the sidebar mirror the repo validator (`scripts/validate-data.js`)
in lightweight form: stage counts, status enums, unexplained delays, missing
bottleneck flags, unconfirmed prices.

## Configuration options (sidebar)

- **Products** — filter every view to a subset.
- **Timing thresholds** — the on-track / slow / delayed year boundaries for the
  pathway-timing chart (defaults 2 and 5, matching the static site).
- **Hide unverified map** — governance toggle: suppress the choropleth entirely
  while `countries.status` is not `"verified"` (the default shows it with the
  ILLUSTRATIVE warning instead).

## Views

Journey board (branded product cards with traffic-light stage tracks + full
profiles) · Comparison matrix (heatmap, hover notes) · Country map (Plotly
choropleth from `countries.list`) · Pathway timing (gate-to-gate timeline from
`journey`) · Pipeline poster (MMV-style phase columns from `phase`) · Data &
export (tables, CSV/JSON downloads, changelog) · Edit & save (below).

## Edit & save (in-app data editing)

The **✏️ Edit & save** tab lets an analyst do the whole
[analyst-guide update loop](../docs/data-analyst-guide.md#1-the-update-loop)
without hand-editing JSON: forms and editable grids for every common recipe
(stage statuses and notes, the bottleneck flag, current stage, poster phase,
price, country counts, milestones, journey gates, the country-map list), a
raw-JSON escape hatch for everything else (volume, research), plus add /
delete / placeholder products and `meta.dataStatus`.

Edits accumulate in a working draft; the governance checks run live on it.
**Saving is gated** the same way a manual edit is: a changelog description is
required (added newest-first automatically, with `meta.lastUpdated` bumped to
today), the draft must pass the governance checks, and — when Node.js is
available — the real repo validator (`scripts/validate-data.js`) must pass
before anything is written. Two save paths:

- **💾 Save to `data/products.js`** (running locally next to the repo) —
  writes the file in the repo's exact house style, so the git diff shows only
  your actual change. You still review, commit and push yourself; everything
  downstream (live site, history snapshot, RSS, ontology exports) flows from
  the push as usual.
- **⬇️ Download edited products.js** (Streamlit Cloud or anywhere without the
  repo) — same validated content as a file; drop it into the repo, run the
  validator, commit.

## UI & mobile

The app injects the LAUNCH visual identity (teal accent, status colors,
card-styled metrics, prototype badge) via a scoped CSS block in `app.py`, and
is mobile-responsive: stage tracks scroll horizontally inside their cards,
metric/pipeline columns stack vertically on phones (native Streamlit
behaviour), chart legends move to horizontal placement, and paddings/type
scale tighten below 640 px. Streamlit's default menu/footer chrome is hidden
for a cleaner embed-like look.

## Files

- `app.py` — the whole UI (tabs, sidebar, charts).
- `edit_tab.py` — the Edit & save tab: draft state, section editors, the
  save/validate/changelog flow.
- `launch_data.py` — pure-Python data layer: parser, loaders, lightweight
  validator, row builders, and the house-style serializer used for saving.
  No Streamlit imports; unit-testable.
- `.streamlit/config.toml` — LAUNCH theme.

The canonical schema documentation lives in
[`../docs/data-analyst-guide.md`](../docs/data-analyst-guide.md); the domain
background in [`../docs/domain-primer.md`](../docs/domain-primer.md).
