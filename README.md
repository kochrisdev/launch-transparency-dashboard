# LAUNCH Transparency Dashboard (Prototype)

**Live site: https://kochrisdev.github.io/launch-transparency-dashboard/**

Two design options are live for client review, running off the same data:

- **Option A — journey board** (default, `index.html`): one row per medicine, its
  full pathway left to right. Emphasises each product's story.
- **Option B — comparison matrix** ([`option-b.html`](https://kochrisdev.github.io/launch-transparency-dashboard/option-b.html)):
  stages as rows, medicines as columns. Emphasises cross-product comparison at
  each gate. Distinct visual identity (deep green, serif display, dark header band).

The pages cross-link in their headers. Both include the country access map,
the pathway timing chart and the Recent updates panel; glossary tooltips, CSV
export and the print view are Option-A-only for now. Once the client picks a
direction, the other option is deleted and the remaining extras are
consolidated into the winner.

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
| [Developer guide](docs/developer-guide.md) | Whoever maintains or extends the code — architecture, rendering pipeline, validator, deployment, handover. |
| [Remaining-tasks checklist](docs/checklist.md) | Living checklist of open items from build stages 1–4, with who's needed for each. |

## Structure

| File | Role |
| --- | --- |
| `index.html` | The dashboard, design option A (journey board). Static — no build step, no backend. |
| `option-b.html` | Design option B (comparison matrix), live for client review. Reads the same data file. |
| `data/products.js` | **The only file that changes in routine updates** — feeds both design options. Strict JSON wrapped in `window.LAUNCH_DATA =`. |
| `widget.html` | Embeddable single-product tracker for partner sites (`?product=aspy` etc.). |
| `data/world-map.js` | Generated map geometry (Natural Earth, public domain) — rerun `scripts/build-map.js` to regenerate. |
| `history/` | Automatic dated snapshots of the data file (bot-committed on every data change) — the raw material for future trend charts and playback. |
| `feed.xml` | RSS feed of dashboard updates, rebuilt automatically from the changelog. |
| `scripts/validate-data.js` | Data validator — run after every data edit. |
| `scripts/make-preview.js` | Optional: builds `preview.html`, a single self-contained file for emailing/sharing. |
| `docs/` | Documentation for users, data analysts and developers (see table above). |
| `.github/workflows/` | CI: data validation on every push/PR; history snapshot + feed rebuild on data changes; monthly review-reminder issue. |

### Embedding a single product on a partner site

```html
<iframe src="https://kochrisdev.github.io/launch-transparency-dashboard/widget.html?product=aspy"
        title="LAUNCH tracker — ASPY"
        style="width:100%;max-width:720px;height:200px;border:1px solid #ddd;border-radius:10px"></iframe>
```

`product` accepts the id or the display name: `ganlum`, `alaq`, `aspy` (or `pyramax`), `dhappq` (or `dha-ppq`).

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
https://claude.ai/code/artifact/a8e7edc7-05bb-434f-8c0b-5b3ea5854542
