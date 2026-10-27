"use client";
import "./illustrated-journey.css";
import type { ViewProps } from "@/lib/view";
import { JourneyBoard } from "@/views/option-a/JourneyBoard";

/**
 * Illustrated journey (legacy illustrated-journey-dashboard.html): the Option A
 * journey board with illustrated stage badges (assets/journey-icons/) and a
 * pathway legend strip. All logic is shared with Option A.
 */
export default function IllustratedJourney(props: ViewProps) {
  return <JourneyBoard {...props} variant="illustrated" />;
}
