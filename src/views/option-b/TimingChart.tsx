"use client";
import type { FocusEvent, MouseEvent } from "react";
import type { Timing } from "./logic";
import type { ShowTip } from "./Tooltip";

interface Props {
  timing: Timing;
  showTip: ShowTip;
  hideTip: () => void;
}

/** Years between access gates, one bar per product, on a shared year axis. */
export function TimingChart({ timing, showTip, hideTip }: Props) {
  return (
    <section className="viz" id="timingsec">
      <h2>Pathway timing across products</h2>
      <p className="viznote">
        Actual years between access gates, from each product&apos;s first milestone. LAUNCH best-practice benchmark (draft): ≤ 2
        years per gate — green ≤ 2, amber 3–5, red over 5. Dashes run to today where the next gate is still pending.
      </p>
      <div className="timing-scroll">
        <div className="timing-inner" id="timing">
          <div className="timing-axis" style={{ marginRight: 96 }}>
            {timing.axis.map((a) => (
              <span key={a.year} style={{ left: a.left + "%" }}>
                {a.year}
              </span>
            ))}
          </div>
          {timing.rows.map((r) => (
            <div className="trow2" key={r.id}>
              <div className="tname">{r.name}</div>
              <div className="tbar">
                <div className="tbase"></div>
                {r.segs.map((s, i) => (
                  <div key={i} className={"tseg " + s.cls} style={{ left: s.left + "%", width: s.width + "%" }} title={s.title}></div>
                ))}
                {r.gates.map((g, i) => {
                  const show = (e: MouseEvent<HTMLSpanElement> | FocusEvent<HTMLSpanElement>) =>
                    showTip(
                      e.currentTarget,
                      <>
                        <b>{g.year}</b>
                        {g.label}
                      </>,
                    );
                  return (
                    <span
                      key={i}
                      className="tgate"
                      tabIndex={0}
                      style={{ left: g.left + "%" }}
                      onMouseEnter={show}
                      onFocus={show}
                      onMouseLeave={hideTip}
                      onBlur={hideTip}
                    ></span>
                  );
                })}
              </div>
              <div className="ttotal">{r.total}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="timing-pending" id="timing-pending">
        {timing.pending}
      </div>
    </section>
  );
}
