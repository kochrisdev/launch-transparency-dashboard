# LAUNCH Dashboard — Data Categories & Public-Source Collection Plan

*The design for building comprehensive datasets from public-domain sources: what
the data categories are, which public sources feed each one, the target dataset
shapes, and the collection cadence — so data can be gathered systematically and
applied to the current dashboards and to new data products.*

**Status: design draft (2026-08-22).** Sources verified as of this date; access
methods and URLs re-checked before each collection cycle.

Read alongside:

| Doc | What it owns |
| --- | --- |
| **This document** | Category taxonomy, public-source catalog, target dataset designs, collection cadence. |
| [Data model & lineage](data-model.md) | The existing contract these datasets ultimately feed. |
| [Data analyst guide](data-analyst-guide.md) | Provenance rules every collected value must satisfy. |
| [Domain primer](domain-primer.md) | What the pathway stages and actors mean. |

---

## 1. Design principles

1. **Categories follow the pathway.** The 8-stage access pathway is the
   organizing spine — each category maps to the stage(s) it evidences, plus
   cross-cutting context categories the pathway sits in.
2. **Public and citable only.** Every collected value must satisfy the existing
   provenance contract (`source`, `asOf`; `confirmedInWriting` where required).
   A source that can't be cited publicly doesn't enter these datasets — it goes
   to the manufacturer-confirmation register instead.
3. **Collect raw, derive later.** Collection targets are *staging datasets*
   with stable natural keys (product × authority × date; product × country ×
   level; transaction-level procurement rows). The dashboard contract and any
   new data product derive from them — never the reverse.
4. **`TBC` over estimates.** Where a source is silent, the staging row is
   absent and the dashboard shows `TBC` — same rule as today.
5. **Licence-aware.** Most WHO data is CC BY-NC-SA 3.0 IGO; other sources vary.
   §5 records terms per source; any redistribution (CSV downloads, new data
   products) must respect them.

## 2. The category framework

Eight categories. A–F evidence the pathway stages; G–H are context and
reference. Priority: **P1** = feeds the current board directly, collect first;
**P2** = feeds detail panels / near-term products; **P3** = enables new
products later.

| # | Category | Pathway stage(s) | Grain of target dataset | Priority |
| --- | --- | --- | --- | --- |
| A | Product & pipeline identity | all (master data) | product | P1 |
| B | Clinical development & evidence | 0 R&D | trial × registry-version | P1 |
| C | Regulatory status | 1 SRA · 3 PQ · 4 country registration | product × authority × event-date | P1 |
| D | Policy & guideline adoption | 2 WHO guidelines · 5 national policy | product × country × policy-line × year | P1 |
| E | Financing, price & procurement | 6 procurement | transaction (product × country × buyer × date) | P1–P2 |
| F | Delivery, use & safety | 7 in-country delivery | country × year × indicator | P2 |
| G | Epidemiology & resistance context | cross-cutting | country (or site) × year × indicator | P2–P3 |
| H | Geographic & demographic reference | cross-cutting | country | P1 (already largely in place) |

### A. Product & pipeline identity (master data)

**Definition:** the stable identity of every tracked and candidate product —
INN, brand names, combination components, product class (ACT / TACT /
non-artemisinin / prevention tool), developer and manufacturer(s), PDP
partners, formulations and age/weight presentations, pipeline phase.

**Feeds today:** `products[].name / inn / manufacturer / class / phase`,
pipeline-poster placement, glossary.

**Target dataset `product_master`:** one row per product;
columns: `productId`, `inn`, `brandNames[]`, `components[]`, `productClass`,
`developers[]`, `manufacturers[]` (plural — supply security is a signal),
`presentations[]`, `phase`, `firstApprovalYear`, `sourceUrl`, `asOf`.

**New-product angle:** a horizon-scanning row source — the pipeline poster can
grow beyond the four products by diffing the MMV portfolio and WHO PQ EOI lists
each quarter.

### B. Clinical development & evidence

**Definition:** trial registrations, phases, status, endpoints, results
postings and key publications for tracked and candidate products.

**Feeds today:** stage 0 status/notes, `detail.research`, milestone rows
(e.g. Phase III readout), journey gates.

**Target dataset `trials`:** one row per trial × snapshot;
columns: `productId`, `registryId` (NCT/ISRCTN/PACTR), `phase`, `status`,
`countries[]`, `primaryCompletionDate`, `resultsPosted`, `lastChangedDate`,
`sourceUrl`, `asOf`. Registry snapshots make **change detection** (slipped
completion dates = early bottleneck warning) a derived product.

**New-product angle:** a "trial watch" feed — automated diffs of registry
records for the portfolio, surfacing slips before they appear in press
releases.

### C. Regulatory status

**Definition:** every regulatory gate a product passes or waits at — SRA
opinions (EMA EU-M4all / Art. 58, FDA), WHO PQ (EOI invitation → dossier →
prequalified), and country-by-country national registrations (incl. CRP
routes).

