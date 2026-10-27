// GENERATED route — edition "main", page "story". The UI lives in src/views/story/.
import type { Metadata } from "next";
import Story from "@/views/story/Story";
import { loadData, loadWorldMap } from "@/lib/data";

export const metadata: Metadata = { title: "The Waiting Years" };

export default function Page() {
  return (
    <>
      <Story edition="main" data={loadData("main")} map={loadWorldMap()} />
    </>
  );
}
