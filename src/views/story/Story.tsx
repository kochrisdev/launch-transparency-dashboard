"use client";
import type { ViewProps } from "@/lib/view";

export default function Story({ edition, data }: ViewProps) {
  return <main>Story ({edition}) — {data.products.length} products. TODO: port</main>;
}