**Feeds today:** stages 1, 3, 4; `detail.country.registered` count;
`detail.countries.list[].level = "registered"`; milestone rows; journey gates.

**Target dataset `regulatory_events`:** one row per product × authority ×
event; columns: `productId`, `authorityType` (SRA / WHO-PQ / NRA / AMA),
`authority`, `iso3` (for NRAs), `event` (submitted / opinion / approved /
prequalified / EOI-listed), `eventDate`, `procedure` (EU-M4all, CRP, national),
`sourceUrl`, `asOf`.

This is the dataset that turns the country access map from illustrative to
verified — the map's `registered` level joins straight from NRA rows.

**New-product angle:** registration-lag benchmarking (SRA approval →
n-th-country registration, product vs product; the "waiting years" story
quantified per country).

### D. Policy & guideline adoption

**Definition:** whether WHO recommends the medicine (living Guidelines for
Malaria), and whether each country's national treatment policy / EML includes
it — first-line, second-line, severe, MFT (multiple first-line therapy)
arrangements.

**Feeds today:** stages 2 and 5; `detail.country.inGuidelines / inMft`;
`countries.list[].level = "guidelines" | "mft"`; ASPY's central bottleneck.

**Target dataset `policy_adoption`:** one row per product × country × year;
columns: `productId`, `iso3`, `policyLine` (first-line / second-line / severe /
MFT / chemoprevention), `inNationalGuidelines` (bool), `inNationalEml` (bool),
`guidelineYear`, `sourceType` (WMR annex / national guideline doc / eEML),
`sourceUrl`, `asOf`. Plus `who_recommendations`: product × recommendation ×
date × strength.

**New-product angle:** a policy-adoption tracker — year-over-year diffs of the
World Malaria Report policy annex showing recommendation→adoption diffusion as
an animated map/curve; the strongest advocacy visual the data can support.

### E. Financing, price & procurement

**Definition:** who pays, what is paid, and what moves — transaction-level
procurement (price, volume, buyer, country), reference prices, funding flows
(grants, disbursements) and manufacturer-reported deliveries.

**Feeds today:** stage 6; `detail.price`; `detail.volume` (+ channel split);
DHA–PPQ's central bottleneck; the open checklist item "Procurement volumes
data pull".

**Target datasets:**
- `procurement_transactions`: `productId`, `iso3`, `buyer/channel` (Global
  Fund / PMI / UNICEF / domestic / private), `unitPriceUsd`, `packSize`,
  `volumeUnits`, `orderDate`, `sourceUrl`, `asOf` — transaction-level where
  the source allows (PQR), country-year aggregates elsewhere.
- `reference_prices`: product × buyer × period.
- `funding_flows`: funder × country × component(malaria) × year × USD.
- `deliveries`: manufacturer-reported ACT deliveries × country-year (WMR
  annex) — the denominator for "share of ACT market".

**New-product angle:** a procurement tracker (quarterly volumes/prices per
product, channel split computed rather than hand-entered) and a funding-gap
view per country.

### F. Delivery, use & safety

**Definition:** whether medicines reach and are used by patients — treatment
coverage and care-seeking (household surveys), ACT usage among febrile
children, stock indicators where public, pharmacovigilance signals.

**Feeds today:** stage 7 status/notes; `detail.research` context. Mostly
`TBC` today — this category is what eventually lights up the last stage with
evidence.

**Target dataset `delivery_indicators`:** `iso3`, `year`, `indicatorId`
(ACT-use-febrile-children, care-seeking, etc.), `value`, `surveyId` (DHS/MIS),
`sourceUrl`, `asOf`.

**New-product angle:** a country readiness/uptake scorecard combining C + D +
E + F per country (registered? in guidelines? procured? used?).

### G. Epidemiology & resistance context

**Definition:** the need side — burden (cases, deaths, incidence), and the
resistance clock (artemisinin partial-resistance marker prevalence, therapeutic
efficacy study results) that gives the whole initiative its urgency.

**Feeds today:** story narrative numbers; framing copy. Not yet a first-class
dataset.

**Target datasets:**
- `burden`: `iso3`, `year`, cases, deaths, incidence (WHO estimates).
- `resistance_markers`: `site`, `iso3`, `year`, `marker` (e.g. pfk13 561H,
  675V), `prevalencePct`, `n`, `study`, `sourceUrl`.

**New-product angle:** a resistance overlay on the country access map — the
single most compelling new visual: *where resistance is confirmed vs where the
new medicines are actually accessible*. Also demand-weighted access metrics
(population/burden covered, not just country counts).

### H. Geographic & demographic reference

**Definition:** join keys and denominators — ISO-3166 alpha-3, country names,
WHO region, population, map geometry.

**Feeds today:** `data/world-map.js` (already generated from Natural Earth);
`iso3` joins. **Gap:** population/burden denominators for weighted metrics.

**Target dataset `country_ref`:** `iso3`, `name`, `whoRegion`,
`malariaEndemic` (bool), `population`, `populationYear`.

