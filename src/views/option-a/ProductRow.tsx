"use client";
import type { MouseEvent, ReactNode } from "react";
import type { Product, Stage } from "@/lib/types";
import { asset } from "@/lib/paths";
import { useGlosser } from "./Gloss";
import { useTipHandlers } from "./Tip";
import { ICON, LABEL, SHADES, STAGE_ICONS, journeyGap, priceProvenance, sourceNote, str, volumeOf } from "./logic";

export type BoardVariant = "classic" | "illustrated";

interface RowProps {
  product: Product;
  stages: string[];
  dataStatus: string;
  variant: BoardVariant;
  open: boolean;
  onToggle: (id: string) => void;
}

/** Journey icon for stage i (illustrated variant). */
export function StageIcon({ index, className }: { index: number; className?: string }) {
  const name = STAGE_ICONS[index];
  if (!name) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={asset(`assets/journey-icons/${name}.svg`)} alt="" aria-hidden="true" />;
}

function StageTip({ name, st }: { name: string; st: Stage }) {
  return (
    <>
      <b>
        {name} — {LABEL[st.status]}
      </b>
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

/** Stage status marker: a plain dot (classic) or journey icon + status badge (illustrated). */
function StageMarker({ name, st, index, variant }: { name: string; st: Stage; index: number; variant: BoardVariant }) {
  const tipProps = useTipHandlers();
  const common = {
    tabIndex: 0,
    role: "img",
    "aria-label": `${name}: ${LABEL[st.status]}. ${str(st.note)}`,
    "data-stage": name,
    "data-status": st.status,
    // dots are for tooltips — don't toggle the row
    onClick: (e: MouseEvent) => e.stopPropagation(),
    ...tipProps(<StageTip name={name} st={st} />),
  };
  if (variant === "illustrated") {
    return (
      <span className="smark" {...common}>
        <StageIcon index={index} className="sicon" />
        <span className={`dot ${st.status}`} aria-hidden="true">
          {ICON[st.status]}
        </span>
      </span>
    );
  }
  return (
    <span className={`dot ${st.status}`} {...common}>
      {ICON[st.status]}
    </span>
  );
}

export function ProductRow({ product: p, stages, dataStatus, variant, open, onToggle }: RowProps) {
  // first-occurrence glossary marking runs over the row in document order
  const seen = new Set<string>();
  const g = useGlosser(seen);
  const pStages = p.stages ?? [];

  const pid = (
    <div className="pid">
      <div className="name">{g(p.name)}</div>
      <div className="inn">{g(p.inn)}</div>
      <div className="mfr">{g(p.manufacturer)}</div>
      <div className="chips">
        <span className={`chip ${p.class === "pipeline" ? "pipeline" : ""}`}>{g(p.classLabel)}</span>
      </div>
    </div>
  );
  const track = pStages.map((st, i) => {
    const preDone = i > 0 && pStages[i - 1].status === "done";
    const postDone = st.status === "done";
    const cls = ["stage", i === p.currentStage ? "cur" : "", variant === "illustrated" ? `s-${st.status}` : ""]
      .filter(Boolean)
      .join(" ");
    return (
      <div className={cls} key={i}>
        <div className="row">
          <div className={`bar pre ${preDone ? "done-bar" : ""}`} />
          <StageMarker name={stages[i]} st={st} index={i} variant={variant} />
          <div className={`bar post ${postDone ? "done-bar" : ""}`} />
        </div>
        <div className="lbl">{g(stages[i])}</div>
      </div>
    );
  });
  const flag = p.flag ? <div className="flagnote">{g(p.flag)}</div> : null;
  const detail = <ProductDetail product={p} dataStatus={dataStatus} seenBefore={new Set(seen)} />;

  return (
    <section className={`product${open ? " open" : ""}`} id={p.id}>
      <button
        className="prow"
        aria-expanded={open ? "true" : "false"}
        aria-controls={`${p.id}-detail`}
        onClick={() => onToggle(p.id)}
      >
        {pid}
        <div className="trackbox">
          <div className="track">{track}</div>
        </div>
      </button>
      {flag}
      <div style={{ height: 14 }} />
      {detail}
    </section>
  );
}

function ProductDetail({ product: p, dataStatus, seenBefore }: { product: Product; dataStatus: string; seenBefore: Set<string> }) {
  const g = useGlosser(new Set(seenBefore));
  const d = p.detail ?? {};
  const price = d.price ?? { value: "" };
  const country = d.country;
  const research = d.research ?? {};
  const vol = volumeOf(p);
  const prov = priceProvenance(p);

  // evaluated in document order (see useGlosser)
  const cards: ReactNode[] = [];
  cards.push(
    <div className="card" key="price">
      <h3>{g("Indicative price per treatment")}</h3>
      <div className="big">{g(price.value)}</div>
      <div className="sub">{g(price.note)}</div>
      {prov ? <div className="prov">{g(prov)}</div> : null}
    </div>,
    <div className="card" key="use">
      <h3>{g("Target use case")}</h3>
      <p>{g(d.useCase)}</p>
    </div>,
    <div className="card" key="access">
      <h3>{g("Access & supply commitments")}</h3>
      <ul>
        {(d.access ?? []).map((a, i) => (
          <li key={i}>{g(a)}</li>
        ))}
      </ul>
    </div>,
    <div className="card" key="adoption">
      <h3>{g("Adoption requirements")}</h3>
      <ul>
        {(d.adoption ?? []).map((a, i) => (
          <li key={i}>{g(a)}</li>
        ))}
      </ul>
    </div>,
    <div className="card" key="country">
      <h3>{g("Country access")}</h3>
      <KV k={g("Registered")} v={g(country?.registered)} />
      <KV k={g("In national guidelines")} v={g(country?.inGuidelines)} />
      <KV k={g("In MFT plans")} v={g(country?.inMft)} />
      <KV k={g("Forecast demand")} v={g(country?.forecastDemand)} />
    </div>,
    <div className="card" key="research">
      <h3>{g("Operational research")}</h3>
      <KV k={g("Lead")} v={g(research.lead)} />
      <KV k={g("Geographies")} v={g(research.geographies)} />
      <KV k={g("Timeline")} v={g(research.timeline)} />
      <p style={{ marginTop: 6 }}>
        <em>{g(research.question)}</em>
      </p>
    </div>,
  );
  cards.push(
    vol ? (
      <div className="card" key="volume">
        <h3>{g("Treatments procured · " + str(vol.period))}</h3>
        <div className="big">{g(vol.total)}</div>
        <div className="split" aria-hidden="true">
          {vol.split.map((s, i) => (
            <div key={i} style={{ width: `${s.pct}%`, background: SHADES[i % SHADES.length] }} title={`${s.channel} ${s.pct}%`} />
          ))}
        </div>
        <div className="split-legend">
          {vol.split.map((s, i) => (
            <span className="key" key={i}>
              <span className="sw" style={{ background: SHADES[i % SHADES.length] }} />
              {g(`${s.channel} ${s.pct}%`)}
            </span>
          ))}
        </div>
        {vol.source ? <div className="prov">{g("Source: " + vol.source)}</div> : null}
      </div>
    ) : (
      <div className="card" key="volume">
        <h3>{g("Treatments procured")}</h3>
        <div className="big">—</div>
        <div className="sub">{g(d.volumeNote || "Data not yet available")}</div>
      </div>
    ),
  );

  let journey: ReactNode = null;
  if (d.journey) {
    const jn = d.journey;
    const h3 = g("Time between gates");
    const note = g(
      "Elapsed time between access milestones. Benchmark (LAUNCH deep-dive, draft): ≤ 2 yrs between gates; 3–5 yrs slow; over 5 yrs a systemic delay.",
    );
    const parts: ReactNode[] = [];
    jn.forEach((j, i) => {
      if (i > 0) {
        const gap = journeyGap(jn[i - 1].year, j.year);
        parts.push(
          <span className={`jgap ${gap.cls}`} key={`gap${i}`}>
            {g(gap.text)}
          </span>,
        );
      }
      parts.push(
        <div className="jnode" key={`node${i}`}>
          <div className={`jyear ${j.year === "TBC" ? "tbc" : ""}`}>{g(j.year)}</div>
          <div className="jlbl">{g(j.label)}</div>
        </div>,
      );
    });
    journey = (
      <div className="journey-wrap">
        <h3>{h3}</h3>
        <p className="jnote">{note}</p>
        <div className="journey">{parts}</div>
      </div>
    );
  }

  const headers = ["Milestone", "Status", "Date achieved / submitted", "Next expected step", "Anticipated"].map((h) => (
    <th key={h}>{g(h)}</th>
  ));
  const rows = (d.milestones ?? []).map((m, i) => (
    <tr key={i}>
      <td>{g(m.milestone)}</td>
      <td>
        <span className={`pill ${m.status}`}>{g((ICON[m.status] ? ICON[m.status] + " " : "") + str(m.label))}</span>
      </td>
      <td>{g(m.date)}</td>
      <td>{g(m.next)}</td>
      <td>{g(m.anticipated)}</td>
    </tr>
  ));
  const src = g(sourceNote(dataStatus));

  return (
    <div className="detail" id={`${p.id}-detail`}>
      <div className="cards">{cards}</div>
      {journey}
      <div className="mtable-box">
        <table className="mtable">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
      <div className="src">{src}</div>
    </div>
  );
}

function KV({ k, v }: { k: ReactNode; v: ReactNode }) {
  return (
    <div className="kv">
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}

/** Not-yet-tracked product (e.g. prevention tools): name + note, no track. */
export function PlaceholderRow({ product: p }: { product: Product }) {
  const g = useGlosser(new Set());
  return (
    <section className="product future">
      <div className="prow" style={{ cursor: "default" }}>
        <div className="pid">
          <div className="name">{g(p.name)}</div>
          <div className="inn">{g(p.inn)}</div>
          <div className="mfr">{g(p.manufacturer)}</div>
          <div className="chips">
            <span className="chip soon">{g(p.classLabel)}</span>
          </div>
        </div>
        <div style={{ color: "var(--ink-3)", fontSize: "13.5px" }}>{g(p.note)}</div>
      </div>
      <div style={{ height: 14 }} />
    </section>
  );
}
