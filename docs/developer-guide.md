# LAUNCH Dashboard — Developer Guide

*For anyone maintaining or extending the code, including RBM's web team at handover.*

## 1. Architecture in one paragraph

A deliberately **static, zero-build, zero-backend** site: one HTML file renders
one data file in the browser. There is no framework, no bundler, no package.json
— the repo root is served as-is (GitHub Pages today; any static host later).
This is a feature, not an omission: the dataset is tiny (a handful of products ×
~10 metrics), the maintainers are analysts rather than developers, and the
18-month initiative will be handed over — so there is nothing to install,
upgrade, or break.

## 2. Repo map

| Path | Role |
| --- | --- |
| `index.html` | Design option A (journey board): CSS (design tokens + components), HTML skeleton, and the render script. The full-featured page. |
| `option-b.html` | Design option B (comparison matrix): a standalone layout study for client review. Same data contract, feature subset. See §10. |
| `data/products.js` | The data contract: `window.LAUNCH_DATA = { …strict JSON… }`. The only file analysts touch; **feeds both option pages**. |
| `scripts/validate-data.js` | Node validator: strict-JSON extraction + governance rules. Exit 1 on error. |
| `scripts/make-preview.js` | Inlines the data file into `preview.html` (single-file build of **option A** for email/artifact sharing). Optional; never required to deploy. |
| `.github/workflows/validate.yml` | CI: validator + preview build on every push/PR. |
| `.nojekyll` | Tells GitHub Pages to serve files verbatim. |
| `docs/` | This documentation set, including the remaining-tasks checklist. |
| `UPDATING.md` | Pointer to the data-analyst guide (kept for old links). |

## 3. The data contract

`index.html` loads `<script src="data/products.js">`, which assigns
`window.LAUNCH_DATA`. A plain `.js` assignment (rather than `fetch`ing `.json`)
is deliberate: it works from `file://` when an analyst double-clicks
`index.html`, with no CORS or server requirement. The body after the assignment
must still be strict JSON — the validator extracts it with a line-anchored
regex (`/^window\.LAUNCH_DATA\s*=\s*/m`) and `JSON.parse`s it, so JS-only
syntax (comments, single quotes, trailing commas) inside the object fails CI.

Schema reference: see the [data analyst guide](data-analyst-guide.md) §4. The
renderer and validator must agree on the schema; change both together.

## 4. Rendering pipeline (`index.html`, bottom `<script>`)

Order matters:

1. **Guard** — if `window.LAUNCH_DATA` is missing, show the error banner and stop.
2. **Meta** — format `lastUpdated`; pick the banner text from `meta.dataStatus`
   (`illustrative` / `draft` / `live`); populate the header note.
3. **Changelog** — first 8 entries into the Recent updates panel.
4. **Summary stats** — *derived*, never hand-typed: tracked = non-placeholder
   products; bottlenecks = products with any `late` stage; pipeline = products
   with `class: "pipeline"`. Keep it this way — a stat that can't disagree with
   the board is the point.
5. **Board render** — one `<section class="product">` per tracked product:
   identity column, 8-stage track (dots carry `data-*` attributes for the
   tooltip), optional red `flagnote`, and a hidden `detail` panel (metric cards,
   optional journey timeline, milestone table).
6. **Placeholder rows** — greyed sections for `placeholder: true` products.
7. **Interactions** — expand/collapse (`aria-expanded` kept in sync); a single
   shared tooltip element (`showTipAt(el, html)` positions it, clamped to the
   viewport, flipping below when near the top).
8. **Glossary** — after the board exists: a TreeWalker wraps the **first**
   occurrence of each term per product in `<span class="gloss" tabindex="0">`
   (word-boundary regex, longest term first, skips inside existing `.gloss`).
   First-occurrence-only is a readability decision.
9. **CSV export** — builds rows from the same data (stages + milestones),
   quotes per RFC 4180, prepends a UTF-8 BOM (`﻿`) so Excel detects the
   encoding, downloads via a Blob URL.
10. **Print** — `beforeprint` opens the reference panels; CSS `@media print`
    forces detail panels open and hides interactive chrome.

**Escaping**: all data values pass through `esc()` before being interpolated
into HTML. Any new render code must do the same — the data file is trusted-ish
(repo-controlled) but analysts paste text from anywhere.

## 5. CSS system

- **Design tokens** on `:root` (light palette), redefined in
  `@media (prefers-color-scheme: dark)` guarded as `:root:not([data-theme="light"])`,
  and again under `:root[data-theme="dark"]` — so system preference and an
  explicit host toggle both work. **Never** give a color its only definition
  inside a theme block; components use tokens only.
- **Status colors** (`--good/--warn/--crit/--idle` + `-soft` fills) are semantic
  and reserved — don't reuse them for decoration. Status is always **shape +
  color** (✓ › ! dashed-circle), never color alone.
- Rebranding to RBM: change the token block(s); components inherit.
- Layout uses flex/grid with `gap`; wide content (tracks, tables, timelines)
  scrolls inside its own `overflow-x: auto` container.

## 6. Validator (`scripts/validate-data.js`)

