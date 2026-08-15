# Domain Primer for Developers

*What the data actually means. Read this before touching the schema or building
features — most design decisions in this repo trace back to a fact on this page.*

---

## 1. The problem the dashboard exists to solve

Malaria still kills on the order of half a million people a year, and progress
has stalled since 2015. New medicines exist or are close — but historically it
takes **10–15+ years** for a malaria product to get from regulatory approval to
routine use in the countries that need it (example: pyrethroid-PBO bednets took
8 years just to move from an interim to a full WHO recommendation). Meanwhile
**artemisinin partial resistance** — parasites responding more slowly to the
core drug class — has emerged in Southeast Asia and is now confirmed in parts
of East Africa, which puts a clock on everything.

**LAUNCH** (Launch Transparency Initiative for new malaria tools) is a
Unitaid-funded initiative betting that a big part of the delay is a
*coordination failure*: every actor (WHO, funders, regulators, manufacturers,
ministries) waits on signals from the others, and nobody can see the whole
board. The dashboard makes the whole board visible — every product, every gate,
every bottleneck — so partners can act on delays instead of discovering them
years later. That is why the **red flag with a dated reason** is the central UI
element, not a decoration.

Governance: technical oversight by the LAUNCH AMDR Core Advisory Group.
(AMDR = antimalarial drug resistance.) Hosting: RBM Partnership to End Malaria,
the global coordination platform for malaria.

## 2. The access pathway — what the 8 stages really are

The `stages` array models the journey of a medicine. The critical insight for a
developer: **these are three different kinds of approval plus a delivery
chain**, run by different institutions that mostly operate sequentially. A
product can be fully "approved" in one sense and completely unavailable in
another — that mismatch is the whole story of the two "underutilized" products.

