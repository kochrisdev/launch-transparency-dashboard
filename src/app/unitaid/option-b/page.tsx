// GENERATED route — edition "unitaid", page "option-b". The UI lives in src/views/option-b/.
import type { Metadata } from "next";
import OptionB from "@/views/option-b/OptionB";
import { UnitaidSkin } from "@/components/UnitaidSkin";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Dashboard · Unitaid Brand (Option B)" };

export default function Page() {
  return (
    <>
      <UnitaidSkin />
      <OptionB edition="unitaid" data={loadData("unitaid")} map={loadWorldMap()} />
    </>
  );
}