Plain Node, no dependencies. Structure: extract strict-JSON body → parse →
rule checks pushing to `errors[]` / `warnings[]` → report, exit 1 if errors.

To add a rule: push a clear, **actionable** message (every message names its
fix — keep that property), decide error vs warning (error = the dashboard would
lie or break; warning = provenance debt), and update the analyst guide's
troubleshooting table.

## 7. Testing

No test framework by design; two layers instead:

- **CI**: the validator plus the preview build on every push.
- **Manual/agent smoke test** (jsdom, used during development):

  ```bash
  npm i jsdom   # anywhere outside the repo, or in a scratch dir
  node -e "
  const {JSDOM}=require('jsdom'); const fs=require('fs');
  const html='<!doctype html><html><body>'+fs.readFileSync('preview.html','utf8')+'</body></html>';
  const dom=new JSDOM(html,{runScripts:'dangerously'});
  setTimeout(()=>{ const d=dom.window.document;
    console.log('products', d.querySelectorAll('.product').length,
                'dots', d.querySelectorAll('.stage .dot').length); },300);
  "
  ```

  Run `node scripts/make-preview.js` first. Check: product count, 8 dots per
  tracked product, flags present, expand/collapse toggles `open`.

## 8. Deployment and handover

- **Now**: GitHub Pages from `main` root; every push is live in ~1–2 min.
  CI gates data quality but does not gate the Pages deploy (branch-based Pages
  deploys regardless) — treat a red CI run as a revert-now signal.
- **RBM options**: (a) copy `index.html`, `data/`, `.nojekyll` to any static
  path on their site; (b) iframe the Pages URL (snippet in the README);
  (c) transfer the repo to an RBM GitHub org (history and CI move; Pages URL
  changes).
- No secrets exist anywhere in the repo or its history; the confirmation
  register lives outside the repo by policy.

## 9. Extension notes

- **Add a pipeline stage**: append/insert in `stages` *and* add the matching
  entry to every product's `stages` array (the validator enforces the count).
  Track min-width may need adjusting (`.track { min-width }`).
- **Country access map** (implemented): geometry lives in the generated
  `data/world-map.js` (Natural Earth 110m via `scripts/build-map.js` — dev-only
  deps documented in that script; rerun only to change projection or country
  set). The renderer colors countries from `detail.countries.list` and shows a
  warning overlay unless `countries.status === "verified"` — the map can never
  silently present unverified coverage. Self-contained by design: no tiles, no
  CDN.
- **History snapshots + RSS feed** (implemented): `.github/workflows/publish.yml`
  runs only on `data/products.js` changes, commits `history/products-<date>.js`
  and a rebuilt `feed.xml` as a bot. It cannot retrigger itself (path filter).
  The `history/` folder is the raw material for future trend charts and
  "as of" playback.
- **Embeddable widget** (implemented): `widget.html?product=<id or name>` —
  one-row tracker for partner sites; keep it dependency-free and tiny.
- **Analytics**: add the chosen provider's script tag in `index.html` only for
  the production host (consider a hostname guard so localhost/preview isn't
  counted). Prefer a cookieless option (e.g. Plausible) to avoid consent
  banners.
- **Prevention products** (spatial emanators): the stage names are per-dataset,
  not per-product — if prevention needs different gate names (PQ/Vector
  Control), either generalize `stages` to per-product overrides (renderer reads
  `p.stageNames || DATA.stages`) or run a second board section. Decide when the
  product activates.
- **New detail cards**: add the field to the schema (analyst guide §4), the
  validator, and the card template in the product render — in that order.

## 10. Design options (temporary, during client review)

`option-b.html` is a deliberate **fork of the presentation, not of the data or
governance**: it loads the same `data/products.js`, derives the same stats, and
uses the same status semantics, but renders a stages-as-rows × products-as-columns
matrix with its own visual identity (deep green, serif display, dark header
band, single light theme). It carries a feature subset — no glossary, CSV,
print handling, or pathway timing — because it exists to test the *layout*
question, not feature parity.

Maintenance rules while both are live:

- Data/schema changes must keep **both** renderers working — option B reads
  `stages`, `products[*].stages`, `flag`, `currentStage`, `detail.*` and
  `meta.dataStatus`.
- Copy changes that state facts (hosting note, prototype badge, banner texts)
  should be applied to both pages.
- `scripts/make-preview.js` covers option A only; a self-contained option B is
  built the same way (replace its `<script src>` with the inlined data file).

**Consolidation** (when the client decides — tracked in `docs/checklist.md`):
delete the losing file, remove the cross-links, and if B wins, port A's
glossary/CSV/print/timing blocks into it (they are self-contained sections of
A's script and CSS).

## 11. Conventions

- Match the existing style: vanilla ES2017+, template literals for markup,
  `esc()` on every interpolated value, no dependencies.
- Accessibility floor: keyboard focusability for anything hoverable
  (`tabindex="0"` + focus/blur mirroring mouse events), `aria-expanded` on
  toggles, `aria-label` on status dots, visible `:focus-visible` outlines.
- Commit style: imperative subject, body explains the *why*; data-only commits
  should also appear in the on-page changelog.