## 3. Public source catalog

*Verified 2026-08-22. Grouped by category; each entry lists access method,
cadence and licence. Re-verify URLs before wiring automation.*

Legend: **API** = machine-readable endpoint · **Bulk** = downloadable file
(CSV/Excel) · **Scrape/manual** = HTML or in-app download only.

### Category A — Product & pipeline identity

| Source | Access | Cadence | Licence | Notes |
| --- | --- | --- | --- | --- |
| **MMV portfolio / pipeline** — mmv.org/research-development/mmv-supported-projects + per-project pages | Scrape/manual — **mmv.org 403s bots**; downloadable portfolio slides (PPT/PDF); no API | Quarterly (per MMV) | MMV copyright — extract facts, don't republish the graphic | Best single public tracker for GanLum, ALAQ and peers pre-registration. Stage placements lag the MMV newsroom — check both. "Interactive R&D portfolio" URL is private. |
| **WHO PQ EOI lists (malaria)** — extranet.who.int/prequal/medicines/fpps-apis-eligible-prequalification-eois | Bulk PDF per edition (current: 24th EOI for malaria FPPs, 27 Feb 2026); scrape the index for the latest — URL changes per edition | Irregular (~annual, follows guideline/EML changes) | WHO terms (CC BY-NC-SA 3.0 IGO) | Earliest public signal a product entered PQ scope. EOI inclusion ≠ dossier submitted. Product-level extraction requires PDF parsing. |
| **EMA download-medicine-data tables** — ema.europa.eu/en/medicines/download-medicine-data | Bulk Excel + site-wide structured JSON (API-grade) | **Nightly** | EMA — free reuse with attribution | Also the identity record for EU-M4all products (INN, sponsor, ATC, opinion dates). Post-2023 schema revamp — pin column names per snapshot. |

### Category B — Clinical development & evidence

| Source | Access | Cadence | Licence | Notes |
| --- | --- | --- | --- | --- |
| **ClinicalTrials.gov API v2** — `https://clinicaltrials.gov/api/v2/studies` | API (REST/JSON, no key). E.g. `?query.intr=ganaplacide`, `?query.term=KALUMA`, `filter.overallStatus=`, token-based pagination | Daily | US public domain | v1 retired — v2 only. Sponsor statuses can be stale; cross-check `statusModule.lastUpdatePostDate`. ~50 req/min. **Primary trial feed.** |
| **WHO ICTRP** — trialsearch.who.int | Scrape/manual: search with XML export of results; full weekly dataset only for registered users on request. No public API | Registry imports ~weekly | WHO — non-commercial, attribution; full-set redistribution restricted | Needed for PACTR/CTRI-only African/Asian trials. Dedupe on secondary IDs against ClinicalTrials.gov. Use monthly XML pulls as a supplement. |

### Category C — Regulatory status

| Source | Access | Cadence | Licence | Notes |
| --- | --- | --- | --- | --- |
| **WHO Prequalified FPP list** — extranet.who.int/prequal/medicines/prequalified/finished-pharmaceutical-products | **Bulk: "Download list as CSV" button** (no API). Filters incl. therapeutic area = Malaria, 2-FDC/3-FDC | Continuous, per PQ decision | WHO terms (CC BY-NC-SA 3.0 IGO) | ~649 FPPs; fields incl. WHO ref no., INN/form/strength, applicant, PQ date. Legacy `/pqweb/` URLs partly 404 — use `/prequal/`. CSV headers drift; suspensions/delistings are separate notices — **snapshot and diff**. |
| **WHO PQ Vector Control list** — extranet.who.int/prequal/vector-control-products/prequalified-product-list | Bulk CSV download, same platform | Continuous | WHO terms | 99 products incl. **spatial emanators** category — covers the prevention-tool row directly. Cross-reference the under-assessment/pipeline page for pre-PQ status. |
| **EMA EU-M4all / Art. 58 opinions** — via the EMA data tables (Category A) | Bulk Excel / JSON, nightly | Nightly | EMA — reuse with attribution | EU-M4all category (~15 products) includes Pyramax with opinion dates. Use the data tables — the EU-M4all narrative page is stale (2020). |
| **OpenFDA Drugs@FDA API** — `https://api.fda.gov/drug/drugsfda.json` | API (JSON; free key = 240 req/min) + bulk ZIP. Verified e.g. `search=products.active_ingredients.name:"artemether"` → Coartem NDA022268 with full submission history | Weekly (openFDA) / daily (source) | US public domain | US approvals only — relevant for US filings (Coartem, artesunate injection; Eurartesim has no US NDA). Prefer `openfda.generic_name` for robust matching. |
| **WHO CRP (collaborative registration)** — who.int regulation-prequalification pages | PDF only: participating-country lists (PQ-CRP Jun 2024; SRA-CRP Nov 2024). **No public product × country registration dataset** — WHO's FAQ says outcome lists await the ePQS portal | ~Annual PDFs | WHO terms | **The biggest gap in the public record** for exactly what the country map needs. Mitigate via NRA registers + WHO news announcements; **watch for the ePQS public portal**. |
| **NRA public registers** — Nigeria NAFDAC Greenbook (greenbook.nafdac.gov.ng); Tanzania TMDA (imis2.tmda.go.tz); Ghana FDA (verifypermit.fdaghana.gov.gh — TLS cert expired at check); Kenya PPB (no reliable public register — sporadic PDFs) | Scrape-only HTML/dynamic portals (NAFDAC has scrapeable JSON XHR endpoints — the most machine-friendly). No exports, no APIs | Continuous but no change feeds — snapshot & diff | Unlicensed government-register data — attribute and cache | Ground truth for `regulatory_events` NRA rows. Brand-vs-INN naming inconsistent; uptime patchy. Prioritize registers for the portfolio's target countries. |
| **WHO-Listed Authorities (WLA)** — who.int/initiatives/who-listed-authority-reg-authorities | PDF lists (WLA + transitional, Dec 2025; ML3/ML4 Apr 2026) | 2–4 updates/yr | WHO terms | Small reference set — hand-curate. Defines which approvals count as reliance anchors. |
| **African Medicines Agency (AMA)** — au-ama.africa | HTML news only; continental listing shows **0 products listed** as of Aug 2026 | Ad hoc | Unstated | **Future source** — track the continental-listing register; not a current feed. |