| # | Stage in schema | What it actually is | Who runs it |
| --- | --- | --- | --- |
| 0 | **R&D & clinical** | Lab discovery → Phase I (safety) → Phase II (dose) → Phase III (large multi-country efficacy trials). ~3–6 years for trials alone. | Manufacturer + product development partnerships (PDPs) |
| 1 | **Regulatory approval (SRA)** | A *stringent regulatory authority* (EMA, US FDA…) reviews the full dossier. Malaria products usually use the **EMA Article 58** procedure (now "EU-M4all"): a full EMA scientific review for medicines intended for use *outside* the EU. This opinion anchors everything downstream. | EMA / FDA |
| 2 | **WHO guidelines** | Separate from quality review: the WHO **Guidelines Development Group (GDG)** weighs clinical evidence (GRADE methodology) and decides whether WHO *recommends* the medicine in its Guidelines for Malaria. Countries largely copy these. | WHO Global Malaria Programme |
| 3 | **WHO prequalification (PQ)** | Separate again: a quality/manufacturing assessment (dossier + site inspections). PQ is the ticket that lets UN agencies and the Global Fund *buy* the product. A product must first be invited via the **EOI (Expression of Interest)** list. | WHO Prequalification Team |
| 4 | **Country registration** | Each endemic country's own regulator licenses the product nationally. Often sequential, country by country; the **AMA** (African Medicines Agency) and WHO **CRP** (collaborative registration, ~90 working days relying on SRA/PQ work) exist to speed this up. | National regulatory authorities |
| 5 | **National policy adoption** | The ministry of health / national malaria control programme (NMCP) writes the medicine into the *national treatment guidelines* — the document that determines what health workers actually prescribe and what the public sector buys. A WHO recommendation does **not** automatically flow into national guidelines; this gap is ASPY's bottleneck. | Ministries of health / NMCPs |
| 6 | **Procurement** | Someone pays: Global Fund grants (~majority of ACT volume), US PMI, UNICEF, domestic budgets, private market. Tenders, reference pricing, forecasting. A product can be recommended, registered, in guidelines — and still barely procured (DHA–PPQ's bottleneck). | Global Fund, PMI, governments, procurement agents |
| 7 | **In-country delivery** | Supply chain (ports → central stores → districts → facilities), health-worker training, job aids, pharmacovigilance. The last mile. | Governments + implementing partners |

Typical delay hotspots (and therefore the interesting data): trial recruitment,
WHO guideline scheduling (GDG meets on its own calendar), PQ inspections,
sequential national registrations, guideline-committee schedules, financing
cycles (Global Fund runs 3-year grant cycles), and supply-chain readiness.

## 3. The cast of actors you'll see in the data

- **WHO** wears three separate hats in this dataset — recommender (GDG /
  guidelines), quality assessor (PQ), and coordinator. Never conflate them.
- **SRAs / WLAs** — stringent regulatory authorities (EMA, FDA…) and the newer
  WHO-Listed Authority framework. "SRA approval" in the data almost always
  means EMA Article 58.
- **MMV** (Medicines for Malaria Venture) — the dominant malaria PDP;
  co-developer of GanLum and ASPY. **MORU** (Mahidol-Oxford Research Unit) —
  runs the DeTACT triple-ACT programme behind ALAQ. **DNDi** — another PDP in
  the triple-ACT space.
- **Manufacturers** — Novartis (GanLum), Fosun Pharma (ALAQ), Shin Poong
  (ASPY/Pyramax), Alfasigma + Guilin and others (DHA–PPQ). Note DHA–PPQ has
  *multiple* PQ'd suppliers — that's supply security, and why its
  `manufacturer` field is plural.
- **Funders/procurers** — Global Fund (whose **PQR** database is the public
  record of prices and volumes), US **PMI**, Unitaid (funds LAUNCH itself),
  UNICEF, and the Gates Foundation (whose approval gates the future spatial
  emanators row).
- **RBM Partnership to End Malaria** — the coordination platform that will host
  the dashboard.

## 4. The four products, and why these four

The initiative deliberately picked **two pairs** that stress different halves
of the pathway:

**Pipeline pair — testing the regulatory half:**

- **GanLum** (ganaplacide–lumefantrine, KLU156): the first *non-artemisinin*
  novel-class combination in ~25 years — strategically huge because it works
  against artemisinin-resistant parasites. Phase III (KALUMA) met its endpoint
  Nov 2025 (97.4% cure rate). Watch: how fast SRA → guidelines → PQ goes.
- **ALAQ** (artemether–lumefantrine–amodiaquine): a **triple ACT (TACT)** —
  adding a second partner drug to a standard ACT to protect it from
  resistance. Developed by the MORU-led DeTACT partnership with Fosun;
  targeting approval/PQ ~2027.

**Underutilized pair — testing the adoption half (both fully approved for a
decade):**

- **ASPY** (pyronaridine–artesunate; trade name Pyramax): EMA opinion 2012,
  PQ'd, WHO-recommended 2022, registered in 25+ countries — yet in only a
  handful of national guidelines. Bottleneck: **policy adoption**.
- **DHA–PPQ** (dihydroartemisinin–piperaquine): approved 2011, recommended
  2015, multiple PQ'd suppliers — yet a small share of global ACT procurement.
  Bottleneck: **procurement**.

The paired design is why the board renders both stories with the same eight
stages: the pipeline products light up red on the left half, the marketed
products on the right half.

**Future row — spatial emanators** (SC Johnson): a *prevention* tool (a device
that releases mosquito-repelling chemicals into the air), pending funder
approval. Prevention products go through a different WHO track (PQ **Vector
Control**, different guideline group), which is why the developer guide flags
per-product stage names as a future need.

## 5. Terminology that trips developers up

- **ACT** — artemisinin-based combination therapy: fast-acting artemisinin
  derivative + longer-acting partner drug. The global standard for
  uncomplicated falciparum malaria. "AL" (artemether–lumefantrine, Coartem) is
  ~70%+ of the market — every product here is trying to diversify away from
  that monoculture.
- **Artemisinin partial resistance** — parasites cleared more slowly (not full
  treatment failure yet, in Africa). The urgency driver. Validated by molecular
  markers (Pfkelch13 mutations).
- **MFT (multiple first-line therapies)** — deploying 2–3 different first-line
  treatments simultaneously (by district, facility, or age band) to spread drug
  pressure and slow resistance. The main *use case* under which the new
  products enter — hence `inMft` in the country data.
- **Recommendation ≠ prequalification ≠ registration.** Three independent
  approvals (stages 2, 3, 4). A developer who models these as one "approved"
  boolean has destroyed the dataset's meaning.
- **"Treatment"** as a unit = one full course for one patient (adult course
  unless noted). Procurement volumes ("0.9M treatments") count courses, not
  tablets or packs.
- **Uncomplicated vs severe malaria** — everything here targets
  *uncomplicated* falciparum malaria (oral treatment). Severe malaria
  (injectable artesunate) is a different market.
- **Recrudescence vs reinfection** — why efficacy is reported as
  "PCR-corrected cure rate": genotyping distinguishes the original infection
  coming back (drug failure) from a new mosquito bite (not drug failure).
- **GDF vs GDF** — beware: in global health "GDF" usually means the *Global
  Drug Facility* (a TB mechanism). If it appears in malaria pricing context it
  more likely refers to a Global Fund pooled-procurement arrangement. Ask, don't
  assume.
- **Seasonal niches** — SMC (seasonal malaria chemoprevention), IPT
  (intermittent preventive treatment, e.g. in pregnancy), MDA (mass drug
  administration). DHA–PPQ's current use concentrates in these.

## 6. Schema → domain mapping

| Schema element | Domain meaning | Typical public source |
| --- | --- | --- |
| `stages[8]` per product | Position at each gate of §2 | Varies by stage (see below) |
| `currentStage` | The gate the product is actively working through | LAUNCH analyst judgement |
| `flag` | The bottleneck sentence — the initiative's core editorial output | LAUNCH analysis |
| `detail.price` | Indicative price per **treatment course** — commercially sensitive, hence the confirmation rule | Global Fund reference prices / PQR; manufacturer confirmation |
| `detail.country.registered` | Count of national marketing authorisations | National regulators; manufacturer |
| `detail.country.inGuidelines` | Count of national treatment guidelines including the product | NMCP documents; LAUNCH country survey |
| `detail.country.inMft` | Countries planning/running MFT that includes the product | LAUNCH country survey |
| `detail.countries.list[].level` | Ordinal access level per country: `registered` < `guidelines` < `mft` (highest wins on the map) | Same as above |
| `detail.volume` | Procured treatment courses by channel | Global Fund PQR, PMI reports |
| `detail.journey` | Dated gate history — feeds the timing chart, the delay-advocacy visual | EMA/WHO records (public, datable) |
| `detail.research` | Operational research: real-world implementation studies (distinct from clinical trials) | Study registries, partner announcements |
| `detail.adoption` | What a country must do before use (training, pharmacovigilance) | WHO guidance, manufacturer labels |
| `milestones[]` | Fine-grained gate events with next-expected-step — the accountability ledger | Mixed; each row carries its own `source` |
| Stage-level sources | Stage 1 → EMA registers; 2 → WHO Guidelines for malaria; 3 → WHO PQ list & EOI; 4 → national registers/AMA; 5 → national guidelines; 6 → Global Fund PQR/PMI | |

## 7. Why the governance rules are shaped this way

- **Prices are the most sensitive field.** Manufacturers operate tiered/
  confidential pricing; publishing an unconfirmed number can damage the very
  relationships LAUNCH needs. Hence: a displayed price requires
  `confirmedInWriting` or a public source, and the written-confirmation
  register lives *outside* this public repo.
- **`TBC` over estimates.** The audience includes the institutions being
  measured (WHO, funders, manufacturers). One invented number discovered by
  them ends the dashboard's credibility; an honest gap doesn't.
- **A red light must carry a dated reason** because "delayed" is an accusation
  in this domain — WHO committees, regulators and companies will read it. The
  validator makes an unsubstantiated accusation structurally impossible.
- **The map's verified-only rule** exists because a colored country reads as a
  fact ("registered in Nigeria") in a way a TBC count never does.

## 8. Where to learn more

- WHO *World Malaria Report* (annual) — the epidemiological backdrop.
- WHO *Guidelines for Malaria* — the recommendation layer (stage 2).
- WHO Prequalification site — PQ list + EOI (stage 3).
- WHO *Strategy to respond to antimalarial drug resistance in Africa* (2022) —
  why MFT and drug diversification matter.
- Global Fund PQR / data explorer — prices and volumes (stage 6).
- MMV's annual pipeline poster — the standard industry map of what's coming.
- The LAUNCH presentation deck (internal) — slides 2–3 for the delay evidence,
  slides 7–9 for the dashboard's mandate; this repo implements slides 7–8.

*This primer is descriptive background for developers, not displayed content.
If anything here conflicts with `data/products.js` + its cited sources, the
data file wins — and the primer should be corrected.*
