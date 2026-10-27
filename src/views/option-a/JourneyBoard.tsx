"use client";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { ViewProps } from "@/lib/view";
import type { Edition, PageKey } from "@/lib/edition";
import { EDITION_PAGES } from "@/lib/edition";
import { PageLink } from "@/components/PageLink";
import { asset } from "@/lib/paths";
import { GlossContext } from "./Gloss";
import { TipProvider } from "./Tip";
import { AccessMap } from "./AccessMap";
import { TimingChart } from "./TimingChart";
import { PlaceholderRow, ProductRow, StageIcon } from "./ProductRow";
import type { BoardVariant } from "./ProductRow";
import { buildCsv, buildTiming, createGlosser, formatUpdated, metaNote, summaryStats, trackedProducts } from "./logic";
import { JsonLd } from "./JsonLd";

// The journey board (legacy index.html, "Option A") and its illustrated
// variant (illustrated-journey-dashboard.html) share everything but the stage
// markers, the pathway strip, a legend key, the subtitle and the header links.
// Each variant's stylesheet is imported by its own view file, not here.

interface Props extends ViewProps {
  variant: BoardVariant;
}

const BANNERS: Record<string, ReactNode> = {
  illustrative: (
    <>
      <b>Design mockup.</b> All statuses, dates, prices and volumes below are illustrative placeholders for layout
      review — not real programme data.
    </>
  ),
  draft: (
    <>
      <b>Draft data.</b> Compiled from public sources and pending LAUNCH team verification and manufacturer written
      confirmation. Unverified values are shown as TBC, never estimated.
    </>
  ),
};

const linkStyle = { color: "var(--accent)" };

function HeaderLinks({ edition, variant }: { edition: Edition; variant: BoardVariant }) {
  const has = (p: PageKey) => EDITION_PAGES[edition].includes(p);
  const links: { key: string; node: ReactNode }[] = [];
  const add = (page: PageKey, label: string, ed: Edition = edition) =>
    links.push({
      key: page + ed,
      node: (
        <PageLink page={page} edition={ed} style={linkStyle}>
          {label}
        </PageLink>
      ),
    });
  if (variant === "illustrated") add("index", "Journey board (A)");
  add("option-b", "Comparison matrix (B)");
  if (variant === "classic" && has("illustrated-journey-dashboard")) add("illustrated-journey-dashboard", "Illustrated journey");
  add("pipeline", "Pipeline poster");
  add("story", "Data story");
  if (edition === "main") add("index", "Unitaid brand preview", "unitaid");
  else if (edition === "unitaid") add("index", "LAUNCH brand original", "main");
  return (
    <>
      {links.map((l, i) => (
        <Fragment key={l.key}>
          {i > 0 ? " · " : null}
          {l.node}
        </Fragment>
      ))}
    </>
  );
}

