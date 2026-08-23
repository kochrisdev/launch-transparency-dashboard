# LAUNCH Dashboard — User Guide

*For donors, country ministries of health, implementing partners and pharmaceutical
companies.*

Live site: **https://kochrisdev.github.io/launch-transparency-dashboard/**

The LAUNCH Transparency Dashboard tracks new and underutilized antimalarial
medicines along the full journey from research to patients — and shows, at a
glance, **where each product stands and where it is stuck**.

> **Design review note.** Two layouts are currently live, showing the same data:
> **[Option A](https://kochrisdev.github.io/launch-transparency-dashboard/)** (one
> row per medicine — this guide describes it) and
> **[Option B](https://kochrisdev.github.io/launch-transparency-dashboard/option-b.html)**
> (a comparison matrix: stages as rows, medicines as columns, with the same
> traffic lights and a profile drawer). The pages link to each other in their
> headers. One layout will be retained after review. A third, complementary
> **[pipeline poster](https://kochrisdev.github.io/launch-transparency-dashboard/pipeline.html)**
> shows the whole portfolio by development phase, MMV-poster style. A
> **[Unitaid-branded edition](https://kochrisdev.github.io/launch-transparency-dashboard/unitaid/)**
> of all views (same data and features) is also live for brand review.

---

## Reading the board in 30 seconds

Each medicine is one row. The horizontal track shows the eight stages of the
access pathway, left to right:

| Stage | What it means (plain language) |
| --- | --- |
| **R&D & clinical** | Laboratory development and human trials (Phase I–III). |
| **Regulatory approval (SRA)** | Review by an advanced regulator such as the EMA or US FDA. This anchors everything after it. |
| **WHO guidelines** | WHO's expert group weighs the evidence and decides whether to recommend the medicine. |
| **WHO prequalification** | WHO's quality check that makes the product eligible for purchase by UN agencies and major donors. |
| **Country registration** | Each country's own regulator licenses the product for use. |
| **National policy adoption** | The ministry of health writes the medicine into national treatment guidelines. |
| **Procurement** | Funders and governments actually buy it (Global Fund, PMI, domestic budgets). |
| **In-country delivery** | The medicine reaches health facilities and patients. |

Each stage carries a **traffic light**, always paired with a symbol so it works
for colorblind readers and in print:

- 🟢 **✓ Complete** — this gate has been passed.
- 🟡 **› In progress** — actively moving.
- 🔴 **! Delayed / bottleneck** — stuck; a red triangle note under the row says
  why, in one sentence.
- ⚪ **Not started** (dashed outline) — not yet reached.

The stage with the halo ring is the product's **current position**. The red
sentence under a row is the single most important thing to read: it names the
bottleneck LAUNCH is tracking for that product.

## The summary strip

The numbers at the top (medicines tracked, active bottlenecks, expected to
market within 3 years) are computed live from the same data as the board — they
can never disagree with it.

## Product profiles

Click any row to open the full profile:

- **Indicative price per treatment** — shown only when the figure is public or
  the manufacturer has confirmed in writing that it may be shared. Until then it
  reads **TBC**.
- **Target use case** — how the medicine is expected to be used (e.g. as part of
  multiple first-line therapies, or replacing an existing drug).
- **Access & supply commitments** — measures in place to secure supply and
  affordability in endemic settings.
- **Adoption requirements** — what a country needs to do before using it
  (training, guideline updates, pharmacovigilance).
- **Country access** — counts of countries where the product is registered, in
  national guidelines, and in MFT plans, plus forecast demand.
- **Operational research** — who is studying real-world use, where and until when.
- **Treatments procured** — volumes bought, split by channel, once data exists.
- **Time between gates** — the product's actual history: how many years passed
  between key milestones. Green ≤ 2 years, amber 3–5, red over 5. This is where
  historical delay becomes visible (e.g. six years between a WHO quality
  approval and a WHO recommendation).
- **Milestone table** — every milestone with status, dates, the next expected
  step and its anticipated date.

## The map and the timing chart

Below the board:

- **Country access map** — pick a medicine to see where it is registered (light),
  in national guidelines (medium), and in MFT plans (dark). While the country
  survey is being verified, the map carries an ILLUSTRATIVE warning and must not
  be cited.
- **Pathway timing across products** — each marketed medicine's real history on
  one time axis: dots are gates, colored bars are the years between them
  (green ≤ 2, amber 3–5, red over 5), and a dashed line runs to today where the
  next gate is still pending. The totals ("14 yrs, ongoing") are the delay story
  in one number.

## Features worth knowing

- **Hover any stage dot** for the status detail, next expected step, and the
  date the information was last verified.
- **Dotted-underlined terms** (SRA, PQ, MFT…) show a plain-language definition on
  hover or keyboard focus. The **Definitions** panel at the bottom lists them all.
- **Recent updates** (bottom of page) lists what changed and when — start there
  on a return visit.
- **Download CSV** (top right of the summary strip) exports every status and
  milestone, with sources, for use in your own reports.
- **Print / save as PDF** — all profiles open automatically for a complete printout.
- **Subscribe to updates** — an RSS feed of every change:
  https://kochrisdev.github.io/launch-transparency-dashboard/feed.xml
- **Machine-readable data** — for technical integrators, the full dataset is
  also published as linked data (JSON-LD) at
  https://kochrisdev.github.io/launch-transparency-dashboard/ontology/launch-data.jsonld,
  with the formal vocabulary documented in the repository's ontology guide.
- **Embed a product tracker** on your own site — a one-row live widget per
  medicine; ask the LAUNCH team for the snippet (or see the repository README).

## How much can I trust a number?

Three signals, in order:

1. **The banner under the title.** *Design mockup* = placeholder layout data.
   *Draft data* = compiled from public sources, pending verification. No banner =
   verified, live data.
2. **TBC** means the LAUNCH team does not yet have a verifiable figure. The
   dashboard never estimates: an honest gap is better than an invented number.
3. **Provenance lines** under figures name the public source, whether the
   manufacturer confirmed release in writing, and the date last verified.

The dashboard displays **publicly available information only**. Commercially
sensitive details (such as pricing) appear solely where the manufacturer has
confirmed in writing that they may be shared.

## FAQ

**Why is a product I care about not on the board?**
The initial phase tracks four antimalarials: two in the late pipeline (GanLum,
ALAQ) and two recommended but underutilized (ASPY — pyronaridine–artesunate,
marketed as Pyramax — and DHA–PPQ). A prevention tool (spatial emanators) is
planned, pending funder approval. The scope may expand if the transparency
approach proves effective.

**How often is it updated?**
Milestones are reviewed monthly and updated within days of major public events;
procurement and country data quarterly. The "Last updated" date is in the top
right, and the Recent updates panel lists each change.

**I've spotted an error — who do I tell?**
Contact the LAUNCH initiative team (via the RBM Partnership once hosted there),
or open an issue on the GitHub repository. Corrections are logged in the
Recent updates panel.

**Can I reuse the data?**
Yes — everything shown is public. Use Download CSV, and cite the dashboard and
the underlying sources listed in each row.
