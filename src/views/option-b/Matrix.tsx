"use client";
import type { FocusEvent, MouseEvent } from "react";
import type { Stage } from "@/lib/types";
import { ICON, LABEL, nextMilestoneText, type TrackedProduct } from "./logic";
import type { ShowTip } from "./Tooltip";

interface Props {
  stages: string[];
  tracked: TrackedProduct[];
  selected: string | null;
  onSelect: (id: string) => void;
  showTip: ShowTip;
  hideTip: () => void;
}

function cellTip(title: string, st: Stage) {
  return (
    <>
      <b>{title}</b>
      {st.note ? <div style={{ marginBottom: 4 }}>{st.note}</div> : null}
      {st.date ? <TipRow k="Date" v={st.date} /> : null}
      {st.next ? <TipRow k="Next step" v={st.next} /> : null}
      {st.nextDate ? <TipRow k="Expected" v={st.nextDate} /> : null}
      {st.asOf ? <TipRow k="Verified" v={st.asOf} /> : null}
    </>
  );
}

function TipRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="trow">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}

/** Stages as rows, medicines as columns. Each column head opens that medicine's profile. */
export function Matrix({ stages, tracked, selected, onSelect, showTip, hideTip }: Props) {
  return (
    <div className="matrix-box">
      <div className="matrix" id="matrix" style={{ gridTemplateColumns: `170px repeat(${tracked.length}, minmax(150px, 1fr))` }}>
        <div className="mhead mlabel-head">Stage</div>
        {tracked.map((p) => {
          const next = nextMilestoneText(p);
          const on = selected === p.id;
          return (
            <div className="mhead" key={p.id}>
              <button
                className={"pcard" + (on ? " selected" : "")}
                data-id={p.id}
                aria-expanded={on ? "true" : "false"}
                onClick={() => onSelect(p.id)}
              >
                <div className="pname">{p.name}</div>
                <div className="pinn">{p.inn}</div>
                <span className={"pchip" + (p.class === "pipeline" ? " pipeline" : "")}>{p.classLabel}</span>
                {p.flag ? <div className="pflag">{p.flag}</div> : null}
                {next ? <div className="pnext">{next}</div> : null}
                <div className="popen">Open profile ↓</div>
              </button>
            </div>
          );
        })}

        {stages.map((stageName, si) => {
          const anyLate = tracked.some((p) => p.stages[si]?.status === "late");
          return (
            <div style={{ display: "contents" }} className="mrow" key={stageName}>
              <div className={"mrow-label" + (anyLate ? " has-late" : "")}>{stageName}</div>
              {tracked.map((p) => {
                const st = p.stages[si];
                const cls = [
                  "mcell",
                  si === 0 && "first",
                  si === stages.length - 1 && "last",
                  si === p.currentStage && "cur",
                  st.status === "late" && "late-cell",
                ]
                  .filter(Boolean)
                  .join(" ");
                const title = `${p.name} · ${stageName} — ${LABEL[st.status]}`;
                const show = (e: MouseEvent<HTMLSpanElement> | FocusEvent<HTMLSpanElement>) =>
                  showTip(e.currentTarget, cellTip(title, st));
                return (
                  <div className={cls} key={p.id}>
                    <span
                      className={"dot " + st.status}
                      tabIndex={0}
                      role="img"
                      aria-label={`${p.name} — ${stageName}: ${LABEL[st.status]}. ${st.note ?? ""}`}
                      onMouseEnter={show}
                      onFocus={show}
                      onMouseLeave={hideTip}
                      onBlur={hideTip}
                    >
                      {ICON[st.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
