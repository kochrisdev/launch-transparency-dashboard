"use client";
import { useState } from "react";
import type { Product, WorldMap } from "@/lib/types";
import { useTipHandlers } from "./Tip";
import { LEVEL_LABEL, countriesOf } from "./logic";

interface Props {
  map: WorldMap;
  tracked: Product[];
}

/** Country access map: one tab per tracked medicine, countries shaded by access level. */
export function AccessMap({ map, tracked }: Props) {
  // default to the first product that has country data
  const [selected, setSelected] = useState(() => (tracked.find((p) => countriesOf(p)) ?? tracked[0])?.id);
  const p = tracked.find((x) => x.id === selected);
  const countries = p ? countriesOf(p) : null;
  const byIso: Record<string, string> = {};
  (countries ? countries.list : []).forEach((e) => (byIso[e.iso3] = e.level));

  const empty = p && !countries
    ? p.class === "pipeline"
      ? p.name + " is pre-launch — no country access yet."
      : "No country-level data yet for " + p.name + "."
    : "";
  const overlayHidden = !countries || countries.status === "verified";
  const overlay = countries ? (countries.status === "illustrative" ? "ILLUSTRATIVE — " : "DRAFT — ") + countries.note : "";

  return (
    <section className="viz" id="mapsec">
      <h2>Country access map</h2>
      <p className="viznote" id="mapnote">
        Where the selected medicine is registered, in national guidelines, and in MFT plans.
      </p>
      <div className="tabs" id="maptabs" role="tablist" aria-label="Select medicine for map">
        {tracked.map((t) => (
          <button
            key={t.id}
            className="tab"
            role="tab"
            data-id={t.id}
            aria-selected={t.id === selected ? "true" : "false"}
            onClick={() => setSelected(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className="mapwrap" id="mapwrap">
        <MapSvg map={map} byIso={byIso} />
        <div className="map-overlay" id="map-overlay" hidden={overlayHidden}>
          {overlay}
        </div>
        {/* .map-empty is display:flex (overrides [hidden]) and covers the map, so it is
            only rendered when there is a message — otherwise it would swallow country hovers */}
        {empty ? (
          <div className="map-empty" id="map-empty">
            {empty}
          </div>
        ) : null}
      </div>
      <div className="map-legend">
        <span className="key">
          <span className="sw" style={{ background: "var(--map1)" }} /> Registered
        </span>
        <span className="key">
          <span className="sw" style={{ background: "var(--map2)" }} /> In national guidelines
        </span>
        <span className="key">
          <span className="sw" style={{ background: "var(--map3)" }} /> In MFT plans
        </span>
        <span className="key">
          <span className="sw" style={{ background: "var(--surface)" }} /> No data
        </span>
      </div>
    </section>
  );
}

function MapSvg({ map, byIso }: { map: WorldMap; byIso: Record<string, string> }) {
  return (
    <svg viewBox={`0 0 ${map.w} ${map.h}`} role="img" aria-label="World map of country access">
      {Object.entries(map.countries).map(([iso3, c]) => (
        <CountryPath key={iso3} iso3={iso3} name={c.n} d={c.d} lvl={byIso[iso3]} />
      ))}
    </svg>
  );
}

function CountryPath({ iso3, name, d, lvl }: { iso3: string; name: string; d: string; lvl?: string }) {
  const tipProps = useTipHandlers();
  const handlers = lvl
    ? tipProps(
        <>
          <b>{name}</b>
          {LEVEL_LABEL[lvl]}
        </>,
      )
    : {};
  return (
    <path
      data-iso3={iso3}
      data-name={name}
      d={d}
      className={lvl ? `lvl-${lvl} haslvl` : ""}
      tabIndex={lvl ? 0 : undefined}
      {...handlers}
    />
  );
}
