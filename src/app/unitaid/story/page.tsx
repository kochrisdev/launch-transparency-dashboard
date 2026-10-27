// GENERATED route — edition "unitaid", page "story". The UI lives in src/views/story/.
import type { Metadata } from "next";
import Story from "@/views/story/Story";
import { UnitaidSkin } from "@/components/UnitaidSkin";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "The Waiting Years · Unitaid Brand" };

export default function Page() {
  return (
    <>
      <UnitaidSkin />
      <Story edition="unitaid" data={loadData("unitaid")} map={loadWorldMap()} />
    </>
  );
}
