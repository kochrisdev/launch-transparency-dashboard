// GENERATED route — edition "main", page "index". The UI lives in src/views/option-a/.
import type { Metadata } from "next";
import OptionA from "@/views/option-a/OptionA";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Transparency Dashboard" };

export default function Page() {
  return (
    <>
      <OptionA edition="main" data={loadData("main")} map={loadWorldMap()} />
    </>
  );
}
