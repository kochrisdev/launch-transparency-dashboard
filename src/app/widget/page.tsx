// GENERATED route — edition "main", page "widget". The UI lives in src/views/widget/.
import type { Metadata } from "next";
import Widget from "@/views/widget/Widget";
import { loadData } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Product Tracker Widget" };

export default function Page() {
  return (
    <>
      <Widget edition="main" data={loadData("main")} />
    </>
  );
}
