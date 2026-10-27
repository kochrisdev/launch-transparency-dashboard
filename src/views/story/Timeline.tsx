import { Fragment } from "react";
import { gapClass, type Gate } from "./logic";

/** Story timeline: gates on a year axis, gaps coloured by length. */
export function Timeline({
  journey,
  nowYear,
  dim,
}: {
  journey: Gate[];
  nowYear: number;
  dim: "dim-late" | "dim-early";
}) {
  if (journey.length < 2) return null;
  const min = journey[0].year;
  const span = Math.max(nowYear - min, 1);
  const px = (y: number) => ((y - min) / span) * 100;

  const segs: { a: number; b: number; cls: string }[] = [];
  for (let i = 1; i < journey.length; i++) {
    const a = journey[i - 1].year;
    const b = journey[i].year;
    const gap = b - a;
    if (!gap) continue;
    segs.push({ a, b, cls: gapClass(gap) });
  }

  return (
    <div className={`stl ${dim}`}>
      <div className="base"></div>
      {segs.map((s, i) => (
        <div
          key={`s${i}`}
          className={`seg ${s.cls}`}
          style={{ left: `${px(s.a)}%`, width: `${px(s.b) - px(s.a)}%` }}
        ></div>
      ))}
      {journey.map((g, i) => (
        <Fragment key={`g${i}`}>
          <div className="gate" style={{ left: `${px(g.year)}%` }}></div>
          <div className="yr" style={{ left: `${px(g.year)}%` }}>
            {g.year}
          </div>
          {(i === 0 || i === journey.length - 1) && (
            <div className="glbl" style={{ left: `${px(g.year)}%` }}>
              {g.label}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}
