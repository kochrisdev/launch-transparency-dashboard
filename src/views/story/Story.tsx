"use client";
import "./story.css";
import { useRef } from "react";
import type { ViewProps } from "@/lib/view";
import { EDITION_PAGES } from "@/lib/edition";
import { PageLink } from "@/components/PageLink";
import { deriveStory, nextMilestone, type StoryModel, type VizKey } from "./logic";
import { useActiveStep, useCountUp } from "./hooks";
import { Timeline } from "./Timeline";
import { StageTrack } from "./StageTrack";
import { StoryMap } from "./StoryMap";

function Banner({ status, failed }: { status: string; failed: boolean }) {
  if (failed) {
    return (
      <div className="banner error" id="banner">
        <b>Data failed to load.</b> No marketed product found in data/products.js for the story to
        follow — run <code>node scripts/validate-data.js</code>.
      </div>
    );
  }
  if (status === "illustrative") {
    return (
      <div className="banner" id="banner">
        <b>Design mockup.</b> All values below are illustrative placeholders — not real programme data.
      </div>
    );
  }
  if (status === "draft") {
    return (
      <div className="banner" id="banner">
        <b>Draft data.</b> Compiled from public sources, pending LAUNCH verification. Unverified values
        are TBC, never estimated.
      </div>
    );
  }
  return <div className="banner" id="banner" hidden></div>;
}

function Layer({ viz, on, children }: { viz: VizKey; on: boolean; children: React.ReactNode }) {
  return (
    <div className={on ? "layer on" : "layer"} data-viz={viz}>
      {children}
    </div>
  );
}

