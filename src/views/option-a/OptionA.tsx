"use client";
import "./option-a.css";
import type { ViewProps } from "@/lib/view";
import { JourneyBoard } from "./JourneyBoard";

/** Journey board (legacy index.html, "Option A"). */
export default function OptionA(props: ViewProps) {
  return <JourneyBoard {...props} variant="classic" />;
}
