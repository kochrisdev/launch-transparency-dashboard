// GENERATED route — edition "synthetic", page "index". The UI lives in src/views/option-a/.
import type { Metadata } from "next";
import OptionA from "@/views/option-a/OptionA";
import { SyntheticStrip } from "@/components/SyntheticStrip";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Dashboard · Synthetic Data" };

export default function Page() {
  return (
    <>
      <SyntheticStrip />
      <OptionA edition="synthetic" data={loadData("synthetic")} map={loadWorldMap()} />
    </>
  );
}
