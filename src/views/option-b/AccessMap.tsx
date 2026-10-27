"use client";
import { memo, useMemo, useState, type FocusEvent, type MouseEvent } from "react";
import type { WorldMap } from "@/lib/types";
import { countryAccess, LEVEL_LABEL, type TrackedProduct } from "./logic";
import type { ShowTip } from "./Tooltip";

interface Props {
  map: WorldMap;
  tracked: TrackedProduct[];
  showTip: ShowTip;
  hideTip: () => void;
}

/** Country access map with one tab per tracked medicine. */
export function AccessMap({ map, tracked, showTip, hideTip }: Props) {
  const [mapId, setMapId] = useState<string>(() => (tracked.find((p) => countryAccess(p)) ?? tracked[0])?.id ?? "");
  const p = tracked.find((x) => x.id === mapId) ?? tracked[0];
  const access = useMemo(() => (p ? countryAccess(p) : null), [p]);

  const byIso = useMemo(() => {
    const out: Record<string, string> = {};
    (access?.list ?? []).forEach((e) => (out[e.iso3] = e.level));
    return out;
  }, [access]);

  let emptyText = "";
  if (p && !access)
    emptyText = p.class === "pipeline" ? p.name + " is pre-launch — no country access yet." : "No country-level data yet for " + p.name + ".";
  const overlayHidden = !access || access.status === "verified";
  const overlayText = access ? (access.status === "illustrative" ? "ILLUSTRATIVE — " : "DRAFT — ") + access.note : "";

  return (
    <section className="viz" id="mapsec">
      <h2>Country access map</h2>
      <p className="viznote">Where the selected medicine is registered, in national guidelines, and in MFT plans.</p>
      <div className="tabs" id="maptabs" role="tablist" aria-label="Select medicine for map">
        {tracked.map((t) => (
          <button
            key={t.id}
            className="tabbtn"
            role="tab"
            data-id={t.id}
            aria-selected={t.id === p?.id ? "true" : "false"}
            onClick={() => setMapId(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className="mapwrap" id="mapwrap">
        <MapSvg map={map} byIso={byIso} showTip={showTip} hideTip={hideTip} />
        <div className="map-overlay" id="map-overlay" hidden={overlayHidden}>
          {overlayHidden ? "" : overlayText}
        </div>
        <div className="map-empty" id="map-empty" hidden={!!access}>
          {emptyText}
        </div>
      </div>
      <div className="map-legend">
        <span className="key">
          <span className="sw" style={{ background: "var(--map1)" }}></span> Registered
        </span>
        <span className="key">
          <span className="sw" style={{ background: "var(--map2)" }}></span> In national guidelines
        </span>
        <span className="key">
          <span className="sw" style={{ background: "var(--map3)" }}></span> In MFT plans
        </span>
        <span className="key">
          <span className="sw" style={{ background: "var(--surface)" }}></span> No data
        </span>
      </div>
    </section>
  );
}

interface SvgProps {
  map: WorldMap;
  byIso: Record<string, string>;
  showTip: ShowTip;
  hideTip: () => void;
}

const MapSvg = memo(function MapSvg({ map, byIso, showTip, hideTip }: SvgProps) {
  return (
    <svg viewBox={`0 0 ${map.w} ${map.h}`} role="img" aria-label="World map of country access">
      {Object.entries(map.countries).map(([iso3, c]) => {
        const lvl = byIso[iso3];
        const show = (e: MouseEvent<SVGPathElement> | FocusEvent<SVGPathElement>) => {
          if (lvl)
            showTip(
              e.currentTarget,
              <>
                <b>{c.n}</b>
                {LEVEL_LABEL[lvl]}
              </>,
            );
        };
        return (
          <path
            key={iso3}
            data-iso3={iso3}
            data-name={c.n}
            d={c.d}
            className={lvl ? "lvl-" + lvl + " haslvl" : ""}
            tabIndex={lvl ? 0 : undefined}
            onMouseEnter={show}
            onFocus={show}
            onMouseLeave={hideTip}
            onBlur={hideTip}
          />
        );
      })}
    </svg>
  );
});
