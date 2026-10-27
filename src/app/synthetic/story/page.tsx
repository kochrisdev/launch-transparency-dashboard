// GENERATED route — edition "synthetic", page "story". The UI lives in src/views/story/.
import type { Metadata } from "next";
import Story from "@/views/story/Story";
import { SyntheticStrip } from "@/components/SyntheticStrip";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "The Waiting Years · Synthetic Data" };

export default function Page() {
  return (
    <>
      <SyntheticStrip />
      <Story edition="synthetic" data={loadData("synthetic")} map={loadWorldMap()} />
    </>
  );
}
