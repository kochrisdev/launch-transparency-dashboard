// GENERATED route — edition "main", page "explainer". The UI lives in src/views/explainer/.
import type { Metadata } from "next";
import Explainer from "@/views/explainer/Explainer";
import { loadData } from "@/lib/data";

export const metadata: Metadata = {
  title: "Inside the LAUNCH Dashboard",
  description:
    "A complete plain-language guide to the LAUNCH Transparency Dashboard - the problem, the domain, how to read it, where its numbers come from, and how it is built.",
};

export default function Page() {
  return (
    <>
      <Explainer edition="main" data={loadData("main")} />
    </>
  );
}
