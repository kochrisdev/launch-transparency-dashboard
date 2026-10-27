"use client";
import "./option-b.css";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ViewProps } from "@/lib/view";
import { PageLink } from "@/components/PageLink";
import {
  buildTiming,
  downloadCsv,
  formatUpdated,
  metaNote,
  placeholderProducts,
  trackedProducts,
} from "./logic";
import { Matrix } from "./Matrix";
import { Drawer } from "./Drawer";
import { AccessMap } from "./AccessMap";
import { TimingChart } from "./TimingChart";
import { Tooltip, type TipState } from "./Tooltip";

const BANNERS: Record<string, ReactNode> = {
  illustrative: (
    <>
      <b>Design mockup.</b> All statuses, dates, prices and volumes below are illustrative placeholders for layout review — not real
      programme data.
    </>
  ),
  draft: (
    <>
      <b>Draft data.</b> Compiled from public sources and pending LAUNCH team verification and manufacturer written confirmation.
      Unverified values are shown as TBC, never estimated.
    </>
  ),
};

export default function OptionB({ edition, data, map }: ViewProps) {
  const tracked = useMemo(() => trackedProducts(data), [data]);
  const placeholders = useMemo(() => placeholderProducts(data), [data]);
  const timing = useMemo(() => buildTiming(data, tracked), [data, tracked]);
  const status = data.meta.dataStatus;
  const banner = BANNERS[status];
  const flagged = tracked.filter((p) => p.flag);
  const updates = data.changelog || [];

  // ---- product drawer ----
  const [selected, setSelected] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const select = useCallback((id: string | null) => setSelected((cur) => (cur === id ? null : id)), []);
  const close = useCallback(() => setSelected(null), []);
  const selectedProduct = tracked.find((p) => p.id === selected) ?? null;

  useEffect(() => {
    if (!selected) return;
    drawerRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  // ---- shared tooltip ----
  const [tip, setTip] = useState<TipState | null>(null);
  const showTip = useCallback((anchor: Element, content: ReactNode) => setTip({ anchor, content }), []);
  const hideTip = useCallback(() => setTip(null), []);

  return (
    <>
      <div className="band">
        <div className="band-inner">
          <div>
            <h1>
              <em>LAUNCH</em> Transparency Dashboard{" "}
              <span className="proto-badge">Prototype — data presented here may not be accurate</span>
            </h1>
            <p className="sub">
              Design option B — comparison matrix. Every medicine at every gate of the access pathway, side by side.
            </p>
          </div>
          <div className="meta">
            <b>To be hosted by the RBM Partnership to End Malaria</b>
            <br />
            <span id="updated">{formatUpdated(data.meta.lastUpdated)}</span>
            <span id="meta-note">{metaNote(status)}</span>
            <br />
            <PageLink page="index" edition={edition}>
              Journey board (A)
            </PageLink>
            {" · "}
            {/* the synthetic and Unitaid editions have no illustrated journey page */}
            {edition === "main" ? (
              <>
                <PageLink page="illustrated-journey-dashboard" edition={edition}>
                  Illustrated journey
                </PageLink>
                {" · "}
              </>
            ) : null}
            <PageLink page="pipeline" edition={edition}>
              Pipeline poster
            </PageLink>
            {" · "}
            <PageLink page="story" edition={edition}>
              Data story
            </PageLink>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="banner" id="banner" hidden={!banner}>
          {banner}
        </div>

        <div className="strip">
          <div className="stat">
            <span className="n" id="stat-tracked">
              {tracked.length}
            </span>
            <span>medicines tracked</span>
          </div>
          <div className="stat">
            <span className="n crit-n" id="stat-bottlenecks">
              {tracked.filter((p) => p.stages.some((s) => s.status === "late")).length}
            </span>
            <span>active bottlenecks</span>
          </div>
          <div className="stat">
            <span className="n" id="stat-pipeline">
              {tracked.filter((p) => p.class === "pipeline").length}
            </span>
            <span>expected to market ≤ 3 yrs</span>
          </div>
          <div className="legend">
            <span className="key">
              <span className="dot done">✓</span> Complete
            </span>
            <span className="key">
              <span className="dot prog">›</span> In progress
            </span>
            <span className="key">
              <span className="dot late">!</span> Delayed
            </span>
            <span className="key">
              <span className="dot idle"></span> Not started
            </span>
          </div>
          <button className="dl-btn" id="dl-csv" type="button" onClick={() => downloadCsv(data, tracked)}>
            Download CSV
          </button>
        </div>

        <Matrix
          stages={data.stages}
          tracked={tracked}
          selected={selected}
          onSelect={select}
          showTip={showTip}
          hideTip={hideTip}
        />

        <div className="stuck" id="stuck" hidden={!flagged.length}>
          <h2>Where products are stuck right now</h2>
          <ul id="stuck-list">
            {flagged.map((p) => (
              <li key={p.id}>
                <b>{p.name}</b>
                <span>{p.flag}</span>
              </li>
            ))}
          </ul>
        </div>

        <Drawer product={selectedProduct} onClose={close} ref={drawerRef} />

        {map ? <AccessMap map={map} tracked={tracked} showTip={showTip} hideTip={hideTip} /> : null}

        {timing ? <TimingChart timing={timing} showTip={showTip} hideTip={hideTip} /> : null}

        <div className="coming" id="coming" hidden={!placeholders.length}>
          {placeholders.map((p, i) => (
            <Fragment key={p.id}>
              {i > 0 ? <br /> : null}
              <b>{`Coming next: ${p.name} (${p.manufacturer ?? ""})`}</b>
              {" — " + (p.note ?? "")}
            </Fragment>
          ))}
        </div>

        <details className="updates" id="updates" hidden={!updates.length}>
          <summary>Recent updates</summary>
          <ul id="updates-list">
            {updates.slice(0, 8).map((u, i) => (
              <li key={i}>
                <span className="ud">{u.date}</span>
                <span className="up">{u.product}</span>
                <span>{u.change}</span>
              </li>
            ))}
          </ul>
        </details>

        <footer>
          <b>About the data.</b> The LAUNCH dashboard displays publicly available information only. Product-specific details
          (including pricing) appear solely where the manufacturer has confirmed in writing that they may be shared. Hover any status
          dot for detail; select a medicine&apos;s name to open its full profile.
          <br />
          <b>Sources.</b> WHO Guidelines &amp; Prequalification updates · stringent regulatory authority registers · national
          regulatory authorities · Global Fund / PMI procurement data · manufacturer communications. A LAUNCH initiative of Unitaid
          partners.
        </footer>
      </div>

      <Tooltip tip={tip} />
    </>
  );
}
