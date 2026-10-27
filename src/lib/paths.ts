import type { Edition, PageKey } from "./edition";
import { EDITIONS, EDITION_PAGES } from "./edition";

// Site-absolute URLs that respect the GitHub Pages basePath.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** URL of a dashboard page within an edition, e.g. pageHref("option-b", "synthetic") → /…/synthetic/option-b/ */
export function pageHref(page: PageKey, edition: Edition = "main"): string {
  // pages that don't exist in this edition fall back to the main edition
  const ed = EDITION_PAGES[edition].includes(page) ? edition : "main";
  const prefix = EDITIONS[ed].prefix;
  const tail = page === "index" ? "" : `${page}/`;
  return `${BASE}/${prefix}${tail}`;
}

/** URL of a static file copied verbatim into the export (assets/, data/, feed.xml, ontology/…). */
export function asset(rel: string): string {
  return `${BASE}/${rel.replace(/^\/+/, "")}`;
}