### Category D — Policy & guideline adoption

| Source | Access | Cadence | Licence | Notes |
| --- | --- | --- | --- | --- |
| **WHO Guidelines for Malaria** (living guideline, MAGICapp) — app.magicapp.org/#/guideline/LwRMXj | **API (JSON, no auth)**: `GET https://api.magicapp.org/api/v1/guidelines/10462` (version/publish date) and `/guidelines/10462/sections` (recommendation structure; served as HTTP 206 chunks). PDF snapshots on who.int | Living; 1–3 consolidated releases/yr (v9.1 Aug 2025) | CC BY-NC-SA 3.0 IGO | **The** signal for a new WHO recommendation. Poll the API version field, don't diff PDFs (WHO warns PDFs go stale). Guideline ID 10462 is stable. Draft PICOs aren't public signal until published. |
| **MPAG (Malaria Policy Advisory Group)** — who.int/groups/malaria-policy-advisory-group | Bulk PDFs: meeting reports + pre-meeting session docs (cdn.who.int, legacy "mpac-documentation" path) | Twice yearly (Apr + Oct); next 28–30 Apr 2026; reports weeks–months after | CC BY-NC-SA 3.0 IGO | The observable *leading* indicator — no public GDG calendar exists; GDG activity shows up via MPAG agendas, calls for experts, then a MAGICapp version bump. Session docs can move/disappear — archive on ingest. |
| **WMR Annex 4B** — "Antimalarial drug policy in malaria endemic countries" (+ **4A** policy adoption incl. year) | Bulk (Excel, e.g. `wmr2025_annex_4b.xlsx` on cdn.who.int; scrape the annual annex landing page — the `sfvrsn` token changes per upload) | Annual (Dec; data year lags ~1 yr) | CC BY-NC-SA 3.0 IGO | **The core country × policy-line × medicine table** for the `policy_adoption` dataset. Coded at drug-class level, self-reported by national programmes; column layouts shift yearly. |
| **GMP country profiles** — `malaria-2025-{country}-country-profile` PDFs | Bulk PDF per country; no index API | Annual, ~2 months after WMR | CC BY-NC-SA 3.0 IGO | Derived from WMR — use for display/verification only; ingest from the annexes. GHO API carries **no** treatment-policy indicators (checked). |
| **WHO eEML** — list.essentialmeds.org (2025 Model List) | Web UI with configurable XLSX/DOCX/PDF export; **no public API** (probed — 404s); otherwise scrape-only | Biennial (next revision 2027) | **CC BY 3.0 IGO** (no NC clause) | Per-medicine pages track when an antimalarial enters/changes on the Model List; toggle to see rejected/removed items. Manual export snapshot per release is fine given the cadence. |
| **WHO Repository of National EMLs** — who.int (health-product-policy) | Scrape-only index of per-country PDFs (~150+ states) | Rolling; per-country currency varies wildly (2005–2026) | National government documents — mixed terms, not WHO licence | Answering "is product X on country Y's EML" means parsing heterogeneous multilingual PDFs. Use for portfolio countries only, prioritized by burden. |
| **Global Essential Medicines database** — global.essentialmeds.org | Web dashboard, no API/bulk | Static | Check site terms | **June 2017 snapshot** — predates all LAUNCH medicines' listings; historical baseline only. |
| **National guideline documents** (Severe Malaria Observatory country pages, MESA resource hub, WHO country platforms) | Scrape/manual (severemalaria.org 403s non-browser clients) | Irregular | Mixed | Corroborating evidence of guideline text/date; WMR Annex 4B remains the primary truth for policy lines. |

