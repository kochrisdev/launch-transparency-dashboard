// Pure derivations for "The Waiting Years". Every number in the story is
// computed here from the dataset (no hand-typed facts), exactly as the legacy
// story.html IIFE did. "Now" is the dataset's lastUpdated year, not the
// browser clock, so render output is deterministic (hydration-safe).
import type { CountryLevel, LaunchData, Product } from "@/lib/types";

export type VizKey = "poster" | "tl-early" | "tl-gap" | "track" | "flags" | "map" | "next";

export interface StepDef {
  viz: VizKey;
  kicker: string;
  h: string;
  t: string;
}

export interface Gate {
  label: string;
  year: number;
}

export interface StoryModel {
  tracked: Product[];
  hero: Product;
  journey: Gate[];
  nowYear: number;
  firstYear: number | null;
  yearsToRec: number | null;
  yearsWaiting: number | null;
  flagged: Product[];
  pipelineProducts: Product[];
  heroLevels: Record<string, string>;
  countriesUnverified: boolean;
  ganlum: Product | undefined;
  cure: string | undefined;
  cureAnnounced: string;
  steps: StepDef[];
}

const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/** Status → glyph on the stage-dot track. */
export const TRACK_ICON: Record<string, string> = { done: "✓", prog: "›", late: "!", idle: "" };

/** Gap between two gates → segment colour class. */
export function gapClass(gap: number): "good" | "warn" | "crit" {
  return gap <= 2 ? "good" : gap <= 5 ? "warn" : "crit";
}

function countryList(p: Product): CountryLevel[] {
  const list = p.detail?.countries?.list;
  return Array.isArray(list) ? list : [];
}

/** Next not-done milestone of a pipeline product, or "—". */
export function nextMilestone(p: Product): string {
  return (p.detail?.milestones ?? []).find((m) => m.status !== "done")?.milestone || "—";
}

/** Returns null when the dataset has no marketed product for the story to follow. */
export function deriveStory(data: LaunchData): StoryModel | null {
  const tracked = data.products.filter((p) => !p.placeholder);
  const nowYear = parseInt(data.meta.lastUpdated.slice(0, 4), 10);

  const hero = tracked.find((p) => p.id === "pyramax") || tracked.find((p) => p.class === "market");
  if (!hero) return null;

  const journey = (hero.detail?.journey ?? []).filter((g): g is Gate =>
    Number.isInteger(g.year),
  );
  const firstYear = journey.length ? journey[0].year : null;
  const recGate = journey.find((g) => /recommend/i.test(g.label));
  const yearsToRec = recGate && firstYear != null ? recGate.year - firstYear : null;
  const yearsWaiting = firstYear != null ? nowYear - firstYear : null;
  const flagged = tracked.filter((p) => p.flag);
  const pipelineProducts = tracked.filter((p) => p.class === "pipeline");

  const heroLevels: Record<string, string> = {};
  countryList(hero).forEach((e) => (heroLevels[e.iso3] = e.level));
  const countriesStatus = hero.detail?.countries?.status;
  const countriesUnverified = !!hero.detail?.countries && countriesStatus !== "verified";

  const ganlum = tracked.find((p) => p.id === "ganlum");
  const ganlumStage0 = ganlum?.stages?.[0] ?? null;
  const cure = ((ganlumStage0?.note || "").match(/([\d.]+)%/) || [])[1];
  // "Announced 12 Nov 2025" → "announced 12 Nov 2025" for mid-sentence use
  const cureAnnounced = ganlumStage0?.date
    ? ganlumStage0.date.charAt(0).toLowerCase() + ganlumStage0.date.slice(1)
    : "";

  const registered = hero.detail?.country?.registered;

  const steps: StepDef[] = [
    {
      viz: "poster",
      kicker: "The portfolio",
      h: `${WORDS[tracked.length] || tracked.length} medicines, one goal`,
      t: `LAUNCH tracks ${tracked.length} antimalarials: ${pipelineProducts.map((p) => p.name).join(" and ")} coming through the pipeline, and ${flagged.map((p) => p.name).join(" and ")} — already approved, already recommended, and barely used. Follow one of them.`,
    },
    {
      viz: "tl-early",
      kicker: hero.name + " · " + hero.inn,
      h: "The fast part: proving it works",
      t: `${hero.name} cleared the hardest scientific hurdles years ago${firstYear ? " — a stringent regulatory opinion in " + firstYear : ""}, WHO quality prequalification soon after. By the standards of drug development, this was success.`,
    },
    {
      viz: "tl-gap",
      kicker: "Then, nothing",
      h: yearsToRec ? `${yearsToRec} years of waiting` : "The waiting begins",
      t: `${recGate && firstYear ? "From approval in " + firstYear + " to WHO's strong recommendation in " + recGate.year + " took " + yearsToRec + " years." : "The gap between approval and recommendation stretched on."} No new science was needed — the medicine sat in committee calendars and evidence-review queues while resistance to existing drugs spread.`,
    },
    {
      viz: "track",
      kicker: "Why it happens",
      h: "Approved is not available",
      t: "Three separate systems must each say yes — a stringent regulator, WHO's guideline group, WHO's quality team — and then every country must register it, write it into national guidelines, budget for it, and deliver it. Green on the left half of the pathway means nothing to a patient until the right half turns green too.",
    },
    {
      viz: "flags",
      kicker: "Today",
      h: `${flagged.length} products are stuck right now`,
      t: "This is what the dashboard exists to surface: not history, but the current bottleneck for every product, named and dated, so the actor who can fix it knows it's theirs.",
    },
    {
      viz: "map",
      kicker: "The access map",
      h: "The map is mostly blank",
      t: `Where ${hero.name} can actually be used remains a short list${typeof registered === "number" ? " — registered in " + registered + "+ countries" : ""}, and national guideline inclusion is the choke point. (Country coloring is illustrative until the LAUNCH survey is verified.)`,
    },
    {
      viz: "next",
      kicker: "The next arrivals",
      h: "Will the new ones wait too?",
      t: `${ganlum ? ganlum.name + " met its Phase III endpoint" + (cure ? " with a " + cure + "% cure rate" : "") + " — a genuinely new weapon against resistance. " : ""}The pipeline products will hit the exact same gates. Whether they take ${yearsToRec || "ten"} years or two is a choice the malaria community makes — and transparency is how LAUNCH intends to force the question.`,
    },
  ];

  return {
    tracked,
    hero,
    journey,
    nowYear,
    firstYear,
    yearsToRec,
    yearsWaiting,
    flagged,
    pipelineProducts,
    heroLevels,
    countriesUnverified,
    ganlum,
    cure,
    cureAnnounced,
    steps,
  };
}
