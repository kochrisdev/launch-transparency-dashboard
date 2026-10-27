"use client";
import type { CSSProperties, FocusEvent, MouseEvent } from "react";
import type { Edition } from "@/lib/edition";
import type { Product } from "@/lib/types";
import { pageHref } from "@/lib/paths";
import { PHASES, category, nextMilestone } from "./logic";
import type { TipState } from "./Tooltip";

type CardEvent = MouseEvent<HTMLElement> | FocusEvent<HTMLElement>;

interface Props {
  edition: Edition;
  tracked: Product[];
  placeholders: Product[];
  onTip: (tip: TipState | null) => void;
}

function TrackedCard({ p, edition, onTip }: { p: Product; edition: Edition; onTip: Props["onTip"] }) {
  const cat = category(p);
  const next = nextMilestone(p);
  const show = (e: CardEvent) =>
    onTip({
      anchor: e.currentTarget,
      content: (
        <>
          <b>{p.name}</b>
          {p.detail?.useCase ?? ""}
          {next && <div style={{ marginTop: 4, opacity: 0.85 }}>{`Next: ${next}`}</div>}
          {p.flag && <div className="fl">{`▲ ${p.flag}`}</div>}
        </>
      ),
    });
  const hide = () => onTip(null);
  return (
    <button
      className="pcard"
      style={{ "--cat": cat.color } as CSSProperties}
      data-id={p.id}
      onMouseEnter={show}
      onFocus={show}
      onMouseLeave={hide}
      onBlur={hide}
      // full-page navigation to the journey board, deep-linked to this product
      onClick={() => {
        window.location.href = pageHref("index", edition) + "#" + p.id;
      }}
    >
      <div className="n">
        {p.flag ? <span className="flagdot" title="Active bottleneck"></span> : null}
        {p.name}
      </div>
      <div className="i">{p.inn}</div>
      <div className="m">{p.manufacturer}</div>
    </button>
  );
}

function PendingCard({ p, onTip }: { p: Product; onTip: Props["onTip"] }) {
  const show = (e: CardEvent) =>
    onTip({
      anchor: e.currentTarget,
      content: (
        <>
          <b>Planned</b>
          {p.note ?? ""}
        </>
      ),
    });
  const hide = () => onTip(null);
  return (
    <div
      className="pcard pending"
      style={{ "--cat": "var(--cat-prevention)", maxWidth: 340 } as CSSProperties}
      tabIndex={0}
      onMouseEnter={show}
      onFocus={show}
      onMouseLeave={hide}
      onBlur={hide}
    >
      <div className="n">{p.name}</div>
      <div className="i">{`${p.inn ?? ""} · phase placement pending funder approval`}</div>
      <div className="m">{p.manufacturer}</div>
    </div>
  );
}

export function Poster({ edition, tracked, placeholders, onTip }: Props) {
  return (
    <div className="poster" id="poster">
      <div className="phase-arrow">
        <div className="corner"></div>
        {PHASES.map((ph, i) => (
          <div key={ph.key} className={`phase-head ${i === PHASES.length - 1 ? "last" : ""}`}>
            {ph.label}
            <span className="sub">{ph.sub}</span>
          </div>
        ))}
      </div>

      {/* treatment lane */}
      <div className="lane">
        <div className="lane-label">Treatment — uncomplicated malaria</div>
        {PHASES.map((ph) => (
          <div key={ph.key} className="cell">
            {tracked
              .filter((p) => p.phase === ph.key)
              .map((p) => (
                <TrackedCard key={p.id} p={p} edition={edition} onTip={onTip} />
              ))}
          </div>
        ))}
      </div>

      {/* prevention lane (placeholders) — no phase claimed yet, so the card spans the lane */}
      {placeholders.length > 0 && (
        <div className="lane">
          <div className="lane-label">Prevention — vector control</div>
          <div className="cell" style={{ gridColumn: "2 / -1" }}>
            {placeholders.map((p) => (
              <PendingCard key={p.id} p={p} onTip={onTip} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend" id="legend">
      <span className="key">
        <span className="sw" style={{ background: "var(--cat-newclass)" }}></span> New chemical class
      </span>
      <span className="key">
        <span className="sw" style={{ background: "var(--cat-tact)" }}></span> Triple ACT
      </span>
      <span className="key">
        <span className="sw" style={{ background: "var(--cat-market)" }}></span> Marketed, underutilized
      </span>
      <span className="key">
        <span className="sw" style={{ background: "var(--cat-prevention)" }}></span> Prevention (planned)
      </span>
      <span className="key">
        <span className="flagdot"></span> Active bottleneck — see journey board
      </span>
    </div>
  );
}
