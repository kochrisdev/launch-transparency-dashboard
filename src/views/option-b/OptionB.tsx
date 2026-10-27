"use client";
import type { ViewProps } from "@/lib/view";

export default function OptionB({ edition, data }: ViewProps) {
  return <main>OptionB ({edition}) — {data.products.length} products. TODO: port</main>;
}