**Signal chain for a new medicine:** MPAG session docs (leading, 2×/yr) →
MAGICapp API version change (event) → eEML listing (biennial) → WMR Annex 4B
national policy lines (annual, ~1-yr lag) → national guideline/EML PDFs
(confirmation).

### Category E — Financing, price & procurement

| Source | Access | Cadence | Licence | Notes |
| --- | --- | --- | --- | --- |
| **Global Fund PQR** (Price & Quality Reporting) — public Tableau workbooks on insights.theglobalfund.org (Transaction Summary + Price Reference Report) | **Tableau only** — use the toolbar "Download → Crosstab/Data" for CSV/Excel, then run `scripts/normalize-pqr.js` on the file. The Data Service API v4.2 exposes **no PQR entity set** (confirmed); pqr.theglobalfund.org is login-only data entry. **Scripted export confirmed blocked (2026-08-22):** the WAF drops direct `.csv` view requests even from a real browser session, and the vizql export commands 500 outside a fully rendered client — keep this manual | Continuous entry; Tableau refresh ~daily/weekly | Global Fund Terms of Use; attribute | **The primary transaction-level price/volume source** (`procurement_transactions`). Reporting lags months-to-a-year — treat recent quarters as incomplete; self-reported (see the official PQR Data Caveats note); watch pack-size/Incoterms when comparing unit prices. |
| **Global Fund Data Service API** — `https://data-service.theglobalfund.org/v4.2/odata` (301s to fetch.theglobalfund.org — follow redirects) | **API (OData v4, no auth)**: Grants, Financials (budgets/disbursements/expenditures), FundingRequests, ProgrammaticIndicators, Eligibility…; filter component = Malaria | Continuous/periodic | Global Fund Terms of Use | Feeds `funding_flows`. v3 endpoints are dead — pin the version path. Data Explorer at data.theglobalfund.org for browsing. |
| **PPM / wambo ACT reference prices** — PDF table linked from theglobalfund.org antimalarial-medicines page (current file generated Mar 2026) | Bulk PDF (needs table extraction); wambo.org itself is login-only | ~Quarterly/biannual | Global Fund Terms of Use | Feeds `reference_prices`. Ceiling/budgeting prices, not transacted prices. Media URL slug changes on republication — scrape the landing page for the current link. |
| **UNICEF Supply Division antimalarials price data** — unicef.org/supply/documents/antimalarials-price-data ("Updated May 2026") | Bulk PDF only; **unicef.org 403s non-browser fetches** — manual/browser download | ~Annual, on LTA changes | UNICEF copyright | LTA ceiling price per product × supplier × year (FCA). Second reference-price stream. |
| **PMI / GHSC-PSM commodity deliveries** | **Archive-only**: pmi.gov unreachable and datahub.usaid.gov DNS dead post-2025 USAID dissolution; the Socrata order-level delivery dataset survives only in Wayback snapshots (US-gov public domain) | Frozen since early 2025 | US public domain (survives takedown) | **The biggest coverage casualty** — US-funded procurement from ~2025 onward is a disclosed gap. Use Wayback CSVs for history; ghsupplychain.org (live, PDFs) for aggregates; KFF trackers for PMI status. |
| **WMR Annex 4G** (commodities distributed: ACTs, RDTs, ITNs by country 2022–2024) + **Annex 4F** (funding by source) | Bulk Excel (annual annex page) | Annual (Dec, ~1-yr lag) | CC BY-NC-SA 3.0 IGO | Feeds `deliveries` — the "share of ACT market" denominator. The old standalone manufacturer-deliveries annex is folded into 4G; NMP-reported with uneven completeness. |
| **OECD DAC CRS** — SDMX API `https://sdmx.oecd.org/public/rest/data/OECD.DCD.FSD,DSD_CRS@DF_CRS,1.6/...` (no auth) + bulk Parquet 1973–2024 | API + Bulk | Annual detailed release (Dec) | CC BY 4.0 | Purpose code **12262 "Malaria control"**, activity-level. Undercounts malaria money in multilateral core contributions; dataflow version appears in the path and changes occasionally. |
| **IHME DAH database 1990–2026** — ghdx.healthdata.org (release 2026-06-11) | Bulk CSV (33.6 MB + codebook), light registration; site 403s plain fetches | Annual | **IHME non-commercial agreement** | Modeled estimates by source/channel/recipient/focus area — won't reconcile line-by-line with CRS or Global Fund; label vintage. |
| **Unitaid IATI data** — publisher `XM-DAC-30010` via IATI Datastore API (api.iatistandard.org, free key) or d-portal.org | API (IATI XML/Datastore) | ~Quarterly | IATI open-attribution terms | Grant-level commitments/disbursements incl. the LAUNCH funder's own malaria portfolio. unitaid.org itself 403s bots and deep links rot after the site restructure. |
| **RBM Funding Landscape dashboard** — dashboards.endmalaria.org/en/funding-landscape | Dashboard (check per-view export) | Periodic | RBM terms | Consolidated GF + PMI + domestic financing view — useful cross-check, and the future host's own data property. |
| **MSH International Price Guide** | **Retired** (30 Jun 2024; last data 2015); archive PDFs only | Dead | Free non-commercial | Pre-2016 historical context only. |

