"use client";
import type { ViewProps } from "@/lib/view";

export default function Pipeline({ edition, data }: ViewProps) {
  return <main>Pipeline ({edition}) — {data.products.length} products. TODO: port</main>;
}
