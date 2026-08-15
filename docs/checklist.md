# Remaining tasks — stages 1–4

Living checklist of what's left from the four build stages. Tick items off as
they land (edit this file in the same commit as the work). Done work is listed
at the bottom for context.

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
  [data-analyst-guide.md §10](data-analyst-guide.md#10-suggested-cadence-and-ownership-fill-in).
- [ ] 📊 **Set up the manufacturer confirmation register** in the team document
  store (outside this repo) — spec in
  [data-analyst-guide.md §7](data-analyst-guide.md#7-manufacturer-confirmation-register-kept-outside-this-repo).
- [ ] 🤝 **Obtain first written manufacturer confirmations** (prices, capacity
  figures) and replace the corresponding TBCs.
- [ ] 📊 **Verify country-level counts** — registrations, national guideline
  inclusion, MFT plans for ASPY and DHA–PPQ (currently TBC). *Also unblocks
  the country map (stage 3).*
- [ ] 📊 **Procurement volumes data pull** — Global Fund PQR and PMI records for
  ASPY and DHA–PPQ; fill the `volume` blocks.
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