function Stage({ m, data, map, viz }: { m: StoryModel; data: ViewProps["data"]; map: ViewProps["map"]; viz: VizKey }) {
  const { hero, journey, nowYear } = m;
  const years = useCountUp(m.yearsToRec || 0, viz === "tl-gap");
  return (
    <>
      <Layer viz="poster" on={viz === "poster"}>
        <div className="panel">
          <div className="mini-cards">
            {m.tracked.map((p) => (
              <div key={p.id} className={`mcard ${p.class === "market" ? "market" : ""}`}>
                <b>{p.name}</b>
                <span className="s">{p.inn}</span>
                <span className="s">{p.classLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </Layer>

      <Layer viz="tl-early" on={viz === "tl-early"}>
        <div className="bignum good">{m.firstYear || "—"}</div>
        <div className="biglbl">{`${hero.name} approved by a stringent regulator. Science: done.`}</div>
        <div className="panel">
          <Timeline journey={journey} nowYear={nowYear} dim="dim-late" />
        </div>
      </Layer>

      <Layer viz="tl-gap" on={viz === "tl-gap"}>
        <div className="bignum crit" data-count={m.yearsToRec || 0}>
          {years}
          <span className="unit"> years</span>
        </div>
        <div className="biglbl">
          {`from regulatory approval to WHO's strong recommendation${
            m.yearsWaiting ? " — and " + m.yearsWaiting + " years on, broad national adoption is still pending" : ""
          }.`}
        </div>
        <div className="panel">
          <Timeline journey={journey} nowYear={nowYear} dim="dim-early" />
        </div>
      </Layer>

      <Layer viz="track" on={viz === "track"}>
        <StageTrack hero={hero} stageNames={data.stages} />
      </Layer>

      <Layer viz="flags" on={viz === "flags"}>
        <div className="bignum crit">{m.flagged.length}</div>
        <div className="biglbl">active bottlenecks on the board today</div>
        {m.flagged.map((p) => (
          <div className="flagcard" key={p.id}>
            <b>{p.name}</b>
            <p>{`▲ ${p.flag}`}</p>
          </div>
        ))}
      </Layer>

      <Layer viz="map" on={viz === "map"}>
        <div className="panel">
          {map && <StoryMap map={map} levels={m.heroLevels} unverified={m.countriesUnverified} />}
          <div className="biglbl" style={{ marginTop: 12 }}>
            {`${hero.name}: registered (light) → in national guidelines (medium) → in MFT plans (dark).`}
          </div>
        </div>
      </Layer>

      <Layer viz="next" on={viz === "next"}>
        {/* cure-rate headline only when the figure is present in the data */}
        {m.cure ? (
          <>
            <div className="bignum good">
              {m.cure}
              <span className="unit"> %</span>
            </div>
            <div className="biglbl">
              {`PCR-corrected cure rate in ${m.ganlum ? m.ganlum.name : "the lead candidate"}'s Phase III trial (KALUMA${
                m.cureAnnounced ? ", " + m.cureAnnounced : ""
              }).`}
            </div>
          </>
        ) : (
          <div className="biglbl">The next medicines are moving through late-stage trials and regulatory review.</div>
        )}
        <div className="panel">
          <div className="mini-cards">
            {m.pipelineProducts.map((p) => (
              <div className="mcard" key={p.id}>
                <b>{p.name}</b>
                <span className="s">{p.inn}</span>
                <span className="s">{`Next: ${nextMilestone(p)}`}</span>
              </div>
            ))}
          </div>
        </div>
      </Layer>
    </>
  );
}

export default function Story({ edition, data, map }: ViewProps) {
  const m = deriveStory(data);
  const steps = m?.steps ?? [];
  const stepsRef = useRef<HTMLDivElement>(null);
  const active = useActiveStep(stepsRef, steps.length);
  const viz = steps[active]?.viz ?? "poster";
  const hasIllustrated = EDITION_PAGES[edition].includes("illustrated-journey-dashboard");

  return (
    <>
      <div className="top">
        <span className="mark">LAUNCH</span>
        <span className="proto">Prototype — data presented here may not be accurate</span>
        <span className="spacer"></span>
        <PageLink page="index" edition={edition}>Journey board (A)</PageLink>{" "}
        <PageLink page="option-b" edition={edition}>Comparison matrix (B)</PageLink>
        {hasIllustrated && (
          <PageLink page="illustrated-journey-dashboard" edition={edition}>Illustrated journey</PageLink>
        )}
        <PageLink page="pipeline" edition={edition}>Pipeline poster</PageLink>
      </div>

      <div className="hero">
        <h1>
          The <em>waiting</em> years
        </h1>
        <p>
          {"New malaria medicines exist. Getting them approved is no longer the hard part — getting them "}
          <b>used</b>
          {" is. This is the story the LAUNCH dashboard tracks, told through one medicine that has been ready for over a decade."}
        </p>
        <p className="scrollhint">Scroll ↓</p>
      </div>
      <Banner status={data.meta.dataStatus} failed={!m} />

      <div className="scrolly">
        <div className="steps" id="steps" ref={stepsRef}>
          {steps.map((s, i) => (
            <article className={i === active ? "step active" : "step"} data-i={i} key={s.viz}>
              <div className="card">
                <div className="kicker">{s.kicker}</div>
                <h2>{s.h}</h2>
                <p>{s.t}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="stage">
          <div className="stage-inner" id="stageInner">
            {m && <Stage m={m} data={data} map={map} viz={viz} />}
          </div>
        </div>
      </div>

      <div className="cta">
        <div className="panel">
          <h2>Watch the whole board, not one story</h2>
          <p>
            LAUNCH tracks every gate for every product — with a red flag and a dated reason wherever one is stuck —
            so donors, ministries, manufacturers and WHO can act on delays instead of discovering them years later.
          </p>
          <div className="links">
            <PageLink page="index" edition={edition}>Open the journey board (A)</PageLink>
            <PageLink className="ghost" page="option-b" edition={edition}>Comparison matrix (B)</PageLink>
            <PageLink className="ghost" page="pipeline" edition={edition}>Pipeline poster</PageLink>
          </div>
        </div>
      </div>

      <footer>
        <b>About the data.</b> Publicly available information only; product details appear solely where the
        manufacturer confirmed release in writing. Country coloring on the map is an illustrative subset pending the
        verified LAUNCH country survey. A LAUNCH initiative of Unitaid partners, to be hosted by the RBM Partnership
        to End Malaria.
      </footer>
    </>
  );
}
