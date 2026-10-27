import type { LaunchData, Product } from "@/lib/types";

export interface Phase {
  key: string;
  label: string;
  sub: string;
}

export const PHASES: Phase[] = [
  { key: "preclinical", label: "Preclinical", sub: "lab & animal studies" },
  { key: "phase1", label: "Phase I", sub: "safety, dose" },
  { key: "phase2", label: "Phase II", sub: "efficacy, dose" },
  { key: "phase3", label: "Phase III", sub: "large trials" },
  { key: "regulatory", label: "Regulatory review", sub: "SRA · WHO PQ" },
  { key: "access", label: "Approved · scaling up", sub: "adoption & procurement" },
];

export interface Category {
  cls: string;
  label: string;
  color: string;
}

// Category = card colour. Derived from classLabel keywords so new products
// fall into a sensible bucket without a schema change.
export function category(p: Product): Category {
  if (p.class === "market") return { cls: "market", label: "Marketed, underutilized", color: "var(--cat-market)" };
  if (/triple/i.test(p.classLabel ?? "")) return { cls: "tact", label: "Triple ACT", color: "var(--cat-tact)" };
  return { cls: "newclass", label: "New chemical class", color: "var(--cat-newclass)" };
}

/** "Next" line for the tooltip: first in-progress or not-started milestone. */
export function nextMilestone(p: Product): string {
  const next = p.detail?.milestones?.find((m) => m.status === "prog" || m.status === "idle");
  if (!next) return "";
  const what = next.next !== "—" ? next.next : next.milestone;
  const when = next.anticipated && next.anticipated !== "—" ? " · " + next.anticipated : "";
  return (what ?? "") + when;
}

/** "Last updated 25 Aug 2026" — fixed data date, formatted in UTC so build and browser agree. */
export function updatedLabel(data: LaunchData): string {
  const dt = new Date(data.meta.lastUpdated + "T00:00:00Z");
  return (
    "Last updated " +
    dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
  );
}

export function metaNote(status: string): string {
  return status === "live" ? " · Data confirmed by manufacturers for public release" : " · " + status + " data";
}
