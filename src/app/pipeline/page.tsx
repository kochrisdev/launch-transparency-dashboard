// GENERATED route — edition "main", page "pipeline". The UI lives in src/views/pipeline/.
import type { Metadata } from "next";
import Pipeline from "@/views/pipeline/Pipeline";
import { loadData } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Pipeline Poster" };

export default function Page() {
  return (
    <>
      <Pipeline edition="main" data={loadData("main")} />
    </>
  );
}
