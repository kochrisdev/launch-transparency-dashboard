"use client";
import type { ViewProps } from "@/lib/view";

export default function IllustratedJourney({ edition, data }: ViewProps) {
  return <main>IllustratedJourney ({edition}) — {data.products.length} products. TODO: port</main>;
}
