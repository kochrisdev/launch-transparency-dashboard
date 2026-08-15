// LAUNCH dashboard data file.
// Everything after the assignment on the marker line below must be STRICT JSON
// (double quotes, no comments, no trailing commas) — run
// `node scripts/validate-data.js` after every edit; it refuses anything malformed.
//
// Provenance fields used throughout:
//   "source"              where the figure comes from (public source, citable)
//   "asOf"                date the value was last verified (YYYY-MM-DD)
//   "confirmedInWriting"  manufacturer confirmed release of this figure in writing
//
// meta.dataStatus: "illustrative" | "draft" | "live"
//   draft = compiled from public sources, pending LAUNCH team verification
//           and manufacturer written confirmation. Unknown values are "TBC" —
//           never estimated.
window.LAUNCH_DATA =
{
  "meta": {
    "lastUpdated": "2026-08-15",
    "dataStatus": "draft",
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
      "currentStage": 1,
      "flag": null,
      "stages": [
        { "status": "done", "note": "Phase III (KALUMA) met primary endpoint: 97.4% PCR-corrected cure rate; 1,688 adults and children, 34 sites in 12 African countries", "date": "Announced 12 Nov 2025", "next": "", "nextDate": "", "source": "Novartis / MMV press releases, 12 Nov 2025", "asOf": "2026-08-14" },
        { "status": "prog", "note": "Regulatory submissions in preparation following Phase III success", "date": "", "next": "Dossier submission (SRA pathway)", "nextDate": "TBC", "source": "Novartis announcement, Nov 2025", "asOf": "2026-08-14" },
        { "status": "idle", "note": "Not started", "date": "", "next": "GDG engagement expected alongside regulatory review", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
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
          { "milestone": "Phase III (KALUMA)", "status": "done", "label": "Complete", "date": "12 Nov 2025", "next": "—", "anticipated": "—", "source": "Novartis / MMV press releases" },
          { "milestone": "SRA dossier submission", "status": "prog", "label": "In preparation", "date": "—", "next": "Submission", "anticipated": "TBC", "source": "Novartis announcement, Nov 2025" },
          { "milestone": "WHO GDG engagement", "status": "idle", "label": "Not started", "date": "—", "next": "Pre-submission dialogue", "anticipated": "TBC", "source": "" },
          { "milestone": "WHO prequalification", "status": "idle", "label": "Not started", "date": "—", "next": "—", "anticipated": "TBC", "source": "" }
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
      "currentStage": 0,
      "flag": null,
      "stages": [
        { "status": "prog", "note": "Co-formulated fixed-dose triple ACT in Phase III programme (DeTACT); dose-optimization published 2025; dispersible taste-masked formulation", "date": "Phase III targeted completion 2025–26", "next": "Phase III results, then dossier preparation", "nextDate": "TBC", "source": "MORU / DeTACT; Clin Pharmacol Ther 2025; WHO PADO malaria, Jun 2025", "asOf": "2026-08-14" },
        { "status": "idle", "note": "Not started", "date": "", "next": "SRA/WLA submission — partnership targets approval by ~2027", "nextDate": "~2027", "source": "DeTACT partnership statements" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not yet included in WHO PQ Expression of Interest list", "date": "", "next": "PQ targeted by ~2027 per partnership", "nextDate": "~2027", "source": "WHO PADO malaria, Jun 2025" },
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
      "currentStage": 5,
      "flag": "Adoption is the bottleneck — strongly recommended by WHO since 2022 and registered in 25+ countries, but national guideline inclusion remains limited",
      "stages": [
        { "status": "done", "note": "Development complete (Shin Poong / MMV co-development)", "date": "", "next": "", "nextDate": "", "source": "MMV", "asOf": "2026-08-14" },
        { "status": "done", "note": "EMA positive scientific opinion (Article 58); label updated Jul 2025 to include treatment of pregnant women", "date": "2012 (label update 2025)", "next": "", "nextDate": "", "source": "EMA; MMV, 31 Jul 2025", "asOf": "2026-08-14" },
        { "status": "done", "note": "Strong recommendation in revised WHO Guidelines for malaria", "date": "2022", "next": "", "nextDate": "", "source": "WHO Guidelines for malaria; MMV", "asOf": "2026-08-14" },
        { "status": "done", "note": "WHO prequalified — tablets and paediatric granules", "date": "2012–2016", "next": "", "nextDate": "", "source": "WHO PQ list of prequalified medicines", "asOf": "2026-08-14" },
        { "status": "prog", "note": "Registered in 25+ endemic countries since 2014; further submissions in Asia (Vietnam, Myanmar, Cambodia, Thailand)", "date": "Rolling", "next": "Pending registrations", "nextDate": "TBC", "source": "MMV", "asOf": "2026-08-14" },
        { "status": "late", "note": "National guideline inclusion lags WHO's 2022 strong recommendation — the core adoption gap LAUNCH is tracking; verified country count pending", "date": "", "next": "Country guideline committee reviews", "nextDate": "TBC", "source": "LAUNCH assessment (draft)", "asOf": "2026-08-14" },
        { "status": "prog", "note": "Eligible for Global Fund / PMI procurement; volumes remain modest relative to artemether-lumefantrine", "date": "", "next": "", "nextDate": "", "source": "LAUNCH assessment (draft)", "asOf": "2026-08-14" },
        { "status": "idle", "note": "Routine delivery limited; concentrated in pilot and study settings", "date": "", "next": "", "nextDate": "" }
      ],
      "detail": {
        "price": { "value": "TBC", "note": "Global Fund reference pricing to be displayed once confirmed for release", "source": "", "confirmedInWriting": false, "asOf": "2026-08-14" },
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
        "volume": null,
        "volumeNote": "Procurement volumes being compiled from Global Fund PQR and PMI records",
        "milestones": [
          { "milestone": "SRA approval (EMA Art. 58)", "status": "done", "label": "Complete", "date": "2012", "next": "—", "anticipated": "—", "source": "EMA register" },
          { "milestone": "WHO prequalification", "status": "done", "label": "Complete", "date": "2012–2016", "next": "—", "anticipated": "—", "source": "WHO PQ list" },
          { "milestone": "WHO guideline strong recommendation", "status": "done", "label": "Complete", "date": "2022", "next": "—", "anticipated": "—", "source": "WHO Guidelines for malaria" },
          { "milestone": "Label update — pregnancy", "status": "done", "label": "Complete", "date": "31 Jul 2025", "next": "—", "anticipated": "—", "source": "EMA / MMV" },
          { "milestone": "Country registrations", "status": "prog", "label": "25+ countries", "date": "Rolling", "next": "Asia submissions", "anticipated": "TBC", "source": "MMV" },
          { "milestone": "National guideline inclusion", "status": "late", "label": "Limited — TBC", "date": "—", "next": "Committee reviews", "anticipated": "TBC", "source": "LAUNCH assessment (draft)" },
          { "milestone": "Procurement scale-up", "status": "prog", "label": "Volumes TBC", "date": "—", "next": "Global Fund / PMI data pull", "anticipated": "2026", "source": "" }
        ]
      }
    },
    {
      "id": "dhappq",
      "name": "DHA–PPQ",
      "inn": "Dihydroartemisinin–piperaquine",
      "manufacturer": "Alfasigma (Eurartesim) · Guilin and other PQ'd suppliers",
      "class": "market",
      "classLabel": "Recommended · underutilized",
      "currentStage": 6,
      "flag": "Procurement is the bottleneck — recommended and prequalified for a decade, yet a small share of global ACT volumes",
      "stages": [
        { "status": "done", "note": "Development complete", "date": "", "next": "", "nextDate": "", "source": "MMV", "asOf": "2026-08-14" },
        { "status": "done", "note": "EMA approval (Eurartesim)", "date": "2011", "next": "", "nextDate": "", "source": "EMA register", "asOf": "2026-08-14" },
        { "status": "done", "note": "WHO-recommended ACT for uncomplicated malaria", "date": "2015 guidelines", "next": "", "nextDate": "", "source": "WHO Guidelines for malaria", "asOf": "2026-08-14" },
        { "status": "done", "note": "Eurartesim prequalified 2015, requalified Jan 2025; additional suppliers also prequalified", "date": "2015; requal. 20 Jan 2025", "next": "", "nextDate": "", "source": "WHO PQ list", "asOf": "2026-08-14" },
        { "status": "done", "note": "Registered widely; adopted as first-line in several Southeast Asian countries", "date": "Rolling", "next": "", "nextDate": "", "source": "MMV / WHO", "asOf": "2026-08-14" },
        { "status": "prog", "note": "First-line in several SE Asian countries; consideration in African MFT strategies growing; verified country counts pending", "date": "", "next": "MFT strategy decisions", "nextDate": "TBC", "source": "LAUNCH assessment (draft)", "asOf": "2026-08-14" },
        { "status": "late", "note": "Small share of global ACT procurement despite decade-old recommendation and multiple PQ'd suppliers — chronic underuse; verified volume data pending", "date": "", "next": "Global Fund PQR data pull", "nextDate": "2026", "source": "LAUNCH assessment (draft)", "asOf": "2026-08-14" },
        { "status": "prog", "note": "Routine use concentrated in Southeast Asia and chemoprevention niches", "date": "", "next": "", "nextDate": "", "source": "LAUNCH assessment (draft)", "asOf": "2026-08-14" }
      ],
      "detail": {
        "price": { "value": "TBC", "note": "Pooled procurement reference pricing to be displayed once confirmed for release", "source": "", "confirmedInWriting": false, "asOf": "2026-08-14" },
        "useCase": "MFT rotation partner; mass drug administration and chemoprevention niches; once-daily dosing.",
        "access": [
          "Multiple PQ'd suppliers — supply security via diversity",
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
        "volume": null,
        "volumeNote": "Procurement volumes being compiled from Global Fund PQR and national records",
        "milestones": [
          { "milestone": "SRA approval (EMA, Eurartesim)", "status": "done", "label": "Complete", "date": "2011", "next": "—", "anticipated": "—", "source": "EMA register" },
          { "milestone": "WHO guideline recommendation", "status": "done", "label": "Complete", "date": "2015", "next": "—", "anticipated": "—", "source": "WHO Guidelines for malaria" },
          { "milestone": "WHO prequalification (Eurartesim)", "status": "done", "label": "Complete", "date": "9 Oct 2015", "next": "—", "anticipated": "—", "source": "WHO PQ list" },
          { "milestone": "WHO PQ requalification", "status": "done", "label": "Complete", "date": "20 Jan 2025", "next": "—", "anticipated": "—", "source": "WHO PQ list" },
          { "milestone": "National guideline inclusion", "status": "prog", "label": "Counts TBC", "date": "—", "next": "MFT strategy decisions", "anticipated": "TBC", "source": "LAUNCH assessment (draft)" },
          { "milestone": "Procurement scale-up", "status": "late", "label": "Volumes TBC", "date": "—", "next": "Global Fund PQR data pull", "anticipated": "2026", "source": "LAUNCH assessment (draft)" }
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
      "note": "Planned addition to LAUNCH tracking. The same pipeline view will apply, with WHO PQ/Vector Control and guideline stages adapted for prevention products."
    }
  ]
}
