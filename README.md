# LAUNCH Transparency Dashboard (Prototype)

**Live site: https://kochrisdev.github.io/launch-transparency-dashboard/**

Two design options are live for client review, running off the same data:

- **Option A — journey board** (default, `index.html`): one row per medicine, its
  full pathway left to right. Emphasises each product's story.
- **Option B — comparison matrix** ([`option-b.html`](https://kochrisdev.github.io/launch-transparency-dashboard/option-b.html)):
  stages as rows, medicines as columns. Emphasises cross-product comparison at
  each gate. Distinct visual identity (deep green, serif display, dark header band).

The pages cross-link in their headers. Both include the country access map,
the pathway timing chart, CSV download and the Recent updates panel; glossary
tooltips and the print view are Option-A-only for now. Once the client picks a
direction, the other option is deleted and the remaining extras are
consolidated into the winner.

There is also a third, complementary view (not part of the A/B decision):

- **Pipeline poster** ([`pipeline.html`](https://kochrisdev.github.io/launch-transparency-dashboard/pipeline.html)):
  the portfolio laid out MMV-poster style — development-phase columns
  (Preclinical → Approved · scaling up), category-colored product cards with
  bottleneck dots, a prevention lane for planned tools. Placement is driven by
  each product's `phase` field; cards click through to the journey board.
- **Data story** ([`story.html`](https://kochrisdev.github.io/launch-transparency-dashboard/story.html)):
  "The Waiting Years" — a scroll-driven narrative for donors and advocacy: one
  medicine's decade from approval to (still-pending) adoption, told through a
  sticky visual that shifts from portfolio → timeline → pathway → bottlenecks →
  map → the incoming pipeline. Every number is computed from the data file, so
  the story updates itself as the data changes.

Design mockup for the LAUNCH (Launch Transparency Initiative) dashboard tracking
new antimalarial medicines from approval to access, to be hosted by the
RBM Partnership to End Malaria.

One row per medicine, 8 pipeline stages with traffic-light status; red flags carry
a one-line reason where a product is stuck. Click a row for the full product profile
(price, use case, access commitments, adoption requirements, country access,
operational research, procured volumes, milestone table).

**Data status: draft** — compiled from public sources (WHO PQ list, WHO guidelines,
EMA, Novartis/MMV/MORU announcements) and pending LAUNCH team verification and
manufacturer written confirmation. Unverified values are shown as `TBC`, never
estimated. `meta.dataStatus` in the data file (`illustrative` / `draft` / `live`)
controls the on-page banner.

## Documentation

| Guide | Audience |
| --- | --- |
| [User guide](docs/user-guide.md) | Donors, ministries of health, implementing partners, pharma — how to read and use the dashboard. |
| [Data analyst guide](docs/data-analyst-guide.md) | Whoever maintains the data — update loop, data dictionary, governance rules, confirmation register, cadence. |
| [Data model & lineage](docs/data-model.md) | Analysts and developers extending the data — entities, keys and relationships, the lineage of every derived data product, and extension playbooks. |
| [Data sourcing plan](docs/data-sourcing-plan.md) | Data categories mapped to the access pathway, the verified catalog of public sources feeding each one, target dataset designs, collection cadence, and the new data products they enable. |
| [Developer guide](docs/developer-guide.md) | Whoever maintains or extends the code — architecture, rendering pipeline, validator, deployment, handover. |
| [Domain primer](docs/domain-primer.md) | Developers new to the malaria-access domain — what the dataset means: the pathway, the actors, the four products, terminology, and schema-to-domain mapping. |
| [Remaining-tasks checklist](docs/checklist.md) | Living checklist of open items from build stages 1–4, with who's needed for each. |

## Structure

| File | Role |
| --- | --- |
| `index.html` | The dashboard, design option A (journey board). Static — no build step, no backend. |
| `option-b.html` | Design option B (comparison matrix), live for client review. Reads the same data file. |
| `pipeline.html` | Pipeline poster view (MMV-style phase columns). Reads the same data file. |
| `story.html` | Scroll-driven data story ("The Waiting Years") for advocacy audiences. Reads the same data file. |
| `unitaid/` | **Unitaid brand edition** of the dashboards and data story (journey board, matrix, poster, story) per [brandpad.io/unitaid](https://brandpad.io/unitaid/) — generated from the originals by `scripts/build-unitaid-theme.js`; regenerate, don't hand-edit. Live at [/unitaid/](https://kochrisdev.github.io/launch-transparency-dashboard/unitaid/). |
| `scripts/build-unitaid-theme.js` | Rebuilds `unitaid/` from the current originals (brand-token override layer, Source Sans 3, brand strip). |
| `synthetic/` | **Synthetic-data edition** of the dashboards (all views + widget) running off `data/products.synthetic.js` — fictional companies and figures for development while real data is collected. Generated by `scripts/build-synthetic-edition.js`; regenerate, don't hand-edit. Live at [/synthetic/](https://kochrisdev.github.io/launch-transparency-dashboard/synthetic/). |
| `scripts/build-synthetic-edition.js` | Rebuilds `synthetic/` from the current originals (data script rewrite + warning strip). |
| `data/products.synthetic.js` | The fictional dataset behind `synthetic/` — same contract as `data/products.js`, validated by the same validator. |
| `v2/` | **Version 2 preview edition** of the dashboards (all views + widget) running off `data/products.v2.js` — v1 data plus proposed updates from the collected public-source staging (PQR volumes, WHO PQ listings, EMA dates, trial registry), pending LAUNCH verification. Generated by `scripts/build-v2-edition.js`; regenerate, don't hand-edit. Live at [/v2/](https://kochrisdev.github.io/launch-transparency-dashboard/v2/). Root dashboards stay on v1 until sign-off. |
| `data/products.v2.js` | The v2 proposal dataset — same contract, validated by the same validator (`node scripts/validate-data.js data/products.v2.js`). Merged into `data/products.js` (and then retired) once the LAUNCH team signs off. |
| `scripts/build-v2-edition.js` | Rebuilds `v2/` from the current originals (data script rewrite + preview strip). |
| `streamlit-app/` | Parallel Python/Streamlit platform: same views, flexible data input (bundled file / URL / upload) and runtime configuration. See [its README](streamlit-app/README.md). |
| `powerbi/` | Power BI kit: live-refreshing Power Query scripts, CSV exports, LAUNCH theme, DAX measures and a page-by-page build guide. See [its README](powerbi/README.md). |
| `data/products.js` | **The only file that changes in routine updates** — feeds both design options. Strict JSON wrapped in `window.LAUNCH_DATA =`. |
| `widget.html` | Embeddable single-product tracker for partner sites (`?product=aspy` etc.). |
| `data/world-map.js` | Generated map geometry (Natural Earth, public domain) — rerun `scripts/build-map.js` to regenerate. |
| `history/` | Automatic dated snapshots of the data file (bot-committed on every data change) — the raw material for future trend charts and playback. |
| `feed.xml` | RSS feed of dashboard updates, rebuilt automatically from the changelog. |
| `scripts/validate-data.js` | Data validator — run after every data edit. |
| `sourcing/` | Public-source data collection area (raw snapshots, staging CSVs, watch reports) per [docs/data-sourcing-plan.md](docs/data-sourcing-plan.md) — see [its README](sourcing/README.md). Feeds analyst decisions, never the dashboards directly. |
| `scripts/fetch-trials.js` | Trial watch — ClinicalTrials.gov v2 pull for the portfolio, with a what-changed diff vs the previous snapshot. |
| `scripts/fetch-globalfund.js` | Global Fund pull — malaria grants and disbursement transactions from the Data Service OData API. |
| `scripts/fetch-regulatory.js` | Regulatory pull — WHO PQ medicines + vector-control lists and EMA EU-M4all opinions, with a new-listings/delistings watch report. |
| `scripts/normalize-pqr.js` | Normalizes a manually downloaded Global Fund PQR crosstab into the procurement staging dataset (the download itself must stay manual — scripted export is WAF-blocked). |
| `scripts/make-preview.js` | Optional: builds `preview.html`, a single self-contained file for emailing/sharing. |
| `scripts/make-brief.js` | Generates a dated "what changed" Markdown brief into `briefs/` (stage movements vs history snapshots, logged updates, bottlenecks, TBC gaps). |
| `docs/` | Documentation for users, data analysts and developers (see table above). |
| `.github/workflows/` | CI: data validation on every push/PR; history snapshot + feed rebuild on data changes; monthly review-reminder issue; scheduled source fetch (weekly trial watch, monthly Global Fund pull — see [sourcing/README.md](sourcing/README.md)). |

### Embedding a single product on a partner site

```html
<iframe src="https://kochrisdev.github.io/launch-transparency-dashboard/widget.html?product=aspy"
        title="LAUNCH tracker — ASPY"
        style="width:100%;max-width:720px;height:200px;border:1px solid #ddd;border-radius:10px"></iframe>
```

`product` accepts the id or the display name: `ganlum`, `alaq`, `aspy` (or `pyramax`), `dhappq` (or `dha-ppq`).

## Synthetic development data

`data/products.synthetic.js` is a fully fictional dataset (invented companies,
products, prices, volumes and country statuses) that exercises every dashboard
feature — all six pipeline phases, both bottleneck patterns, confirmed prices,
procurement volume splits and country maps at all three levels. It powers a
separate **`synthetic/` edition** of the dashboards (journey board, matrix,
poster, story, widget) so development can continue while real data is being
collected — the real dashboards and `data/products.js` are never touched.
Live at [/synthetic/](https://kochrisdev.github.io/launch-transparency-dashboard/synthetic/).

`synthetic/` is generated — regenerate it after any change to the original
pages or the synthetic data, don't hand-edit:

```bash
node scripts/build-synthetic-edition.js
```

The dataset carries `meta.synthetic: true` and `dataStatus: "illustrative"`,
and every synthetic page adds a purple warning strip, so the edition can't be
mistaken for real data. Validate edits to it with
`node scripts/validate-data.js data/products.synthetic.js`. The Streamlit app
can point at the same file via its file/URL input.

## Updating the data

1. Edit `data/products.js` (strict JSON: double quotes, no trailing commas).
2. Validate:

   ```bash
   node scripts/validate-data.js
   ```

3. Commit and push. Nothing else to do — the page reads the data file directly,
   and CI automatically snapshots the change into `history/` and rebuilds
   `feed.xml`.

Every data point carries provenance fields:

- `source` — public, citable origin of the figure
- `asOf` — date the value was last verified (`YYYY-MM-DD`)
- `confirmedInWriting` — manufacturer confirmed release of this figure in writing

The validator enforces the governance rules, e.g.: a delayed (red) stage must carry a
substantive reason; a product with a red stage must have a top-level bottleneck `flag`;
a displayed price requires `confirmedInWriting: true` or a public `source`; volume
channel splits must sum to 100.

Summary stats (medicines tracked, active bottlenecks) are computed from the data at
render time — they can never disagree with the board.

## Hosting and deployment

The site deploys automatically via GitHub Pages: every push to `main` goes live at
https://kochrisdev.github.io/launch-transparency-dashboard/ within a minute or two
(after CI validates the data). There is no build step — the repo root is served as-is.

### Handover options for RBM

1. **RBM hosts** (preferred for production): copy the static set —
   `index.html`, `widget.html`, `data/`, `feed.xml`, `.nojekyll` (plus
   `option-b.html` during the design review) — to any static path on
   dashboards.endmalaria.org. No server-side requirements — plain static files.
2. **RBM embeds**: keep this Pages deployment (or a fork under an RBM GitHub org)
   and embed it:

   ```html
   <iframe src="https://kochrisdev.github.io/launch-transparency-dashboard/"
           title="LAUNCH Transparency Dashboard"
           style="width:100%;min-height:1400px;border:0"></iframe>
   ```

To move the repo to an organisation later, GitHub's *Transfer ownership* keeps the
history and CI; only the Pages URL changes.

## Viewing locally

Open `index.html` directly in a browser (no server needed), or build the single-file
version with `node scripts/make-preview.js` and share `preview.html` as one attachment.

## Products

GanLum (ganaplacide–lumefantrine), ALAQ (artemether–lumefantrine–amodiaquine triple ACT),
ASPY (pyronaridine–artesunate, Pyramax), DHA–PPQ (dihydroartemisinin–piperaquine), plus a
placeholder row for spatial emanators (prevention tool, pending funder approval).

Live preview artifacts (private until shared): option A
https://claude.ai/code/artifact/94826363-58d4-466f-b731-759a6d1e8fc7 · option B
https://claude.ai/code/artifact/a8e7edc7-05bb-434f-8c0b-5b3ea5854542 · pipeline poster
https://claude.ai/code/artifact/bd27d2a0-e0f2-47b5-8003-a6ac08989b6a
