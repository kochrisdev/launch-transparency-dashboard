# LAUNCH Transparency Dashboard

**Live site: https://kochrisdev.github.io/launch-transparency-dashboard/**

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
controls the on-page banner. See [UPDATING.md](UPDATING.md) for the update workflow,
governance rules, and the manufacturer confirmation register.

## Structure

| File | Role |
| --- | --- |
| `index.html` | The dashboard. Static — no build step, no backend. |
| `data/products.js` | **The only file that changes in routine updates.** Strict JSON wrapped in `window.LAUNCH_DATA =`. |
| `scripts/validate-data.js` | Data validator — run after every data edit. |
| `scripts/make-preview.js` | Optional: builds `preview.html`, a single self-contained file for emailing/sharing. |
| `UPDATING.md` | Operating manual: update loop, governance rules, confirmation register, cadence. |
| `.github/workflows/validate.yml` | CI — every push and PR must pass the data validator. |

## Updating the data

1. Edit `data/products.js` (strict JSON: double quotes, no trailing commas).
2. Validate:

   ```bash
   node scripts/validate-data.js
   ```

3. Commit and push. Nothing else to do — the page reads the data file directly.

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

1. **RBM hosts** (preferred for production): copy `index.html`, `data/`, and
   `.nojekyll` to any static path on dashboards.endmalaria.org. No server-side
   requirements — plain static files.
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
Pyramax (pyronaridine–artesunate), DHA–PPQ (dihydroartemisinin–piperaquine), plus a
placeholder row for spatial emanators (prevention tool, pending funder approval).

Live preview artifact: https://claude.ai/code/artifact/94826363-58d4-466f-b731-759a6d1e8fc7
