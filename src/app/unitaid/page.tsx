// GENERATED route — edition "unitaid", page "index". The UI lives in src/views/option-a/.
import type { Metadata } from "next";
import OptionA from "@/views/option-a/OptionA";
import { UnitaidSkin } from "@/components/UnitaidSkin";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Dashboard · Unitaid Brand" };

export default function Page() {
  return (
    <>
      <UnitaidSkin />
      <OptionA edition="unitaid" data={loadData("unitaid")} map={loadWorldMap()} />
    </>
  );
}
