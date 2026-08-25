# Remaining tasks

Living checklist of what's left from the four build stages, plus the data
sourcing workstream. Tick items off as they land (edit this file in the same
commit as the work). Done work is listed at the bottom for context.

**Legend:** 🧑‍💻 needs a developer · 📊 needs the data/analyst team · 🤝 needs an
external party (RBM, manufacturer, funder)

---

## Stage 1 — Data layer

Nothing remaining. ✅

## Stage 2 — Real data and update workflow

- [ ] 📊 **Verify the draft data** — check every non-TBC value against its cited
  source; correct or downgrade to TBC. (Whole board is `dataStatus: "draft"`
  until this is done.)
- [ ] 📊 **Fill the cadence/ownership table** with real names —
  [data-analyst-guide.md §11](data-analyst-guide.md#11-suggested-cadence-and-ownership-fill-in).
- [ ] 📊 **Set up the manufacturer confirmation register** in the team document
  store (outside this repo) — spec in
  [data-analyst-guide.md §7](data-analyst-guide.md#7-manufacturer-confirmation-register-kept-outside-this-repo).
- [ ] 🤝 **Obtain first written manufacturer confirmations** (prices, capacity
  figures) and replace the corresponding TBCs.
- [ ] 📊 **Verify country-level counts** — registrations, national guideline
  inclusion, MFT plans for ASPY and DHA–PPQ (currently TBC). *Also unblocks
  the country map (stage 3).* Starting evidence: PQ/EMA rows are already
  staged in `sourcing/staging/regulatory_events.csv`; national registrations
  still need the NRA registers (see the data sourcing section below).
- [ ] 📊 **Procurement volumes data pull** — the data is now staged
  (`sourcing/staging/procurement_transactions.csv`: DHA–PPQ 11.5m packs /
  $41.5m since 2008, ASPY 940k packs / $14.5m since 2018 — both with sharp
  2025 upticks); what remains is the analyst edit filling the `volume`
  blocks from it (channel = Global Fund only; PMI is archive-only
  post-2025 — disclose the gap, see
  [data-sourcing-plan.md](data-sourcing-plan.md) Category E).
- [ ] 📊🤝 **Flip `dataStatus` to `"live"`** after sign-off (checklist in
  [data-analyst-guide.md §6](data-analyst-guide.md#6-data-status-transitions))
  and decide whether the prototype badge comes off in the same commit.

## Stage 3 — Features

- [ ] 📊 **Country access map: swap in verified data** — the map is built and
  live, but shows an ILLUSTRATIVE overlay; replace the placeholder
  `countries.list` with the verified survey and flip `countries.status` to
  `"verified"` (see [data-analyst-guide.md §4](data-analyst-guide.md#4-data-dictionary)).
- [ ] 🤝🧑‍💻 **Usage analytics** — choose a provider (Plausible suggested:
  cookieless, no consent banner), create the account, add the script tag with a
  hostname guard so previews aren't counted. Needed to evidence usage for
  LAUNCH's proof-of-concept objective.
- [ ] 📊 **Refine the "time between gates" benchmark** — thresholds (≤2 / 3–5 /
  >5 yrs) are a draft placeholder; replace with the LAUNCH deep-dive analysis
  best-case timeline once it exists.
- [ ] 🤝 **Activate the spatial emanators row** — pending funder approval; when
  it comes, convert the placeholder to a tracked product
  ([data-analyst-guide.md §4](data-analyst-guide.md#4-data-dictionary)) and
  decide prevention-specific stage names
  ([developer-guide.md §9](developer-guide.md#9-extension-notes)).
  *Evidence check (2026-08-22, regulatory watch): two SC Johnson spatial
  emanators — Guardian and Mosquito Shield — were WHO PQ-listed on
  2025-08-13 (`sourcing/staging/regulatory_events.csv`), so a real pathway
  gate has already been passed; worth raising the activation decision with
  the funder/LAUNCH team.*

## Stage 4 — Hosting and handover

- [ ] 🤝 **Client picks a design direction** — Option A (journey board,
  `index.html`) vs Option B (comparison matrix, `option-b.html`), both live and
  cross-linked. Then: delete the losing option and port Option A's extra
  features (glossary, CSV, print, pathway timing) into the winner if B is chosen.
- [ ] 🤝 **Engage RBM's web team** — share the live link; decide between
  (a) RBM hosts the static files, (b) RBM embeds the Pages URL via iframe,
  (c) repo transfer to an RBM GitHub org. Options in the README.
- [ ] 🧑‍💻🤝 **Restyle to RBM brand** — one CSS token block change once their
  brand guidelines (colors/fonts) are shared.
- [ ] 🤝 **Custom domain** (optional) — e.g. a subdomain under endmalaria.org
  pointed at the Pages deployment.
- [ ] 🤝 **Circulate to the AMDR Core Advisory Group** for feedback on the
  draft data and the bottleneck framing.
- [ ] 📊 **Update the header note** — change "To be hosted by…" back to
  "Hosted by…" when RBM hosting goes live.

## Data sourcing — next steps

Collection infrastructure per [data-sourcing-plan.md](data-sourcing-plan.md);
three fetchers live and scheduled (see [sourcing/README.md](../sourcing/README.md)).

- [x] 📊 **First PQR Tableau crosstab export** — done 2026-08-23: manual
  download + `scripts/normalize-pqr.js` → 12,151 malaria-relevant
  transactions staged (of 98,647 total), 302 matched to portfolio products
  (DHA–PPQ 234, ASPY 68). Scripted export was tested and is WAF-blocked —
  the download stays manual by design (steps in
  [sourcing/README.md](../sourcing/README.md)); repeat quarterly.
- [x] 🧑‍💻 **NAFDAC Greenbook scraper (Nigeria-first)** — done 2026-08-23:
  `scripts/fetch-nafdac.js` (DataTables JSON endpoint, monthly in
  `sourcing.yml`) staged 48 portfolio registrations — DHA–PPQ 47
  presentations (26 Active / 22 **Inactive**, i.e. lapsed) and Pyramax 1
  (granules, approved 2024).
- [x] 🧑‍💻 **TMDA register (Tanzania)** — done 2026-08-23:
  `scripts/fetch-tmda.js` (IMIS2 JSON backend, monthly in `sourcing.yml`)
  staged 12 portfolio registrations, all Registered/Compliant — DHA–PPQ 10
  presentations across four manufacturers (Guilin D-ARTEPP incl. paediatric
  dispersible, KBN-Zhejiang Duo-Cotecxin, Ajanta Ridmal) and Pyramax 2
  (Shin Poong, issued 2022). Two Guilin dispersible registrations expire
  2026-10-01 — the watch will flag a lapse. Next registers when needed:
  Ghana FDA (TLS broken at check), Kenya PPB (PDF-only) — plan §3
  Category C.
- [ ] 🧑‍💻 **MAGICapp version poll** — one GET against the guidelines API,
  compare `publishDate`, alert on change; cheap add to `sourcing.yml`.
- [ ] 📊 **WMR annex ingest (due December)** — policy 4A/4B, commodities 4G,
  funding 4F, burden 4H–4L when the World Malaria Report 2026 lands.
- [ ] 📊 **Act on watch issues** — "Trial watch" / "Regulatory watch" issues
  are inputs to the stage-2 verification work; the first regulatory snapshot
  already carries fresher dates than parts of the draft data (e.g. Pyramax's
  EMA outcome update 2025-06-05, DHA–PPQ's nine PQ'd presentations).
- [x] 📊🤝 **Review & merge the v2 preview** — merged 2026-08-25: the
  collected-data updates (PQR volumes, WHO PQ listings, EMA dates, trial
  registry, NGA/TZA register verification, sourced fact corrections) are
  now the live draft dataset in `data/products.js`; v1 preserved in
  `history/`; the `v2/` edition, `data/products.v2.js` and the builder
  deleted. Future collection cycles land as ordinary sourced edits via
  the watch-issue loop (no new preview edition needed unless a batch is
  big enough to warrant one).

---

## Done (for context)

- **Stage 1** — data extracted to `data/products.js` with `source` / `asOf` /
  `confirmedInWriting` provenance; validator with governance rules; single-file
  preview builder; page renders entirely from data (stats derived, never typed).
- **Stage 2** — draft public-source data for all four medicines (GanLum Phase III
  result, ASPY (Pyramax) 2012/2022/2025 milestones, Eurartesim PQ + requalification,
  ALAQ DeTACT timeline); TBC convention; `dataStatus` banner; on-page changelog;
  UPDATING workflow docs; CI validation on every push/PR.
- **Stage 3** — glossary (13 terms, inline tooltips + panel); pathway timing
  timelines with real dates; CSV export; print view.
- **Stage 4** — repo public; GitHub Pages live at
  https://kochrisdev.github.io/launch-transparency-dashboard/ with auto-deploy
  on push; handover options documented; prototype badge; docs set for users,
  analysts and developers.
- **Client review additions** — design option B (comparison matrix,
  `option-b.html`) live alongside option A, cross-linked, same data file;
  product renamed Pyramax → ASPY (trade name kept in subtitle); documentation
  updated to cover both options.
- **Visualization tier 1–2 (Aug 2026)** — country access map (illustrative
  overlay until verified); cross-product pathway timing chart (real dates);
  embeddable product widget (`widget.html`); RSS update feed (`feed.xml`);
  automatic history snapshots on every data change (`history/`); monthly
  milestone-scan reminder issue. Deferred until history accrues: procurement
  trend charts and "as of" playback; deferred until country data verified:
  audience lenses.
- **Pipeline poster (Aug 2026)** — `pipeline.html`, MMV-poster-style
  phase-column view of the portfolio, driven by the new per-product `phase`
  field; complementary to the A/B decision, cross-linked from both options.
- **Data story (Aug 2026)** — `story.html`, scroll-driven narrative ("The
  Waiting Years"): sticky visual walks portfolio → ASPY's timeline → the
  computed 10-year approval-to-recommendation gap → the three-approvals
  pathway → today's bottlenecks → the access map → the incoming pipeline.
  All figures derived from the data file at render time.
- **Unitaid brand edition (Aug 2026)** — `unitaid/`: the dashboards and data story
  reskinned per brandpad.io/unitaid (navy/blue/red palette, Source Sans 3,
  brand status colours, preview strip), generated from the originals by
  `scripts/build-unitaid-theme.js` so the skin never drifts; same data,
  same features; linked from the journey-board header.
- **Power BI kit (Aug 2026)** — `powerbi/`: live-refreshing Power Query (M)
  scripts against the Pages data URL, offline CSV exports + generator, LAUNCH
  report theme, DAX measures (incl. governance banner and map verification
  warning), and a page-by-page build guide mirroring the five web views.
  Assembly in Power BI Desktop is manual by design (~1 hour; guide included).
- **Data sourcing layer (Aug 2026)** — `docs/data-sourcing-plan.md` (8 data
  categories mapped to the pathway, verified public-source catalog, dataset
  designs, cadence, licensing); `sourcing/` collection area; three fetchers
  (`fetch-trials.js`, `fetch-globalfund.js`, `fetch-regulatory.js`) with
  first snapshots staged (250 trials; 382 grants / 37k disbursement
  transactions; 215 regulatory events); `sourcing.yml` schedules them
  (weekly/monthly) and opens watch issues on changes.
- **Streamlit platform (Aug 2026)** — `streamlit-app/`: parallel Python
  implementation (journey board, matrix heatmap, choropleth map, timing
  timeline, pipeline poster, exports) with flexible data input (bundled
  file / any URL / upload for pre-commit preview), sidebar configuration
  (product filter, timing thresholds, governance toggles) and built-in data
  checks. Deployable free on Streamlit Community Cloud; instructions in its
  README.
