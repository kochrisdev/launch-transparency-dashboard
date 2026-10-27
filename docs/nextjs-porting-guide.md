# Porting a legacy HTML page to the Next.js app

Each legacy page (`index.html`, `option-b.html`, …) was a single file: one
`<style>`, static markup, and an IIFE that built the DOM with `innerHTML`.
The Next.js app keeps the **look identical** and rewrites the **behaviour as
idiomatic React + TypeScript**.

## Where things go

| Legacy | Next.js |
|---|---|
| `<style>` block | `src/views/<page>/<page>.css`, copied **verbatim**, imported at the top of the view. Global selectors (`:root`, `body`, ids) are fine — see "CSS isolation" below. |
| static markup + IIFE | `src/views/<page>/<Name>.tsx` (`"use client"`), default export `function <Name>(props: ViewProps)` |
| sub-parts (drawer, map, tooltip, timing chart…) | separate components in the same folder (`Drawer.tsx`, `AccessMap.tsx` …) |
| pure helpers (date formatting, status maps, derived stats) | `src/views/<page>/logic.ts` (or `src/lib/` if shared by several pages) |
| `window.LAUNCH_DATA` / `window.LAUNCH_MAP` | `props.data` / `props.map` (typed, `src/lib/types.ts`) — loaded at build time by the route file |
| `href="option-b.html"` | `<PageLink page="option-b" edition={edition}>` (`src/components/PageLink.tsx`) |
| `src="assets/…"` | `asset("assets/…")` from `src/lib/paths.ts` (respects the GitHub Pages basePath) |

Route files under `src/app/**/page.tsx` are generated and already wired up;
don't edit them unless your page needs a prop it doesn't get.

## Rules

1. **No `dangerouslySetInnerHTML`, no `innerHTML`, no `document.getElementById`
   for rendering.** Render with JSX from data. Escaping helpers (`esc()`)
   disappear — React escapes for you. Strings in the legacy JS that contain
   markup (`"<b>Draft data.</b> …"`) become JSX.
2. Imperative bits become state/effects: selected product → `useState`;
   open drawer → state + `Escape` key handler in `useEffect`; tooltip →
   state with position; theme toggle → effect that sets
   `document.documentElement.dataset.theme` (keep the same localStorage key
   and behaviour as the legacy page, wrapped in try/catch).
3. **Hydration safety.** Pages are pre-rendered at build time. Anything that
   depends on *now* (`new Date()`, "years to today", "N days ago"), on
   `window` size, `location.hash` or `localStorage` must be computed after
   mount (`useEffect`/`useSyncExternalStore`), not during render. Dates that
   are fixed in the data (`meta.lastUpdated`) can be formatted during render
   — use `timeZone: "UTC"` and parse as `YYYY-MM-DDT00:00:00Z` so build and
   browser agree.
4. Keep every class name, id, element type and DOM nesting the CSS relies on,
   so the verbatim stylesheet still applies. Keep ARIA attributes and
   keyboard behaviour.
5. **Editions.** `edition` is `"main" | "synthetic" | "unitaid"`. Pass it to
   every `PageLink`. The legacy generators made these per-edition edits —
   reproduce them in JSX:
   - main: header link "Unitaid brand preview" → `unitaid` index.
   - unitaid: that link becomes "LAUNCH brand original" → main index.
   - synthetic: the Unitaid link (and its `·` separator) is removed.
   The synthetic strip and Unitaid skin/logo bar are added by the route file —
   don't add them in the view.
6. JSON-LD (`<script type="application/ld+json">`) is rendered as a
   `<script>` element in JSX with `JSON.stringify` — skipped when
   `data.meta.synthetic`.
7. CSV downloads: build the Blob in a click handler (unchanged logic).
8. TypeScript strict. Prefer narrow local types over `any`; if the dataset
   has a field `src/lib/types.ts` lacks, add it there (optional).

## CSS isolation

Every page ships its own global stylesheet. Cross-page navigation uses plain
`<a>` (via `PageLink`), so each navigation is a full page load and one page's
CSS never leaks into another. **Never use `next/link` between pages.**

## Verifying a port

```bash
npm run dev -- -p 3100            # the new page: http://localhost:3100/<route>/
python3 -m http.server 8100 -d <legacy checkout>   # the original
```

Compare screenshots (Playwright, 1280×900 and 390×844, light and dark
`colorScheme`) of the original vs the port, plus the interactive states
(drawer open, tooltip, map tab switch, story scroll steps). Check the browser
console for hydration warnings. `npx tsc --noEmit` must pass.
