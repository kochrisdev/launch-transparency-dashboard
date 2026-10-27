import type { Product } from "@/lib/types";
import { TRACK_ICON } from "./logic";

/** Eight-gate stage-dot track for the hero product, split into two halves. */
export function StageTrack({ hero, stageNames }: { hero: Product; stageNames: string[] }) {
  const stages = hero.stages ?? [];
  return (
    <div className="panel">
      <div className="trk">
        {stages.map((s, i) => {
          const preDone = i > 0 && stages[i - 1].status === "done";
          return (
            <div className="st" key={i}>
              <div className="row">
                <div className={`bar pre ${preDone ? "g" : ""}`}></div>
                <span className={`dot ${s.status}`}>{TRACK_ICON[s.status] ?? ""}</span>
                <div className={`bar post ${s.status === "done" ? "g" : ""}`}></div>
              </div>
              <div className="lbl">{stageNames[i]}</div>
            </div>
          );
        })}
      </div>
      <div className="halves">
        <div className="h1">Science &amp; global approvals ✓</div>
        <div className="h2">Country adoption — where it stalls</div>
      </div>
    </div>
  );
}
