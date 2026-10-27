// GENERATED route — edition "synthetic", page "widget". The UI lives in src/views/widget/.
import type { Metadata } from "next";
import Widget from "@/views/widget/Widget";
import { loadData } from "@/lib/data";

export const metadata: Metadata = { title: "LAUNCH Product Tracker Widget · Synthetic Data" };

export default function Page() {
  return (
    <>
      <Widget edition="synthetic" data={loadData("synthetic")} />
    </>
  );
}
