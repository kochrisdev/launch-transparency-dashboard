// LAUNCH dashboard data file — VERSION 2 PREVIEW.
// Same contract as data/products.js (strict JSON after the marker line;
// validate with `node scripts/validate-data.js data/products.v2.js`).
//
// This is the v2 proposal dataset: data/products.js (v1, 2026-08-15) plus the
// first collected-data updates from the public-source staging layer
// (sourcing/staging/ — Global Fund PQR extract, WHO PQ lists, EMA EU-M4all
// table, ClinicalTrials.gov). v1 is untouched; the root dashboards keep
// reading it. The v2/ page edition reads this file. When the LAUNCH team
// signs off, these values merge into data/products.js through the normal
// update loop and this file is retired.
window.LAUNCH_DATA =
{
  "meta": {
    "lastUpdated": "2026-08-23",
    "dataStatus": "draft",
    "edition": "v2-preview",
    "host": "RBM Partnership to End Malaria"
  },
  "stages": [
    "R&D & clinical",
    "Regulatory approval (SRA)",
    "WHO guidelines",
    "WHO prequalification",
    "Country registration",
    "National policy adoption",
    "Procurement",
    "In-country delivery"
  ],
  "glossary": {
    "ACT": "Artemisinin-based combination therapy — the standard class of malaria treatments pairing an artemisinin derivative with a longer-acting partner drug.",
    "SRA": "Stringent Regulatory Authority — an advanced regulator (e.g. EMA, US FDA) whose review anchors WHO prequalification and country registrations.",
    "WLA": "WHO-Listed Authority — a regulator assessed by WHO as operating at an advanced level.",
    "Article 58": "EMA procedure giving a scientific opinion on high-priority medicines intended for markets outside the EU.",
    "GDG": "Guidelines Development Group — the WHO expert group that reviews evidence and formulates treatment recommendations.",
    "PQ": "WHO prequalification — quality, safety and efficacy assessment that makes a product eligible for procurement by UN agencies and major donors.",
    "MFT": "Multiple first-line therapies — deploying several first-line treatments in parallel to reduce drug pressure and slow resistance.",
    "EOI": "Expression of Interest — the WHO prequalification invitation list; a product must be on it before a PQ dossier can be assessed.",
    "AMA": "African Medicines Agency — continental body coordinating regulatory review across African Union member states.",
    "PMI": "U.S. President's Malaria Initiative — a major bilateral funder and procurer of malaria commodities.",
    "MMV": "Medicines for Malaria Venture — product development partnership behind several antimalarials.",
    "PQR": "Price & Quality Reporting — the Global Fund database of procurement transactions (volumes and prices).",
    "GMP": "Good Manufacturing Practice — quality standard verified by inspection of manufacturing sites."
  },
  "changelog": [
    { "date": "2026-08-23", "product": "All", "change": "Version 2 preview: first collected-data updates from the public-source staging layer (Global Fund PQR extract 23 Aug 2026, WHO PQ lists, EMA EU-M4all table, ClinicalTrials.gov)." },
    { "date": "2026-08-23", "product": "DHA–PPQ", "change": "Global Fund volumes filled from PQR: 11.5m packs / US$41.5m since 2008; 0.9–4.5% of Global Fund antimalarial spend 2022–24 with a sharp 2025 uptick (US$15.3m). Nine PQ'd presentations across Alfasigma, Guilin and Beijing Holley (2015–2023) recorded." },
    { "date": "2026-08-23", "product": "ASPY", "change": "Global Fund volumes filled from PQR: 940k packs / US$14.5m since 2018, with US$11.6m of it in 2025 (Uganda, Burkina Faso). EMA opinion outcome date 5 Jun 2025 recorded from the EU-M4all table." },
    { "date": "2026-08-23", "product": "GanLum", "change": "KALUMA registry record (NCT05842954) added: trial completed 25 Nov 2025, 1,720 participants (registry actual)." },
    { "date": "2026-08-23", "product": "Spatial emanators", "change": "WHO PQ (vector control) listing of two SC Johnson spatial emanators — Guardian and Mosquito Shield — on 13 Aug 2025 noted on the placeholder row." },
    { "date": "2026-08-15", "product": "All", "change": "Added MMV-style pipeline poster view (pipeline.html) placing each product in its development phase." },
    { "date": "2026-08-15", "product": "All", "change": "Added country access map (illustrative until verified), cross-product pathway timing chart, embeddable product widget, RSS update feed and automatic data-history snapshots." },
    { "date": "2026-08-14", "product": "ASPY", "change": "Renamed from Pyramax to ASPY (pyronaridine–artesunate); trade name retained in the subtitle." },
    { "date": "2026-08-14", "product": "All", "change": "Added glossary tooltips, CSV download, print view and pathway timing (time between gates) for marketed products." },
    { "date": "2026-08-14", "product": "GanLum", "change": "Phase III (KALUMA) marked complete — primary endpoint met, announced 12 Nov 2025; regulatory submission preparation now in progress." },
    { "date": "2026-08-14", "product": "ASPY", "change": "EMA Article 58 date corrected to 2012; July 2025 pregnancy label update added to milestones." },
    { "date": "2026-08-14", "product": "DHA–PPQ", "change": "Eurartesim WHO PQ requalification (Jan 2025) recorded; unknown counts set to TBC pending verification." },
    { "date": "2026-08-14", "product": "All", "change": "Dashboard moved from illustrative placeholders to draft public-source data. Prices and volumes shown as TBC until confirmed." }
  ],
  "products": [
    {
      "id": "ganlum",
      "name": "GanLum",
      "inn": "Ganaplacide–lumefantrine (KLU156)",
      "manufacturer": "Novartis · MMV",
      "class": "pipeline",
      "classLabel": "Pipeline · new chemical class",
      "phase": "regulatory",
      "currentStage": 1,
      "flag": null,
      "stages": [
        { "status": "done", "note": "Phase III (KALUMA, NCT05842954) met primary endpoint: 97.4% PCR-corrected cure rate; registry records 1,720 participants and trial completion 25 Nov 2025 (34 sites, 12 African countries)", "date": "Announced 12 Nov 2025; trial completed 25 Nov 2025", "next": "", "nextDate": "", "source": "Novartis / MMV press releases, 12 Nov 2025; ClinicalTrials.gov NCT05842954", "asOf": "2026-08-22" },
        { "status": "prog", "note": "Regulatory submissions in preparation following Phase III success", "date": "", "next": "Dossier submission (SRA pathway)", "nextDate": "TBC", "source": "Novartis announcement, Nov 2025", "asOf": "2026-08-14" },
        { "status": "idle", "note": "Not started", "date": "", "next": "GDG engagement expected alongside regulatory review", "nextDate": "" },
        { "status": "idle", "note": "Not on the WHO PQ EOI list yet (24th malaria EOI, 27 Feb 2026, checked)", "date": "", "next": "", "nextDate": "", "source": "WHO PQ EOI list (24th edition)", "asOf": "2026-08-22" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" }
      ],
      "detail": {
        "price": { "value": "TBC", "note": "Pricing not yet public — will be shown once confirmed by manufacturer", "source": "", "confirmedInWriting": false, "asOf": "2026-08-14" },
        "useCase": "First non-artemisinin combination in over 25 years — candidate for artemisinin partial-resistance settings and MFT strategies; kills resistant parasites and blocks transmission.",
        "access": [
          "Co-developed with MMV under access-oriented partnership",
          "Access and affordability provisions under discussion",
          "Once-daily, 3-day granule sachet — no separate paediatric development needed"
        ],
        "adoption": [
          "New chemical class — pharmacovigilance planning required",
          "Health-worker training on new regimen"
        ],
        "research": { "lead": "Novartis / MMV", "geographies": "12 African countries (KALUMA trial sites)", "timeline": "Phase III complete Nov 2025", "question": "Efficacy against resistant parasites and transmission blocking" },
        "country": { "registered": 0, "inGuidelines": 0, "inMft": 0, "forecastDemand": "—" },
        "volume": null,
        "volumeNote": "Pre-launch — no procurement yet",
        "milestones": [
          { "milestone": "Phase III (KALUMA)", "status": "done", "label": "Complete", "date": "12 Nov 2025 (trial completed 25 Nov 2025)", "next": "—", "anticipated": "—", "source": "Novartis / MMV press releases; ClinicalTrials.gov NCT05842954" },
          { "milestone": "SRA dossier submission", "status": "prog", "label": "In preparation", "date": "—", "next": "Submission", "anticipated": "TBC", "source": "Novartis announcement, Nov 2025" },
          { "milestone": "WHO GDG engagement", "status": "idle", "label": "Not started", "date": "—", "next": "Pre-submission dialogue", "anticipated": "TBC", "source": "" },
          { "milestone": "WHO prequalification", "status": "idle", "label": "Not started", "date": "—", "next": "EOI listing (not on 24th malaria EOI, Feb 2026)", "anticipated": "TBC", "source": "WHO PQ EOI list (24th edition)" }
        ]
      }
    },
    {
      "id": "alaq",
      "name": "ALAQ",
      "inn": "Artemether–lumefantrine–amodiaquine (triple ACT)",
      "manufacturer": "Fosun Pharma · MORU / DeTACT partnership",
      "class": "pipeline",
      "classLabel": "Pipeline · triple ACT",
      "phase": "phase3",
      "currentStage": 0,
      "flag": null,
      "stages": [
        { "status": "prog", "note": "Co-formulated fixed-dose triple ACT in Phase III programme (DeTACT); dose-optimization published 2025; dispersible taste-masked formulation", "date": "Phase III targeted completion 2025–26", "next": "Phase III results, then dossier preparation", "nextDate": "TBC", "source": "MORU / DeTACT; Clin Pharmacol Ther 2025; WHO PADO malaria, Jun 2025", "asOf": "2026-08-14" },
        { "status": "idle", "note": "Not started", "date": "", "next": "SRA/WLA submission — partnership targets approval by ~2027", "nextDate": "~2027", "source": "DeTACT partnership statements" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not yet included in WHO PQ Expression of Interest list (24th malaria EOI, 27 Feb 2026, checked)", "date": "", "next": "PQ targeted by ~2027 per partnership", "nextDate": "~2027", "source": "WHO PADO malaria, Jun 2025; WHO PQ EOI list (24th edition)", "asOf": "2026-08-22" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" }
      ],
      "detail": {
        "price": { "value": "TBC", "note": "Pricing not yet public — will be shown once confirmed by manufacturer", "source": "", "confirmedInWriting": false, "asOf": "2026-08-14" },
        "useCase": "Triple ACT to protect artemisinin partner drugs — MFT component and first-line option where artemisinin partial resistance is confirmed.",
        "access": [
          "Developed through MORU-led DeTACT partnership with Fosun Pharma",
          "Designed for affordability in endemic-country public sectors",
          "Dispersible, taste-masked formulation suitable for children"
        ],
        "adoption": [
          "Updated treatment guidelines and job aids",
          "Health-worker training (3-drug regimen)"
        ],
        "research": { "lead": "MORU / DeTACT consortium", "geographies": "Multi-site, Africa and Asia (DeTACT trials)", "timeline": "Phase III → 2025–26", "question": "Safety, efficacy and adherence of co-formulated ALAQ at scale" },
        "country": { "registered": 0, "inGuidelines": 0, "inMft": 0, "forecastDemand": "—" },
        "volume": null,
        "volumeNote": "Pre-launch — no procurement yet",
        "milestones": [
          { "milestone": "Dose-optimization of co-formulation", "status": "done", "label": "Complete", "date": "Published 2025", "next": "—", "anticipated": "—", "source": "Clin Pharmacol Ther (2025)" },
          { "milestone": "Phase III programme (DeTACT)", "status": "prog", "label": "In progress", "date": "Ongoing", "next": "Results", "anticipated": "2026", "source": "MORU / DeTACT" },
          { "milestone": "SRA/WLA submission", "status": "idle", "label": "Not started", "date": "—", "next": "Dossier preparation", "anticipated": "~2027", "source": "" },
          { "milestone": "WHO prequalification", "status": "idle", "label": "Not started", "date": "—", "next": "EOI listing, then dossier", "anticipated": "~2027", "source": "WHO PADO malaria, Jun 2025" }
        ]
      }
    },
    {
      "id": "pyramax",
      "name": "ASPY",
      "inn": "Pyronaridine–artesunate (Pyramax)",
      "manufacturer": "Shin Poong Pharmaceutical · MMV",
      "class": "market",
      "classLabel": "Recommended · underutilized",
      "phase": "access",
      "currentStage": 5,
      "flag": "Adoption is the bottleneck — strongly recommended by WHO since 2022 and registered in 25+ countries, but national guideline inclusion remains limited",
      "stages": [
        { "status": "done", "note": "Development complete (Shin Poong / MMV co-development)", "date": "", "next": "", "nextDate": "", "source": "MMV", "asOf": "2026-08-14" },
        { "status": "done", "note": "EMA positive scientific opinion (Article 58/EU-M4all, 16 Feb 2012); label updated 2025 to include treatment of pregnant women (EMA outcome 5 Jun 2025; announced 31 Jul 2025)", "date": "2012 (label update 2025)", "next": "", "nextDate": "", "source": "EMA EU-M4all opinions table; MMV, 31 Jul 2025", "asOf": "2026-08-22" },
        { "status": "done", "note": "Strong recommendation in revised WHO Guidelines for malaria", "date": "2022", "next": "", "nextDate": "", "source": "WHO Guidelines for malaria; MMV", "asOf": "2026-08-14" },
        { "status": "done", "note": "WHO PQ list carries tablets and granules as EMA-Art.-58 alternative listings (refs H-W-2319-2/-3)", "date": "2012–2016", "next": "", "nextDate": "", "source": "WHO PQ list of prequalified medicines (extract 22 Aug 2026)", "asOf": "2026-08-22" },
        { "status": "prog", "note": "Registered in 25+ endemic countries since 2014; further submissions in Asia (Vietnam, Myanmar, Cambodia, Thailand)", "date": "Rolling", "next": "Pending registrations", "nextDate": "TBC", "source": "MMV", "asOf": "2026-08-14" },
        { "status": "late", "note": "National guideline inclusion lags WHO's 2022 strong recommendation — the core adoption gap LAUNCH is tracking; verified country count pending", "date": "", "next": "Country guideline committee reviews", "nextDate": "TBC", "source": "LAUNCH assessment (draft)", "asOf": "2026-08-14" },
        { "status": "prog", "note": "Global Fund procurement 2018–2025: 940,111 packs / US$14.5m — modest overall, but US$11.6m of it landed in 2025 (led by Uganda and Burkina Faso), a sharp uptick consistent with early MFT rollouts", "date": "", "next": "Verify 2025 surge holds in next quarterly PQR extract", "nextDate": "Q4 2026", "source": "Global Fund PQR Transaction Summary (extract 23 Aug 2026)", "asOf": "2026-08-23" },
        { "status": "idle", "note": "Routine delivery limited; concentrated in pilot and study settings", "date": "", "next": "", "nextDate": "" }
      ],
      "detail": {
        "price": { "value": "TBC", "note": "Global Fund reference pricing to be displayed once confirmed for release; PQR transaction prices vary by pack presentation", "source": "", "confirmedInWriting": false, "asOf": "2026-08-23" },
        "useCase": "First-line diversification / MFT component; paediatric granules available; label includes pregnant women (2025 update).",
        "access": [
          "WHO PQ held for tablets and paediatric granules",
          "Registration footprint: 25+ countries and expanding",
          "Co-developed with MMV under access-oriented partnership"
        ],
        "adoption": [
          "Guideline inclusion and case-management training",
          "No cold chain or special administration needs"
        ],
        "research": { "lead": "MMV and partners", "geographies": "Ghana, Vietnam, Burkina Faso and others (efficacy studies)", "timeline": "Ongoing", "question": "MFT deployment models with pyronaridine–artesunate" },
        "country": { "registered": 25, "inGuidelines": "TBC", "inMft": "TBC", "forecastDemand": "TBC" },
        "countries": {
          "status": "illustrative",
          "note": "Illustrative subset for design review — not actual country status. Replace with the verified country survey.",
          "list": [
            { "iso3": "GHA", "level": "mft" },
            { "iso3": "BFA", "level": "mft" },
            { "iso3": "KEN", "level": "mft" },
            { "iso3": "KHM", "level": "mft" },
            { "iso3": "VNM", "level": "guidelines" },
            { "iso3": "CIV", "level": "guidelines" },
            { "iso3": "RWA", "level": "guidelines" },
            { "iso3": "UGA", "level": "guidelines" },
            { "iso3": "NGA", "level": "registered" },
            { "iso3": "COD", "level": "registered" },
            { "iso3": "TZA", "level": "registered" },
            { "iso3": "MOZ", "level": "registered" },
            { "iso3": "SEN", "level": "registered" },
            { "iso3": "CMR", "level": "registered" },
            { "iso3": "MLI", "level": "registered" },
            { "iso3": "MMR", "level": "registered" }
          ]
        },
        "journey": [
          { "label": "EMA Article 58 positive opinion", "year": 2012 },
          { "label": "WHO prequalification (tablets)", "year": 2012 },
          { "label": "Paediatric granules prequalified", "year": 2016 },
          { "label": "WHO strong recommendation", "year": 2022 },
          { "label": "Broad national guideline inclusion", "year": "TBC" }
        ],
        "volume": {
          "total": "940,111 packs · US$14.5m (2018–2025)",
          "period": "Global Fund PQR transactions, 2018–2025 (68 orders; US$11.6m in 2025 alone; top buyers Uganda, Burkina Faso, Ghana)",
          "split": [
            { "channel": "Global Fund (PQR-recorded)", "pct": 100 }
          ],
          "source": "Global Fund PQR Transaction Summary, extract 23 Aug 2026 — sourcing/staging/procurement_transactions.csv. Covers Global Fund-financed procurement only; US PMI data unavailable post-2025 (GHSC-PSM dataset offline). Recent quarters incomplete due to PQR reporting lag."
        },
        "milestones": [
          { "milestone": "SRA approval (EMA Art. 58)", "status": "done", "label": "Complete", "date": "16 Feb 2012", "next": "—", "anticipated": "—", "source": "EMA EU-M4all opinions table" },
          { "milestone": "WHO prequalification", "status": "done", "label": "Complete", "date": "2012–2016", "next": "—", "anticipated": "—", "source": "WHO PQ list" },
          { "milestone": "WHO guideline strong recommendation", "status": "done", "label": "Complete", "date": "2022", "next": "—", "anticipated": "—", "source": "WHO Guidelines for malaria" },
          { "milestone": "Label update — pregnancy", "status": "done", "label": "Complete", "date": "EMA outcome 5 Jun 2025", "next": "—", "anticipated": "—", "source": "EMA EU-M4all opinions table; MMV, 31 Jul 2025" },
          { "milestone": "Country registrations", "status": "prog", "label": "25+ countries", "date": "Rolling", "next": "Asia submissions", "anticipated": "TBC", "source": "MMV" },
          { "milestone": "National guideline inclusion", "status": "late", "label": "Limited — TBC", "date": "—", "next": "Committee reviews", "anticipated": "TBC", "source": "LAUNCH assessment (draft)" },
          { "milestone": "Procurement scale-up", "status": "prog", "label": "940k packs (GF, to 2025)", "date": "US$11.6m in 2025", "next": "Verify surge in next PQR extract", "anticipated": "Q4 2026", "source": "Global Fund PQR (extract 23 Aug 2026)" }
        ]
      }
    },
    {
      "id": "dhappq",
      "name": "DHA–PPQ",
      "inn": "Dihydroartemisinin–piperaquine",
      "manufacturer": "Alfasigma (Eurartesim) · Guilin · Beijing Holley (PQ'd suppliers)",
      "class": "market",
      "classLabel": "Recommended · underutilized",
      "phase": "access",
      "currentStage": 6,
      "flag": "Procurement is the bottleneck — 0.9–4.5% of Global Fund antimalarial spend 2022–24 despite a decade-old recommendation, though 2025 orders surged (PQR, reporting still incomplete)",
      "stages": [
        { "status": "done", "note": "Development complete", "date": "", "next": "", "nextDate": "", "source": "MMV", "asOf": "2026-08-14" },
        { "status": "done", "note": "EMA approval (Eurartesim)", "date": "2011", "next": "", "nextDate": "", "source": "EMA register", "asOf": "2026-08-14" },
        { "status": "done", "note": "WHO-recommended ACT for uncomplicated malaria", "date": "2015 guidelines", "next": "", "nextDate": "", "source": "WHO Guidelines for malaria", "asOf": "2026-08-14" },
        { "status": "done", "note": "Nine PQ'd presentations across three manufacturers — Alfasigma (2015, requal. Jan 2025), Guilin (2019–2020, incl. dispersible paediatric), Beijing Holley (2023) — real supply security", "date": "2015–2023; requal. 20 Jan 2025", "next": "", "nextDate": "", "source": "WHO PQ list of prequalified medicines (extract 22 Aug 2026)", "asOf": "2026-08-22" },
        { "status": "done", "note": "Registered widely; adopted as first-line in several Southeast Asian countries", "date": "Rolling", "next": "", "nextDate": "", "source": "MMV / WHO", "asOf": "2026-08-14" },
        { "status": "prog", "note": "First-line in several SE Asian countries; consideration in African MFT strategies growing; verified country counts pending", "date": "", "next": "MFT strategy decisions", "nextDate": "TBC", "source": "LAUNCH assessment (draft)", "asOf": "2026-08-14" },
        { "status": "late", "note": "Global Fund procurement held at 0.9–4.5% of antimalarial spend 2022–24 (US$41.5m / 11.5m packs cumulative since 2008) — chronic underuse; 2025 shows a sharp uptick (US$15.3m, led by Uganda, Madagascar, Mozambique) that needs confirming as reporting completes", "date": "", "next": "Verify 2025 surge holds in next quarterly PQR extract", "nextDate": "Q4 2026", "source": "Global Fund PQR Transaction Summary (extract 23 Aug 2026)", "asOf": "2026-08-23" },
        { "status": "prog", "note": "Routine use concentrated in Southeast Asia and chemoprevention niches", "date": "", "next": "", "nextDate": "", "source": "LAUNCH assessment (draft)", "asOf": "2026-08-14" }
      ],
      "detail": {
        "price": { "value": "TBC", "note": "Pooled procurement reference pricing to be displayed once confirmed for release; PQR median pack price ≈ US$1.70 across presentations (indicative only — pack sizes vary)", "source": "", "confirmedInWriting": false, "asOf": "2026-08-23" },
        "useCase": "MFT rotation partner; mass drug administration and chemoprevention niches; once-daily dosing.",
        "access": [
          "Nine PQ'd presentations across three manufacturers (Alfasigma, Guilin, Beijing Holley) — supply security via diversity",
          "No single-source dependency",
          "Established API supply chains"
        ],
        "adoption": [
          "ECG guidance for specific risk groups in some guidelines",
          "Otherwise standard ACT case-management training"
        ],
        "research": { "lead": "Multiple academic consortia", "geographies": "Ghana, Mozambique, SE Asia (efficacy and MFT studies)", "timeline": "Ongoing", "question": "MFT rotation sequencing and resistance impact" },
        "country": { "registered": "TBC", "inGuidelines": "TBC", "inMft": "TBC", "forecastDemand": "TBC" },
        "countries": {
          "status": "illustrative",
          "note": "Illustrative subset for design review — not actual country status. Replace with the verified country survey.",
          "list": [
            { "iso3": "KHM", "level": "mft" },
            { "iso3": "VNM", "level": "mft" },
            { "iso3": "MOZ", "level": "mft" },
            { "iso3": "TZA", "level": "mft" },
            { "iso3": "SEN", "level": "mft" },
            { "iso3": "THA", "level": "guidelines" },
            { "iso3": "MMR", "level": "guidelines" },
            { "iso3": "LAO", "level": "guidelines" },
            { "iso3": "IDN", "level": "guidelines" },
            { "iso3": "GHA", "level": "guidelines" },
            { "iso3": "ZMB", "level": "guidelines" },
            { "iso3": "CHN", "level": "registered" },
            { "iso3": "IND", "level": "registered" },
            { "iso3": "NGA", "level": "registered" },
            { "iso3": "BFA", "level": "registered" },
            { "iso3": "KEN", "level": "registered" }
          ]
        },
        "journey": [
          { "label": "EMA approval (Eurartesim)", "year": 2011 },
          { "label": "WHO guideline recommendation", "year": 2015 },
          { "label": "WHO prequalification", "year": 2015 },
          { "label": "Broad procurement uptake", "year": "TBC" }
        ],
        "volume": {
          "total": "11,493,039 packs · US$41.5m (2008–2026)",
          "period": "Global Fund PQR transactions, 2008–2026 (234 orders; US$15.3m in 2025; top buyers Uganda, Madagascar, Mozambique)",
          "split": [
            { "channel": "Global Fund (PQR-recorded)", "pct": 100 }
          ],
          "source": "Global Fund PQR Transaction Summary, extract 23 Aug 2026 — sourcing/staging/procurement_transactions.csv. Covers Global Fund-financed procurement only; US PMI data unavailable post-2025 (GHSC-PSM dataset offline). Recent quarters incomplete due to PQR reporting lag."
        },
        "milestones": [
          { "milestone": "SRA approval (EMA, Eurartesim)", "status": "done", "label": "Complete", "date": "2011", "next": "—", "anticipated": "—", "source": "EMA register" },
          { "milestone": "WHO guideline recommendation", "status": "done", "label": "Complete", "date": "2015", "next": "—", "anticipated": "—", "source": "WHO Guidelines for malaria" },
          { "milestone": "WHO prequalification (Eurartesim)", "status": "done", "label": "Complete", "date": "9 Oct 2015", "next": "—", "anticipated": "—", "source": "WHO PQ list" },
          { "milestone": "WHO PQ requalification", "status": "done", "label": "Complete", "date": "20 Jan 2025", "next": "—", "anticipated": "—", "source": "WHO PQ list" },
          { "milestone": "Additional PQ'd suppliers", "status": "done", "label": "9 presentations · 3 makers", "date": "2015–2023", "next": "—", "anticipated": "—", "source": "WHO PQ list (extract 22 Aug 2026)" },
          { "milestone": "National guideline inclusion", "status": "prog", "label": "Counts TBC", "date": "—", "next": "MFT strategy decisions", "anticipated": "TBC", "source": "LAUNCH assessment (draft)" },
          { "milestone": "Procurement scale-up", "status": "late", "label": "US$41.5m since 2008", "date": "US$15.3m in 2025", "next": "Verify surge in next PQR extract", "anticipated": "Q4 2026", "source": "Global Fund PQR (extract 23 Aug 2026)" }
        ]
      }
    },
    {
      "id": "emanators",
      "placeholder": true,
      "name": "Spatial emanators",
      "inn": "Vector-control prevention tool",
      "manufacturer": "SC Johnson",
      "classLabel": "Prevention · pending funder approval",
      "note": "Planned addition to LAUNCH tracking. WHO PQ (vector control) already lists two SC Johnson spatial emanators — Guardian and Mosquito Shield — prequalified 13 Aug 2025 (WHO PQ vector-control list, extract 22 Aug 2026), so the first pathway gate has been passed. The pipeline view will apply with WHO PQ/Vector Control and guideline stages adapted for prevention products."
    }
  ]
}
