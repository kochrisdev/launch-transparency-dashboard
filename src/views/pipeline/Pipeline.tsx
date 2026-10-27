"use client";
import "./pipeline.css";
import { useState } from "react";
import type { ReactNode } from "react";
import type { ViewProps } from "@/lib/view";
import { PageLink } from "@/components/PageLink";
import { Poster, Legend } from "./Poster";
import { Tooltip } from "./Tooltip";
import type { TipState } from "./Tooltip";
import { metaNote, updatedLabel } from "./logic";

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

export default function Pipeline({ edition, data }: ViewProps) {
  const [tip, setTip] = useState<TipState | null>(null);
  const tracked = data.products.filter((p) => !p.placeholder);
  const placeholders = data.products.filter((p) => p.placeholder);
  const status = data.meta.dataStatus;
  const banner = BANNERS[status];

  return (
    <>
      <div className="wrap">
        <header>
          <div className="brand">
            <h1>
              <span>LAUNCH</span>
              {" Pipeline Poster "}
              <span className="proto-badge">Prototype — data presented here may not be accurate</span>
            </h1>
            <p>
              Every tracked product placed at its current development phase — the portfolio at a glance, MMV-poster
              style. Select a product for its full journey.
            </p>
          </div>
          <div className="meta">
            <b>To be hosted by the RBM Partnership to End Malaria</b>
            <br />
            <span id="updated">{updatedLabel(data)}</span>
            <span id="meta-note">{metaNote(status)}</span>
            <br />
            <PageLink page="index" edition={edition}>
              Journey board (A)
            </PageLink>
            {" · "}
            <PageLink page="option-b" edition={edition}>
              Comparison matrix (B)
            </PageLink>
            {" · "}
            {/* the illustrated journey exists in the main edition only; the generators dropped this link elsewhere */}
            {edition === "main" && (
              <>
                <PageLink page="illustrated-journey-dashboard" edition={edition}>
                  Illustrated journey
                </PageLink>
                {" · "}
              </>
            )}
            <PageLink page="story" edition={edition}>
              Data story
            </PageLink>
          </div>
        </header>

        <div className="banner" id="banner" hidden={!banner}>
          {banner}
        </div>

        <div className="poster-box">
          <Poster edition={edition} tracked={tracked} placeholders={placeholders} onTip={setTip} />
          <Legend />
        </div>

        <footer>
          <b>About the data.</b> The LAUNCH dashboard displays publicly available information only. Product-specific
          details appear solely where the manufacturer has confirmed in writing that they may be shared. Hover a card
          for the use case and next milestone; select it to open the full profile on the journey board.
          <br />
          <b>Format.</b> Layout follows the convention of MMV&apos;s antimalarial pipeline poster (phase columns,
          categorised project cards); content is LAUNCH&apos;s own tracked portfolio. A LAUNCH initiative of Unitaid
          partners.
        </footer>
      </div>

      <Tooltip tip={tip} />
    </>
  );
}
