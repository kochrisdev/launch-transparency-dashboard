// GENERATED route — edition "main", page "option-b". The UI lives in src/views/option-b/.
import type { Metadata } from "next";
import OptionB from "@/views/option-b/OptionB";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Dashboard — Design Option B" };

export default function Page() {
  return (
    <>
      <OptionB edition="main" data={loadData("main")} map={loadWorldMap()} />
    </>
  );
}
