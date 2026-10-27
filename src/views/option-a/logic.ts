// Pure helpers for the journey board (Option A) and its illustrated variant.
// No React, no DOM — everything here is deterministic from the dataset, so it
// is safe to run during the static pre-render.
import type { CountryLevel, LaunchData, Product, Stage, VolumeChannel } from "@/lib/types";

export type StatusKey = "done" | "prog" | "late" | "idle";

export const ICON: Record<string, string> = { done: "✓", prog: "›", late: "!", idle: "" };
export const LABEL: Record<string, string> = {
  done: "Complete",
  prog: "In progress",
  late: "Delayed",
  idle: "Not started",
};
export const LEVEL_LABEL: Record<string, string> = {
  registered: "Registered",
  guidelines: "In national guidelines",
  mft: "In MFT plans",
};

/** Channel-split shades for the procurement bar (light→dark accent). */
export const SHADES = ["#14657E", "#3E8CA3", "#77AFC0", "#B4D2DC"];

/** Illustrated journey icons, one per stage, in stage order (assets/journey-icons/). */
export const STAGE_ICONS = [
  "01-rnd-clinical",
  "02-regulatory-approval",
  "03-who-guidelines",
  "04-who-prequalification",
  "05-country-registration",
  "06-national-policy",
  "07-procurement",
  "08-in-country-delivery",
];

// ---- narrow views of the polymorphic detail fields used by this page ----

/** `detail.volume` as this page's dataset writes it. */
export interface VolumeSummary {
  total?: string;
  period?: string;
  split: VolumeChannel[];
  source?: string;
}

/** `detail.countries` as this page's dataset writes it. */
export interface CountryAccess {
  status?: "verified" | "illustrative" | "draft" | string;
  note?: string;
  list: CountryLevel[];
}

export function volumeOf(p: Product): VolumeSummary | null {
  const v = p.detail?.volume as unknown as VolumeSummary | null | undefined;
  return v ? { ...v, split: Array.isArray(v.split) ? v.split : [] } : null;
}

export function countriesOf(p: Product): CountryAccess | null {
  const c = p.detail?.countries as unknown as CountryAccess | null | undefined;
  return c ? { ...c, list: Array.isArray(c.list) ? c.list : [] } : null;
}

export const str = (v: unknown): string => (v == null ? "" : String(v));

// ---- header / banner ----