### Category F — Delivery, use & safety

| Source | Access | Cadence | Licence | Notes |
| --- | --- | --- | --- | --- |
| **DHS Program API** (DHS + Malaria Indicator Surveys) — `https://api.dhsprogram.com` | API (REST/JSON, no key for basics). E.g. `/rest/dhs/data/ML_FEVT_C_ACT?f=json` (ACT use in febrile children); returns CountryName, SurveyYear, SurveyType, Value, denominators | Per survey (each country every ~3–5 yrs) | Aggregates free with citation; microdata needs registration | Always surface `SurveyYear` — "latest" can be 5+ yrs old. Unregistered calls capped ~5,000 rows; free key raises limits. `searchTerms` on the indicators endpoint does **not** filter — use `indicatorIds=`. |
| **WMR Annexes 4Ca/4Cb** — household-survey treatment indicators 2017–2024 | Bulk (Excel, per-annex URLs on the annual annex page) | Annual (Dec) | CC BY-NC-SA 3.0 IGO | Same parsing caveats as other WMR annexes (§ Category G). |
| **Severe Malaria Observatory** (MMV) — severemalaria.org | Scrape/manual only — returns HTTP 403 to non-browser clients; no structured data | Continuous editorial | Cite per MMV terms | Context for severe-malaria treatment landscape; manual citation, not a feed. |
| **ACTwatch (historic 2008–2018) / ACTwatch Lite** — psi.org/actwatch-lite | Bulk per-study datasets (CSV/Stata), linked from PSI page; no API | Per study (irregular; Lite pilots Benin/Cameroon/Nigeria 2023–24) | Open access, cite study | Private-sector antimalarial availability, price, market share — the only public window on the private channel. |

### Category G — Epidemiology & resistance context

| Source | Access | Cadence | Licence | Notes |
| --- | --- | --- | --- | --- |
| **WHO GHO OData API** — `https://ghoapi.azureedge.net/api/` | API (OData v4, no key). E.g. `/api/MALARIA_EST_DEATHS?$filter=SpatialDim eq 'NGA'`; ~33 malaria indicators, country-year, 2000–2024, with uncertainty bounds | Annual, synced to WMR | CC BY-NC-SA 3.0 IGO | Convenient but rounded/derived — WMR Excel annexes are authoritative. Use OData v4 filter syntax; older v3 examples fail. |
| **World Malaria Report data annexes** — who.int/publications/m/item/annexes-world-malaria-report-2025 | Bulk (Excel per annex on stable cdn.who.int URLs). Key annexes: 4H population + estimated cases/deaths 2000–2024; 4I–4L reported cases/deaths splits; 4F funding; 4G commodity distributions; 4A/4B drug policy | Annual, early Dec | CC BY-NC-SA 3.0 IGO | **Annex page URL changes each edition** — don't hard-code. Merged headers/footnotes need a per-annex parser, revalidated yearly. Estimates re-modelled retroactively — store report vintage. |
| **Malaria Atlas Project (MAP)** — malariaatlas.org / data.malariaatlas.org | API via R package `malariaAtlas` v1.7.0 (`getPR()`, `getRaster()`, `getShp()`) over MAP GeoServer (WMS/WCS/WFS) | Rasters ~annual; survey points continuous | CC BY 4.0 (attribute MAP) | Portal is a JS SPA — automate via R package/GeoServer, not scraping. Post-2023 layer IDs changed — discover with `listRaster()`. Modelled estimates differ from WHO's — label the source. |
| **WHO Malaria Threats Map** — apps.who.int/malaria/maps/threats/ | In-app "Download data" (Excel/CSV) for the drug efficacy & resistance database (TES failure rates; PfKelch13 marker prevalence). Underlying ArcGIS REST service is **unstable** — do not build on it | Continuous/periodic; major refresh around WMR | CC BY-NC-SA 3.0 IGO; retain per-record citations | Angular SPA, downloads user-initiated — plan a periodic manual/browser-automation pull. Marker denominators vary by study; don't pool naively. Bulk questions: gmp-maps@who.int. |
| **WWARN / IDDO molecular surveyors** — iddo.org/wwarn/tracking-resistance | Scrape/manual: per-study export of published aggregates from the three surveyors (K13, partner-drug, SP). Individual-level data gated behind IDDO Data Access Committee | Irregular (lags literature 6–12 mo) | Aggregates citable with attribution; IPD under DUA, no redistribution | Literature-derived — overlaps WHO Threats Map, neither is a superset. Use aggregates only. |
| **MalariaGEN Pf8** — malariagen.net/data (released 2025-06-30) | Bulk: drug-resistance marker TSVs on Zenodo (small); VCF/CRAM via ENA; Zarr via `malariagen_data` Python package | Major release every ~2–3 yrs | Open; cite Wellcome Open Research DOI 10.12688/wellcomeopenres.24031.1 | 33,325 samples, 34 countries, per-sample genotypes at 6 resistance loci. Collection years lag release 2–4 yrs — a baseline, not live surveillance. Precompute prevalence aggregates from the Zenodo TSV. |

