// Port of explainer.html ("Inside the LAUNCH Dashboard"): a long, fully static
// plain-language guide. No interactivity and nothing data-driven in the
// original (its key facts are hand-written prose), so this is a server
// component and `data` is intentionally unused.
import "./explainer.css";
import type { ViewProps } from "@/lib/view";
import { Masthead } from "./Masthead";
import { Rail } from "./Rail";
import { Part1 } from "./Part1";
import { Part2 } from "./Part2";
import { Part3 } from "./Part3";
import { Part4 } from "./Part4";
import { Part5 } from "./Part5";
import { Part6 } from "./Part6";
import { Part7 } from "./Part7";
import { Colophon } from "./Colophon";

export default function Explainer(_props: ViewProps) {
  return (
    <>
      <Masthead />
      <div className="wrap page">
        <Rail />
        <main>
          <Part1 />
          <Part2 />
          <Part3 />
          <Part4 />
          <Part5 />
          <Part6 />
          <Part7 />
        </main>
      </div>
      <Colophon />
    </>
  );
}
