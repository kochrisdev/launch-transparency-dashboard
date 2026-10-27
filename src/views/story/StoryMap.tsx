import type { WorldMap } from "@/lib/types";

/** Choropleth of the hero product's country access levels. */
export function StoryMap({
  map,
  levels,
  unverified,
}: {
  map: WorldMap;
  levels: Record<string, string>;
  unverified: boolean;
}) {
  return (
    <div className="storymap">
      <svg viewBox={`0 0 ${map.w} ${map.h}`} role="img" aria-label="Country access map">
        {Object.entries(map.countries).map(([iso, c]) => (
          <path key={iso} className={levels[iso] ? "lvl-" + levels[iso] : ""} d={c.d}></path>
        ))}
      </svg>
      {unverified && <div className="ovl">ILLUSTRATIVE — pending verified country survey</div>}
    </div>
  );
}