### Category H — Geographic & demographic reference

| Source | Access | Cadence | Licence | Notes |
| --- | --- | --- | --- | --- |
| **World Bank API** — `https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json` | API (JSON, no key) | Annual | CC BY 4.0 | Response is `[metadata, data]`; filter out regional aggregates (`region.id != ""`); paginate. **Default denominator source.** |
| **UN WPP Data Portal API** — population.un.org/dataportalapi | API — now requires a free bearer token (email population@un.org) | Biennial revisions | UN terms | Only needed for age structure (e.g. under-5 denominators). Note: **WMR Annex 4H ships the exact denominators WHO used** — most defensible for rates shown next to WHO burden figures. |
| **Natural Earth** (already in `data/world-map.js`) | Bulk (public domain) | As released | Public domain | In place; no action. |

### Cross-cutting findings from source verification

- **True no-auth APIs are rare**: ClinicalTrials.gov v2, WHO GHO OData, DHS,
  World Bank, Global Fund Data Service (grants — *not* PQR), OECD CRS SDMX,
  MAGICapp guideline API, OpenFDA, IATI. Everything else is bulk-file,
  in-app export, PDF, or scrape.
- **The two hardest gaps map exactly to the two "underutilized" bottlenecks**:
  country registration (no public CRP product×country dataset — NRA scraping +
  ePQS watch) and US-funded procurement (GHSC-PSM dataset offline since the
  2025 USAID dissolution — archive-only; disclose the gap).
- **Estimate lineage matters**: WHO (GHO/WMR), MAP and IHME model burden and
  financing differently — pick WMR/GHO as the canonical series, label
  alternatives, store the report vintage (figures are revised retroactively).
- **Snapshot-and-diff is the universal pattern**: PQ lists, NRA registers,
  MMV portfolio, guideline versions — none publish change feeds; our dated
  raw snapshots are what turn them into event streams.

## 4. Collection cadence & pipeline design

Three collection modes, matched to how each source publishes:

| Mode | Sources | Mechanism |
| --- | --- | --- |
| **Automated pull** (scriptable now) | ClinicalTrials.gov v2, WHO GHO OData, DHS API, World Bank API, Global Fund Data Service OData, OECD CRS SDMX, MAGICapp guideline API, OpenFDA, EMA data tables (nightly bulk), IATI Datastore (Unitaid), MAP (R package) | Fetcher scripts writing raw JSON/CSV snapshots into `sourcing/raw/<source>/`, then normalizers producing the §2 staging CSVs (see [`sourcing/README.md`](../sourcing/README.md)). **Built:** `scripts/fetch-trials.js` (trial watch with change diff), `scripts/fetch-globalfund.js` (malaria grants + disbursements) and `scripts/fetch-regulatory.js` (WHO PQ CSV exports + EMA EU-M4all xlsx → `regulatory_events`, with a listings watch). Can run as a scheduled GitHub Action; diffs open a review issue — **never write directly to `data/products.js`** (the analyst + validator stay the gate). |
| **Scheduled manual / browser download** (bulk files, changing URLs, bot-blocked sites) | WMR annexes (annual, Dec), **PQR Tableau crosstab export**, Malaria Threats Map in-app export, WHO PQ CSV buttons, UNICEF price PDF, PPM reference-price PDF, eEML export, IHME DAH CSV | Calendar-driven checklist entries in the quarterly loop (analyst guide §9/§11); saved with the download date in the filename. Several sites 403 non-browser clients (unicef.org, mmv.org, severemalaria.org, ghdx) — these stay manual or use browser automation. |
| **Monitored pages** (no data files — events) | MMV pipeline page, EOI lists, MPAG announcements & session docs, manufacturer/press releases, NRA registers, AMA continental listing, WHO ePQS portal (future CRP outcomes) | Quarterly review sweep; findings enter as ordinary sourced edits (`source`, `asOf`) via the existing update loop. An RSS/page-diff watcher is a cheap upgrade later. |

**Cadence calendar** (aligns with the existing quarterly brief):