export function JourneyBoard({ edition, data, map, variant }: Props) {
  const tracked = useMemo(() => trackedProducts(data), [data]);
  const placeholders = useMemo(() => data.products.filter((p) => p.placeholder), [data]);
  const stats = summaryStats(tracked);
  const timing = useMemo(() => buildTiming(data, tracked), [data, tracked]);
  const status = data.meta.dataStatus;
  const glossary = data.glossary || {};
  const glossTerms = Object.keys(glossary);
  const gloss = useMemo(() => ({ glossary: data.glossary || {}, split: createGlosser(data.glossary || {}) }), [data]);
  const updates = data.changelog || [];

  // expanded product rows
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const toggle = useCallback(
    (id: string) =>
      setOpen((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [],
  );

  // print: open every panel so the printout is complete
  const updatesRef = useRef<HTMLDetailsElement>(null);
  const glossaryRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const onPrint = () => {
      if (updatesRef.current) updatesRef.current.open = true;
      if (glossaryRef.current) glossaryRef.current.open = true;
    };
    window.addEventListener("beforeprint", onPrint);
    return () => window.removeEventListener("beforeprint", onPrint);
  }, []);

  // CSV download — stages and milestones for every tracked product
  const downloadCsv = () => {
    const blob = new Blob([buildCsv(data, tracked)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "launch-dashboard-data-" + data.meta.lastUpdated + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <TipProvider>
      <GlossContext.Provider value={gloss}>
        {!data.meta.synthetic ? <JsonLd data={data} tracked={tracked} /> : null}
        <div className="wrap">
          <header>
            <div className="brand">
              <h1>
                <span>LAUNCH</span> Transparency Dashboard{" "}
                <span className="proto-badge">Prototype — data presented here may not be accurate</span>
              </h1>
              <p>
                {/* one text node, so text shaping matches the original exactly */}
                {(variant === "illustrated" ? "Illustrated journey view — tracking" : "Tracking") +
                  " new antimalarial medicines from approval to access — where each product stands, and where it is stuck."}
              </p>
            </div>
            <div className="meta">
              <b id="host-note">To be hosted by the RBM Partnership to End Malaria</b>
              <br />
              <span id="updated">{"Last updated " + formatUpdated(data.meta.lastUpdated)}</span>
              <span id="meta-note">{metaNote(status)}</span>
              <br />
              <HeaderLinks edition={edition} variant={variant} />
            </div>
          </header>

          <div className="demo-banner" id="banner" hidden={!BANNERS[status]}>
            {BANNERS[status]}
          </div>

          <div className="strip" role="group" aria-label="Summary">
            <div className="stat">
              <span className="n" id="stat-tracked">{stats.tracked}</span>
              <span className="l">medicines tracked</span>
            </div>
            <div className="stat">
              <span className="n crit-n" id="stat-bottlenecks">{stats.bottlenecks}</span>
              <span className="l">active bottlenecks</span>
            </div>
            <div className="stat">
              <span className="n" id="stat-pipeline">{stats.pipeline}</span>
              <span className="l">expected to market ≤ 3 yrs</span>
            </div>
            <div className="legend" aria-label="Status legend">
              <span className="key">
                <span className="dot done" aria-hidden="true">✓</span> Complete
              </span>
              <span className="key">
                <span className="dot prog" aria-hidden="true">›</span> In progress
              </span>
              <span className="key">
                <span className="dot late" aria-hidden="true">!</span> Delayed / bottleneck
              </span>
              {variant === "illustrated" ? (
                <span className="key">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset("assets/journey-icons/04-who-prequalification.svg")}
                    alt=""
                    aria-hidden="true"
                    style={{ width: 18, height: 18, filter: "grayscale(1)", opacity: 0.4, verticalAlign: -4 }}
                  />{" "}
                  Not started (icon grayed)
                </span>
              ) : (
                <span className="key">
                  <span className="dot idle" aria-hidden="true" /> Not started
                </span>
              )}
            </div>
            <button className="dl-btn" id="dl-csv" type="button" onClick={downloadCsv}>
              Download CSV
            </button>
          </div>

          {variant === "illustrated" ? (
            <div
              className="pathway"
              id="pathway"
              role="img"
              aria-label="The eight-stage access pathway, from research and development to in-country delivery"
            >
              {data.stages.map((s, i) => (
                <Fragment key={i}>
                  {i > 0 ? (
                    <span className="patharrow" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                  <div className="pathnode">
                    <StageIcon index={i} className="" />
                    <span>{s}</span>
                  </div>
                </Fragment>
              ))}
            </div>
          ) : null}

          <div className="board" id="board">
            {tracked.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                stages={data.stages}
                dataStatus={status}
                variant={variant}
                open={open.has(p.id)}
                onToggle={toggle}
              />
            ))}
            {placeholders.map((p) => (
              <PlaceholderRow key={p.id} product={p} />
            ))}
          </div>

          {map ? <AccessMap map={map} tracked={tracked} /> : null}

          {timing ? <TimingChart timing={timing} /> : null}

          <details className="updates" id="updates" hidden={!updates.length} ref={updatesRef}>
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

          <details className="updates glossary-panel" id="glossary" hidden={!glossTerms.length} ref={glossaryRef}>
            <summary>Definitions</summary>
            <ul id="glossary-list">
              {[...glossTerms].sort().map((t) => (
                <li key={t}>
                  <span className="gt">{t}</span>
                  <span>{glossary[t]}</span>
                </li>
              ))}
            </ul>
          </details>

          <footer>
            <b>About the data.</b> The LAUNCH dashboard displays publicly available information only. Product-specific
            details (including pricing) appear solely where the manufacturer has confirmed in writing that they may be
            shared. Hover any stage for status detail; select a medicine to open its full profile.
            <br />
            <b>Sources.</b> WHO Guidelines &amp; Prequalification updates · stringent regulatory authority registers ·
            national regulatory authorities · Global Fund / PMI procurement data · manufacturer communications. A LAUNCH
            initiative of Unitaid partners, hosted on RBM dashboards.
          </footer>
        </div>
      </GlossContext.Provider>
    </TipProvider>
  );
}
