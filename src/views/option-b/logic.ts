// Pure helpers for the Option B comparison matrix (ported from option-b.html).
import type { CountryLevel, JourneyPoint, LaunchData, Milestone, Product, Stage } from "@/lib/types";

export type Status = "done" | "prog" | "late" | "idle";

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

/** A product that is actually tracked (not a "coming next" placeholder). */
export type TrackedProduct = Product & { stages: Stage[] };

export function trackedProducts(data: LaunchData): TrackedProduct[] {
  return data.products.filter((p): p is TrackedProduct => !p.placeholder);
}
export function placeholderProducts(data: LaunchData): Product[] {
  return data.products.filter((p) => p.placeholder);
}

/** "Last updated 28 Aug 2026" — fixed data date, formatted identically at build and in the browser. */
export function formatUpdated(iso: string): string {
  const dt = new Date(iso + "T00:00:00Z");
  return (
    "Last updated " +
    dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
  );
}

export function metaNote(status: string): string {
  return status === "live" ? " · Data confirmed by manufacturers for public release" : " · " + status + " data";
}

export function milestones(p: Product): Milestone[] {
  return p.detail?.milestones ?? [];
}

/** First milestone still to come, shown as "Next: …" on the product card. */
export function nextMilestoneText(p: Product): string | null {
  const m = milestones(p).find((x) => x.status === "prog" || x.status === "idle");
  if (!m) return null;
  let s = "Next: " + (m.next !== "—" ? (m.next ?? "") : m.milestone);
  if (m.anticipated && m.anticipated !== "—") s += " · " + m.anticipated;
  return s;
}

/** detail.countries as stored: { status, note, list: [{iso3, level}] } */
export interface CountryAccess {
  status?: string;
  note?: string;
  list: CountryLevel[];
}
export function countryAccess(p: Product): CountryAccess | null {
  const c = p.detail?.countries as unknown as Partial<CountryAccess> | undefined;
  if (!c) return null;
  return { status: c.status, note: c.note, list: Array.isArray(c.list) ? c.list : [] };
}

// ---------- CSV ----------
function csvCell(v: unknown): string {
  const s = String(v == null ? "" : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function buildCsv(data: LaunchData, tracked: TrackedProduct[]): string {
  const rows: unknown[][] = [
    ["Product", "Record", "Item", "Status", "Detail", "Date", "Next step", "Anticipated", "Source", "As of"],
  ];
  tracked.forEach((p) => {
    p.stages.forEach((s, i) =>
      rows.push([p.name, "Stage", data.stages[i], LABEL[s.status], s.note, s.date, s.next, s.nextDate, s.source || "", s.asOf || ""]),
    );
    milestones(p).forEach((m) =>
      rows.push([p.name, "Milestone", m.milestone, LABEL[m.status], m.label, m.date, m.next, m.anticipated, m.source || "", ""]),
    );
  });
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(data: LaunchData, tracked: TrackedProduct[]): void {
  const csv = buildCsv(data, tracked);
  const blob = new Blob([String.fromCharCode(0xfeff) + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "launch-dashboard-data-" + data.meta.lastUpdated + ".csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ---------- pathway timing ----------
export interface TimingSegment {
  cls: "g-good" | "g-warn" | "g-crit" | "g-tbc";
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
  segs: TimingSegment[];
  gates: TimingGate[];
  total: string;
}
export interface Timing {
  rows: TimingRow[];
  axis: { year: number; left: number }[];
  pending: string;
}

type DatedPoint = JourneyPoint & { year: number };
const isDated = (g: JourneyPoint): g is DatedPoint => Number.isInteger(g.year);

/** Years between access gates per product. "Today" is meta.lastUpdated's year, so render is deterministic. */
export function buildTiming(data: LaunchData, tracked: TrackedProduct[]): Timing | null {
  const nowYear = parseInt(data.meta.lastUpdated.slice(0, 4), 10);
  const withJourney = tracked.filter((p) => (p.detail?.journey ?? []).filter(isDated).length >= 2);
  const without = tracked.filter((p) => !withJourney.includes(p));
  if (!withJourney.length) return null;

  let minY = Infinity;
  const maxY = nowYear;
  withJourney.forEach((p) => (p.detail?.journey ?? []).filter(isDated).forEach((g) => (minY = Math.min(minY, g.year))));
  const span = maxY - minY || 1;
  const px = (y: number) => ((y - minY) / span) * 100;

  const rows = withJourney.map((p): TimingRow => {
    const journey = p.detail?.journey ?? [];
    const dated = journey.filter(isDated);
    const last = dated[dated.length - 1];
    const hasPending = journey.some((g) => g.year === "TBC");
    const segs: TimingSegment[] = [];
    for (let i = 1; i < dated.length; i++) {
      const a = dated[i - 1].year;
      const b = dated[i].year;
      const gap = b - a;
      if (gap === 0) continue;
      const cls = gap <= 2 ? "g-good" : gap <= 5 ? "g-warn" : "g-crit";
      segs.push({ cls, left: px(a), width: px(b) - px(a), title: `+${gap} yr${gap === 1 ? "" : "s"}` });
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

  const pending = without.length
    ? "Not yet plotted (pathway starting): " + without.map((p) => p.name).join(", ") + "."
    : "";
  return { rows, axis, pending };
}