| When | Action |
| --- | --- |
| Weekly (automated — `sourcing.yml`, Mon 06:00 UTC) | Trial watch diff (ClinicalTrials.gov) — opens a review issue when changes are found. |
| Monthly (automated — `sourcing.yml`, 3rd 06:30 UTC — plus one manual step) | Global Fund Data Service pull (grants/financials); WHO PQ + EMA regulatory pull with listings watch; PQR Tableau crosstab export (manual); MAGICapp version poll; ICTRP XML supplement. |
| Quarterly (manual sweep) | EOI check, NRA register spot-checks for portfolio countries, MMV pipeline diff, Threats Map export, UNICEF/PPM price-list check, MPAG doc archive (Apr/Oct) — feeding the quarterly brief. |
| Annually (Dec–Jan) | WMR annex ingest (burden 4H–4L, policy 4A/4B, funding 4F, commodities 4G, surveys 4Ca/4Cb); re-validate annex parsers; refresh denominators. |
| Per event | EMA CHMP opinions, WHO guideline updates, GDG/MPAG outcomes — logged as they happen via the changelog. |

**Pipeline rules** (inherit the repo's lineage discipline):

1. Raw snapshots are append-only and dated — the `history/` pattern applied to
   inputs, enabling later "as of" playback and diff-based products.
2. Every staging row carries `sourceUrl` + `retrievedDate` + (where the source
   states one) the source's own `asOf`.
3. One normalizer script per source; regenerated staging files are committed,
   never hand-edited — same rule as `unitaid/` and `synthetic/`.
4. The dashboard contract is fed *from* staging by an analyst decision, not by
   automation: collected values become proposals (a generated diff/brief), and
   the validator remains the only gate. *First cycle completed Aug 2026: the
   staged evidence was packaged as the v2 preview (`data/products.v2.js` +
   the `/v2/` edition) for LAUNCH review.*

## 5. Licensing & attribution constraints

| Licence class | Sources | What it means for us |
| --- | --- | --- |
| **CC BY-NC-SA 3.0 IGO** | WHO GHO, WMR annexes, Malaria Threats Map, most WHO publications | Attribution + non-commercial + share-alike. Fine for a public-good transparency dashboard, but (a) confirm with RBM/Unitaid that the hosted dashboard isn't classed as commercial use, (b) any CSV re-export of WHO-derived values must carry the attribution and licence note. |
| **CC BY 4.0 / BY 3.0 IGO** | Malaria Atlas Project, World Bank, OECD CRS, WHO eEML (BY 3.0 IGO — no NC clause) | Attribution only — safe for all planned uses. |
| **Public domain** | ClinicalTrials.gov (US gov), archived GHSC-PSM data, Natural Earth | No constraints; courtesy citation. |
| **Open with citation / site terms** | MalariaGEN Pf8 (cite DOI), ACTwatch datasets, Global Fund data & PQR (Terms of Use, attribute), EMA (attribute), IATI/Unitaid | Cite in the `source` field and any export footer. |
| **Non-commercial only** | IHME DAH database (NC user agreement) | Fine for the public-good dashboard; excluded from anything with a commercial edition. |
| **Restricted / gated** | IDDO/WWARN individual-level data (DUA, no redistribution), ICTRP full dataset (registered users), DHS microdata (registration), UN WPP API (token), MMV portfolio graphic (permission to republish) | Use only published aggregates or extracted facts; keep gated pulls out of redistributed files. |

Practical rule: the existing `source` provenance field doubles as the
attribution mechanism — every collected value already names its origin. Add a
data-credits section to the dashboard footer once collected data goes live,
listing each source and licence in one place.

## 6. New data products enabled

Ranked by (value ÷ collection effort), each derived from the staging datasets
in §2 — never hand-entered:

1. **Verified country access map** (C + D → `countries.list` with
   `status: "verified"`) — already built in the UI; this plan supplies the
   data. Registration rows from NRA registers/PQ/CRP; guideline/MFT levels
   from WMR policy annexes + national guidelines.
2. **Procurement tracker** (E) — quarterly volumes and median prices per
   product from PQR transactions; channel split computed, not typed. Directly
   closes the open checklist item and DHA–PPQ's bottleneck evidence.
3. **Resistance × access overlay** (G + C/D) — the Threats Map / WWARN marker
   prevalence layered under the country access map: *where resistance is
   confirmed vs where new medicines are actually available*. The strongest
   advocacy visual the data can support.
4. **Policy-adoption tracker** (D) — year-over-year diff of WMR annex 4A/4B:
   WHO recommendation → national adoption diffusion curve per product
   (quantifies ASPY's bottleneck).
5. **Trial watch feed** (B) — automated diff of ClinicalTrials.gov v2 records
   for portfolio products; slipped completion dates surface as early
   bottleneck warnings and changelog candidates.
6. **Time-to-access benchmarking** (C) — journey-gate dataset extended with
   per-country registration lags; "waiting years" per country, product vs
   product; feeds the data story with computed rather than narrative numbers.
7. **Country readiness scorecard** (C + D + E + F) — registered? in
   guidelines? procured? used? — one row per country per product; the natural
   next dashboard page once staging datasets exist.
8. **Demand-weighted access metrics** (G + H) — % of burden (not just country
   count) covered at each access level, using WMR annex 4H denominators.
9. **Pipeline horizon scan** (A + B) — quarterly diff of MMV portfolio and PQ
   EOI lists proposes new poster rows before they're requested.
