// LAUNCH dashboard data file.
// Everything after "window.LAUNCH_DATA =" must be STRICT JSON (double quotes,
// no comments, no trailing commas) — run `node scripts/validate-data.js`
// after every edit; it will refuse anything malformed.
//
// Provenance fields used throughout:
//   "source"              where the figure comes from (public source, citable)
//   "asOf"                date the value was last verified (YYYY-MM-DD)
//   "confirmedInWriting"  manufacturer confirmed release of this figure in writing
//
// ALL VALUES BELOW ARE ILLUSTRATIVE PLACEHOLDERS for design review.
window.LAUNCH_DATA =
{
  "meta": {
    "lastUpdated": "2026-08-14",
    "illustrative": true,
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
  "products": [
    {
      "id": "ganlum",
      "name": "GanLum",
      "inn": "Ganaplacide–lumefantrine",
      "manufacturer": "Novartis · MMV",
      "class": "pipeline",
      "classLabel": "Pipeline · new chemical class",
      "currentStage": 0,
      "flag": null,
      "stages": [
        { "status": "prog", "note": "Phase III ongoing (multi-country, incl. Mali, Burkina Faso)", "date": "Readout expected Q3 2027", "next": "Complete Phase III enrolment", "nextDate": "", "source": "ClinicalTrials.gov (illustrative)", "asOf": "2026-08-14" },
        { "status": "idle", "note": "Not started", "date": "Anticipated 2028", "next": "Dossier submission planned after Phase III", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "Early WHO GDG engagement underway informally", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" }
      ],
      "detail": {
        "price": { "value": "TBC", "note": "Pricing discussions not yet public", "source": "", "confirmedInWriting": false, "asOf": "2026-08-14" },
        "useCase": "First non-artemisinin combination — candidate for MFT strategies and artemisinin partial-resistance settings.",
        "access": [
          "MMV co-development agreement in place",
          "Access provisions under negotiation",
          "Manufacturing scale-up plan in design"
        ],
        "adoption": [
          "New chemical class — pharmacovigilance plan required",
          "Health-worker training on new regimen"
        ],
        "research": { "lead": "MMV / Novartis", "geographies": "Mali, Burkina Faso, Gabon", "timeline": "Ongoing → 2027", "question": "Efficacy in partial-resistance settings" },
        "country": { "registered": 0, "inGuidelines": 0, "inMft": 0, "forecastDemand": "—" },
        "volume": null,
        "milestones": [
          { "milestone": "Phase III trials", "status": "prog", "label": "In progress", "date": "Ongoing", "next": "Readout", "anticipated": "Q3 2027", "source": "ClinicalTrials.gov (illustrative)" },
          { "milestone": "SRA dossier submission", "status": "idle", "label": "Not started", "date": "—", "next": "Submission", "anticipated": "2028", "source": "" },
          { "milestone": "WHO GDG engagement", "status": "idle", "label": "Not started", "date": "—", "next": "Pre-submission dialogue", "anticipated": "2027", "source": "" },
          { "milestone": "WHO prequalification", "status": "idle", "label": "Not started", "date": "—", "next": "—", "anticipated": "TBD", "source": "" }
        ]
      }
    },
    {
      "id": "alaq",
      "name": "ALAQ",
      "inn": "Artemether–lumefantrine–amodiaquine (triple ACT)",
      "manufacturer": "Marketing partner TBC · MORU / DNDi",
      "class": "pipeline",
      "classLabel": "Pipeline · triple ACT",
      "currentStage": 2,
      "flag": "WHO guideline review delayed — GDG meeting moved from Q3 2026 to Q1 2027 (+2 quarters)",
      "stages": [
        { "status": "done", "note": "Phase III complete (DeTACT trials)", "date": "Completed Jan 2025", "next": "", "nextDate": "", "source": "DeTACT publications (illustrative)", "asOf": "2026-08-14" },
        { "status": "prog", "note": "Dossier under SRA review", "date": "Submitted 12 Feb 2026", "next": "SRA assessment", "nextDate": "Q1 2027", "source": "Sponsor communication (illustrative)", "asOf": "2026-08-14" },
        { "status": "late", "note": "GDG review slipped from Q3 2026 to Q1 2027 (+2 quarters) — committee scheduling", "date": "Was Q3 2026", "next": "GDG meeting", "nextDate": "Q1 2027", "source": "WHO GDG schedule (illustrative)", "asOf": "2026-08-14" },
        { "status": "idle", "note": "Not started", "date": "", "next": "PQ dossier after SRA opinion", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" },
        { "status": "idle", "note": "Not started", "date": "", "next": "", "nextDate": "" }
      ],
      "detail": {
        "price": { "value": "US$ 1.25", "note": "Indicative per adult treatment at launch · GDF price commitment", "source": "GDF agreement (illustrative)", "confirmedInWriting": true, "asOf": "2026-08-14" },
        "useCase": "MFT component and first-line option where artemisinin partial resistance is confirmed.",
        "access": [
          "Price commitment with GDF",
          "Registration footprint planned in 30+ endemic countries",
          "Manufacturing capacity secured",
          "Out-licensing agreements in place"
        ],
        "adoption": [
          "Updated treatment guidelines and job aids",
          "Health-worker training (new 3-drug regimen)"
        ],
        "research": { "lead": "Jhpiego (ASPY-linked OR network)", "geographies": "DRC, Rwanda, Nigeria, Uganda", "timeline": "Sep 2025 → Aug 2029", "question": "Adherence and safety of triple ACT at scale" },
        "country": { "registered": 0, "inGuidelines": 0, "inMft": 7, "forecastDemand": "12.8M forecast (2028)" },
        "volume": null,
        "milestones": [
          { "milestone": "Safety & efficacy (Phase III)", "status": "done", "label": "Complete", "date": "24 Jan 2025", "next": "—", "anticipated": "—", "source": "DeTACT publications (illustrative)" },
          { "milestone": "Dossier submission (SRA pathway)", "status": "prog", "label": "Submitted", "date": "12 Feb 2026", "next": "SRA assessment", "anticipated": "Q1 2027", "source": "" },
          { "milestone": "WHO GDG engagement", "status": "prog", "label": "In progress", "date": "Ongoing", "next": "GDG meeting", "anticipated": "Q1 2027", "source": "" },
          { "milestone": "WHO guidelines update", "status": "late", "label": "Delayed +2 qtrs", "date": "—", "next": "Draft guideline review", "anticipated": "Q1 2027", "source": "" },
          { "milestone": "WHO prequalification", "status": "idle", "label": "Not started", "date": "—", "next": "Dossier submission", "anticipated": "Q3 2027", "source": "" },
          { "milestone": "GMP inspection", "status": "idle", "label": "Not started", "date": "—", "next": "Scheduling", "anticipated": "TBD", "source": "" },
          { "milestone": "Country regulatory review", "status": "idle", "label": "Not started", "date": "—", "next": "National submissions (incl. AMA)", "anticipated": "TBD", "source": "" }
        ]
      }
    },
    {
      "id": "pyramax",
      "name": "Pyramax",
      "inn": "Pyronaridine–artesunate",
      "manufacturer": "Shin Poong Pharmaceutical · MMV",
      "class": "market",
      "classLabel": "Recommended · underutilized",
      "currentStage": 5,
      "flag": "Policy adoption is the bottleneck — WHO-recommended since 2022 but included in only 6 national guidelines",
      "stages": [
        { "status": "done", "note": "Development complete", "date": "", "next": "", "nextDate": "", "asOf": "2026-08-14" },
        { "status": "done", "note": "EMA positive opinion (Article 58)", "date": "2015", "next": "", "nextDate": "", "source": "EMA register", "asOf": "2026-08-14" },
        { "status": "done", "note": "WHO recommended for uncomplicated malaria", "date": "2022", "next": "", "nextDate": "", "source": "WHO Guidelines for malaria", "asOf": "2026-08-14" },
        { "status": "done", "note": "WHO prequalified (tablets & granules)", "date": "2022", "next": "", "nextDate": "", "source": "WHO PQ database", "asOf": "2026-08-14" },
        { "status": "prog", "note": "Registered in 24 endemic countries; 8 applications pending", "date": "Rolling", "next": "6 further registrations", "nextDate": "2027", "source": "Manufacturer communication (illustrative)", "asOf": "2026-08-14" },
        { "status": "late", "note": "In only 6 national treatment guidelines despite WHO recommendation — key adoption gap", "date": "", "next": "3 guideline committees reviewing", "nextDate": "Q4 2026", "source": "LAUNCH country survey (illustrative)", "asOf": "2026-08-14" },
        { "status": "prog", "note": "Eligible for Global Fund procurement; volumes still low", "date": "0.9M treatments (2024–25)", "next": "", "nextDate": "", "source": "Global Fund PQR (illustrative)", "asOf": "2026-08-14" },
        { "status": "idle", "note": "Limited routine delivery outside pilot districts", "date": "", "next": "", "nextDate": "" }
      ],
      "detail": {
        "price": { "value": "US$ 0.98", "note": "Indicative per adult treatment · Global Fund reference price", "source": "Global Fund reference price list (illustrative)", "confirmedInWriting": false, "asOf": "2026-08-14" },
        "useCase": "First-line diversification / MFT component; paediatric granules available.",
        "access": [
          "WHO PQ held for two formulations",
          "Registration footprint: 24 countries and expanding",
          "Volume capacity confirmed by manufacturer"
        ],
        "adoption": [
          "Guideline inclusion and case-management training",
          "No cold chain or special administration needs"
        ],
        "research": { "lead": "MMV country pilots", "geographies": "Burkina Faso, Kenya, Cambodia", "timeline": "2024 → 2027", "question": "MFT deployment models with pyronaridine–artesunate" },
        "country": { "registered": 24, "inGuidelines": 6, "inMft": 4, "forecastDemand": "4.1M forecast (2027)" },
        "volume": {
          "total": "0.9M",
          "period": "2024–2025",
          "split": [
            { "channel": "Global Fund", "pct": 62 },
            { "channel": "PMI / USAID", "pct": 21 },
            { "channel": "Domestic public", "pct": 12 },
            { "channel": "Private sector", "pct": 5 }
          ],
          "source": "Global Fund PQR + PMI reports (illustrative)"
        },
        "milestones": [
          { "milestone": "SRA approval (EMA Art. 58)", "status": "done", "label": "Complete", "date": "2015", "next": "—", "anticipated": "—", "source": "EMA register" },
          { "milestone": "WHO guideline recommendation", "status": "done", "label": "Complete", "date": "2022", "next": "—", "anticipated": "—", "source": "WHO Guidelines for malaria" },
          { "milestone": "WHO prequalification", "status": "done", "label": "Complete", "date": "2022", "next": "—", "anticipated": "—", "source": "WHO PQ database" },
          { "milestone": "Country registrations", "status": "prog", "label": "24 of 30 targeted", "date": "Rolling", "next": "6 pending", "anticipated": "2027", "source": "" },
          { "milestone": "National guideline inclusion", "status": "late", "label": "6 countries", "date": "—", "next": "3 committees in review", "anticipated": "Q4 2026", "source": "" },
          { "milestone": "Procurement scale-up", "status": "prog", "label": "0.9M treatments", "date": "2024–25", "next": "Global Fund tender", "anticipated": "Q2 2027", "source": "" }
        ]
      }
    },
    {
      "id": "dhappq",
      "name": "DHA–PPQ",
      "inn": "Dihydroartemisinin–piperaquine",
      "manufacturer": "Multiple prequalified manufacturers",
      "class": "market",
      "classLabel": "Recommended · underutilized",
      "currentStage": 6,
      "flag": "Procurement is the bottleneck — fully approved for a decade yet <5% of global ACT volumes",
      "stages": [
        { "status": "done", "note": "Development complete", "date": "", "next": "", "nextDate": "", "asOf": "2026-08-14" },
        { "status": "done", "note": "EMA approval (Eurartesim)", "date": "2011", "next": "", "nextDate": "", "source": "EMA register", "asOf": "2026-08-14" },
        { "status": "done", "note": "WHO recommended for uncomplicated malaria", "date": "2015", "next": "", "nextDate": "", "source": "WHO Guidelines for malaria", "asOf": "2026-08-14" },
        { "status": "done", "note": "WHO prequalified (multiple products)", "date": "2019", "next": "", "nextDate": "", "source": "WHO PQ database", "asOf": "2026-08-14" },
        { "status": "done", "note": "Registered in 30+ endemic countries", "date": "Rolling", "next": "", "nextDate": "", "asOf": "2026-08-14" },
        { "status": "prog", "note": "In 11 national guidelines; MFT planning in 5 countries", "date": "", "next": "MFT strategy decisions", "nextDate": "2027", "source": "LAUNCH country survey (illustrative)", "asOf": "2026-08-14" },
        { "status": "late", "note": "Under 5% of global ACT procurement volume — chronic underuse vs recommendation", "date": "1.5M treatments (2024–25)", "next": "", "nextDate": "", "source": "Global Fund PQR (illustrative)", "asOf": "2026-08-14" },
        { "status": "prog", "note": "Routine delivery in 9 countries, mostly seasonal/IPT niches", "date": "", "next": "", "nextDate": "", "asOf": "2026-08-14" }
      ],
      "detail": {
        "price": { "value": "US$ 1.10", "note": "Indicative per adult treatment · pooled procurement reference", "source": "Pooled procurement reference (illustrative)", "confirmedInWriting": false, "asOf": "2026-08-14" },
        "useCase": "MFT rotation partner and mass drug administration / chemoprevention niches.",
        "access": [
          "Multiple PQ'd suppliers — supply security via diversity",
          "No single-source dependency",
          "Established API supply chains"
        ],
        "adoption": [
          "ECG guidance for specific risk groups in some guidelines",
          "Otherwise standard ACT case-management training"
        ],
        "research": { "lead": "Multiple academic consortia", "geographies": "Mozambique, Tanzania, Senegal", "timeline": "2023 → 2026", "question": "MFT rotation sequencing and resistance impact" },
        "country": { "registered": 32, "inGuidelines": 11, "inMft": 5, "forecastDemand": "9.4M forecast (2027)" },
        "volume": {
          "total": "1.5M",
          "period": "2024–2025",
          "split": [
            { "channel": "Global Fund", "pct": 48 },
            { "channel": "Domestic public", "pct": 27 },
            { "channel": "PMI / USAID", "pct": 15 },
            { "channel": "Private sector", "pct": 10 }
          ],
          "source": "Global Fund PQR + national data (illustrative)"
        },
        "milestones": [
          { "milestone": "SRA approval (EMA)", "status": "done", "label": "Complete", "date": "2011", "next": "—", "anticipated": "—", "source": "EMA register" },
          { "milestone": "WHO guideline recommendation", "status": "done", "label": "Complete", "date": "2015", "next": "—", "anticipated": "—", "source": "WHO Guidelines for malaria" },
          { "milestone": "WHO prequalification", "status": "done", "label": "Complete", "date": "2019", "next": "—", "anticipated": "—", "source": "WHO PQ database" },
          { "milestone": "Country registrations", "status": "done", "label": "32 countries", "date": "Rolling", "next": "—", "anticipated": "—", "source": "National regulator registers (illustrative)" },
          { "milestone": "National guideline inclusion", "status": "prog", "label": "11 countries", "date": "—", "next": "MFT strategy decisions", "anticipated": "2027", "source": "" },
          { "milestone": "Procurement scale-up", "status": "late", "label": "<5% of ACT volume", "date": "2024–25", "next": "Demand consolidation via GF", "anticipated": "2027", "source": "" }
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
