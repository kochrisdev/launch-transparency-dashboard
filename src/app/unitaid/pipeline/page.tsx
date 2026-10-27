// GENERATED route — edition "unitaid", page "pipeline". The UI lives in src/views/pipeline/.
import type { Metadata } from "next";
import Pipeline from "@/views/pipeline/Pipeline";
import { UnitaidSkin } from "@/components/UnitaidSkin";
import { loadData } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Pipeline Poster · Unitaid Brand" };

export default function Page() {
  return (
    <>
      <UnitaidSkin />
      <Pipeline edition="unitaid" data={loadData("unitaid")} />
    </>
  );
}
