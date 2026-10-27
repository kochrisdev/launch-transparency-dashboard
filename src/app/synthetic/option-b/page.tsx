// GENERATED route — edition "synthetic", page "option-b". The UI lives in src/views/option-b/.
import type { Metadata } from "next";
import OptionB from "@/views/option-b/OptionB";
import { SyntheticStrip } from "@/components/SyntheticStrip";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Dashboard · Synthetic Data (Option B)" };

export default function Page() {
  return (
    <>
      <SyntheticStrip />
      <OptionB edition="synthetic" data={loadData("synthetic")} map={loadWorldMap()} />
    </>
  );
}
