import type { Product } from "@/lib/types";

export const ICON: Record<string, string> = { done: "✓", prog: "›", late: "!", idle: "" };
export const LABEL: Record<string, string> = {
  done: "Complete",
  prog: "In progress",
  late: "Delayed",
  idle: "Not started",
};

/** Lower-cased `?product=` value from a query string. */
export function productParam(search: string): string {
  return (new URLSearchParams(search).get("product") || "").toLowerCase();
}

// match by stable id or by display name, so ?product=aspy works even though
// ASPY's id remains "pyramax" (ids never change; names may)
export function findProduct(tracked: Product[], id: string): Product | undefined {
  const norm = id.replace(/[^a-z0-9]/g, "");
  return tracked.find((x) => x.id === id || x.name.toLowerCase().replace(/[^a-z0-9]/g, "") === norm);
}
