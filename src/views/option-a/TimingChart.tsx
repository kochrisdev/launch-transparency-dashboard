"use client";
import type { Timing, TimingGate } from "./logic";
import { useTipHandlers } from "./Tip";

/** Cross-product pathway timing: years between access gates, one row per product. */
export function TimingChart({ timing }: { timing: Timing }) {
  return (
    <section className="viz" id="timingsec">
      <h2>Pathway timing across products</h2>
      <p className="viznote">
        Actual years between access gates, from each product&apos;s first milestone. LAUNCH best-practice benchmark
        (draft): ≤ 2 years per gate — green ≤ 2, amber 3–5, red over 5. Dashes run to today where the next gate is
        still pending.
      </p>
      <div className="timing-scroll">
        <div className="timing-inner" id="timing">
          <div className="timing-axis" style={{ marginRight: 96 }}>
            {timing.axis.map((a) => (
              <span key={a.year} style={{ left: `${a.left}%` }}>
                {a.year}
              </span>
            ))}
          </div>
          {timing.rows.map((r) => (
            <div className="trow2" key={r.id}>
              <div className="tname">{r.name}</div>
              <div className="tbar">
                <div className="tbase" />
                {r.segs.map((s, i) => (
                  <div
                    key={i}
                    className={`tseg ${s.cls}`}
                    style={{ left: `${s.left}%`, width: `${s.width}%` }}
                    title={s.title}
                  />
                ))}
                {r.gates.map((gt, i) => (
                  <Gate key={i} gate={gt} />
                ))}
              </div>
              <div className="ttotal">{r.total}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="timing-pending" id="timing-pending">
        {timing.pending.length
          ? "Not yet plotted (pathway starting): " + timing.pending.map((p) => p.name).join(", ") + "."
          : ""}
      </div>
    </section>
  );
}

function Gate({ gate }: { gate: TimingGate }) {
  const tipProps = useTipHandlers();
  return (
    <span
      className="tgate"
      tabIndex={0}
      style={{ left: `${gate.left}%` }}
      data-lbl={gate.label}
      data-yr={gate.year}
      {...tipProps(
        <>
          <b>{gate.year}</b>
          {gate.label}
        </>,
      )}
    />
  );
}
