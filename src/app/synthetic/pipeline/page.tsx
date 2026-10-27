// GENERATED route — edition "synthetic", page "pipeline". The UI lives in src/views/pipeline/.
import type { Metadata } from "next";
import Pipeline from "@/views/pipeline/Pipeline";
import { SyntheticStrip } from "@/components/SyntheticStrip";
import { loadData } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Pipeline Poster · Synthetic Data" };

export default function Page() {
  return (
    <>
      <SyntheticStrip />
      <Pipeline edition="synthetic" data={loadData("synthetic")} />
    </>
  );
}
