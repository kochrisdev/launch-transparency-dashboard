// GENERATED route — edition "main", page "illustrated-journey-dashboard". The UI lives in src/views/illustrated-journey/.
import type { Metadata } from "next";
import IllustratedJourney from "@/views/illustrated-journey/IllustratedJourney";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Transparency Dashboard — Illustrated journey" };

export default function Page() {
  return (
    <>
      <IllustratedJourney edition="main" data={loadData("main")} map={loadWorldMap()} />
    </>
  );
}