/** "25 Aug 2026" — parsed as UTC midnight so build and browser agree. */
export function formatUpdated(isoDate: string): string {
  const dt = new Date(isoDate + "T00:00:00Z");
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function metaNote(status: string): string {
  return status === "live" ? " · Data confirmed by manufacturers for public release" : " · " + status + " data";
}

export function sourceNote(status: string): string {
  return status === "illustrative"
    ? "Illustrative data for design review. Live version: each figure links to its public source and the date the manufacturer confirmed release."
    : status === "draft"
    ? "Draft data compiled from public sources — pending verification. Manufacturer-specific details will appear only once release is confirmed in writing."
    : "Each figure reflects its cited public source; manufacturer-specific details are shown only where release was confirmed in writing.";
}

// ---- summary stats (derived, never hand-typed) ----

export function trackedProducts(data: LaunchData): Product[] {
  return data.products.filter((p) => !p.placeholder);
}

export function summaryStats(tracked: Product[]) {
  return {
    tracked: tracked.length,
    bottlenecks: tracked.filter((p) => (p.stages ?? []).some((s) => s.status === "late")).length,
    pipeline: tracked.filter((p) => p.class === "pipeline").length,
  };
}

export function priceProvenance(p: Product): string {
  const price = p.detail?.price;
  if (!price) return "";
  return [
    price.source ? "Source: " + price.source : "",
    price.confirmedInWriting ? "Manufacturer-confirmed in writing" : "",
    price.asOf ? "as of " + price.asOf : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

// ---- gap colouring (journey chips and timing bars) ----

export type GapClass = "g-good" | "g-warn" | "g-crit" | "g-tbc";
export const gapClass = (gap: number): GapClass => (gap <= 2 ? "g-good" : gap <= 5 ? "g-warn" : "g-crit");
const isYear = (y: unknown): y is number => Number.isInteger(y);

export interface JourneyGap {
  cls: GapClass;
  text: string;
}

/** Chip between journey node i-1 and i. */
export function journeyGap(a: unknown, b: unknown): JourneyGap {
  if (isYear(a) && isYear(b)) {
    const gap = b - a;
    return { cls: gapClass(gap), text: gap === 0 ? "same year" : "+" + gap + " yr" + (gap === 1 ? "" : "s") };
  }
  return { cls: "g-tbc", text: "pending" };
}

// ---- cross-product pathway timing chart ----

export interface TimingSeg {
  cls: GapClass;
  left: number;
  width: number;
  title: string;
}
export interface TimingGate {
  left: number;
  label: string;
  year: number;
}
export interface TimingRow {
  id: string;
  name: string;
  segs: TimingSeg[];
  gates: TimingGate[];
  total: string;
}
export interface Timing {
  rows: TimingRow[];
  axis: { year: number; left: number }[];
  pending: Product[];
}

export function buildTiming(data: LaunchData, tracked: Product[]): Timing | null {
  const nowYear = parseInt(data.meta.lastUpdated.slice(0, 4), 10);
  const withJourney = tracked.filter(
    (p) => p.detail?.journey && p.detail.journey.filter((g) => isYear(g.year)).length >= 2,
  );
  const without = tracked.filter((p) => !withJourney.includes(p));
  if (!withJourney.length) return null;

  let minY = Infinity;
  const maxY = nowYear;
  withJourney.forEach((p) =>
    p.detail!.journey!.forEach((g) => {
      if (isYear(g.year)) minY = Math.min(minY, g.year);
    }),
  );
  const span = maxY - minY || 1;
  const px = (y: number) => ((y - minY) / span) * 100;

  const rows = withJourney.map((p): TimingRow => {
    const gates = p.detail!.journey!;
    const dated = gates.filter((g) => isYear(g.year)) as { label: string; year: number }[];
    const last = dated[dated.length - 1];
    const hasPending = gates.some((g) => g.year === "TBC");
    const segs: TimingSeg[] = [];
    for (let i = 1; i < dated.length; i++) {
      const a = dated[i - 1].year,
        b = dated[i].year,
        gap = b - a;
      if (gap === 0) continue;
      segs.push({ cls: gapClass(gap), left: px(a), width: px(b) - px(a), title: "+" + gap + " yr" + (gap === 1 ? "" : "s") });
    }
    if (hasPending && last.year < nowYear)
      segs.push({ cls: "g-tbc", left: px(last.year), width: px(nowYear) - px(last.year), title: "Next gate still pending" });
    const totalYrs = (hasPending ? nowYear : last.year) - dated[0].year;
    return {
      id: p.id,
      name: p.name,
      segs,
      gates: dated.map((g) => ({ left: px(g.year), label: g.label, year: g.year })),
      total: hasPending ? totalYrs + " yrs, ongoing" : totalYrs + " yrs",
    };
  });

  const step = span > 12 ? 4 : 3;
  const axis: Timing["axis"] = [];
  for (let y = minY; y <= maxY; y += step) axis.push({ year: y, left: px(y) });
  return { rows, axis, pending: without };
}

// ---- CSV download ----

function csvCell(v: unknown): string {
  const s = str(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** Stages and milestones for every tracked product (BOM-prefixed, CRLF). */
export function buildCsv(data: LaunchData, tracked: Product[]): string {
  const rows: unknown[][] = [["Product", "Record", "Item", "Status", "Detail", "Date", "Next step", "Anticipated", "Source", "As of"]];
  tracked.forEach((p) => {
    (p.stages ?? []).forEach((s: Stage, i) =>
      rows.push([p.name, "Stage", data.stages[i], LABEL[s.status], s.note, s.date, s.next, s.nextDate, s.source || "", s.asOf || ""]),
    );
    (p.detail?.milestones ?? []).forEach((m) =>
      rows.push([p.name, "Milestone", m.milestone, LABEL[m.status], m.label, m.date, m.next, m.anticipated, m.source || "", ""]),
    );
  });
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

// ---- glossary ----

export type GlossPiece = string | { term: string };

/**
 * Splits text into plain runs and glossary terms. Only the first occurrence
 * of each term per product is marked (repetition is noise): `seen` carries
 * that state across all text of one product, in document order.
 */
export function createGlosser(glossary: Record<string, string>) {
  const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
  const re = terms.length
    ? new RegExp("\\b(" + terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b", "g")
    : null;
  return function split(text: string, seen: Set<string>): GlossPiece[] {
    if (!re || !text) return [text];
    const out: GlossPiece[] = [];
    let m: RegExpExecArray | null;
    let last = 0;
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      out.push(text.slice(last, m.index), { term: m[1] });
      last = m.index + m[1].length;
    }
    if (!out.length) return [text];
    out.push(text.slice(last));
    return out;
  };
}
