"use client";
import type { ViewProps } from "@/lib/view";

export default function Explainer({ edition, data }: ViewProps) {
  return <main>Explainer ({edition}) — {data.products.length} products. TODO: port</main>;
}
