// GENERATED route — edition "main", page "explainer". The UI lives in src/views/explainer/.
import type { Metadata } from "next";
import Explainer from "@/views/explainer/Explainer";
import { loadData } from "@/lib/data";

export const metadata: Metadata = { title: "Inside the LAUNCH Dashboard" };

export default function Page() {
  return (
    <>
      <Explainer edition="main" data={loadData("main")} />
    </>
  );
}
