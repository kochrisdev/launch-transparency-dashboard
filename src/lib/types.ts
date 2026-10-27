// Types for the dashboard dataset (data/products.js, data/products.synthetic.js)
// and the generated world map (data/world-map.js). The data files remain the
// single source of truth — these types describe them; they do not replace them.
// Fields that are optional or polymorphic in the real files are typed as such.

export type StageStatus = string; // e.g. "complete" | "moving" | "stuck" | "idle" | "na"

export interface Meta {
  lastUpdated: string;
  dataStatus: "illustrative" | "draft" | "live" | string;
  host: string;
  synthetic?: boolean;
}

export interface Stage {
  status: StageStatus;
  note?: string;
  date?: string;
  next?: string;
  nextDate?: string;
  source?: string;
  asOf?: string;
}

export interface Price {
  value: string;
  note?: string;
  source?: string;
  confirmedInWriting?: boolean;
  asOf?: string;
}

export interface Research {
  lead?: string;
  geographies?: string;
  timeline?: string;
  question?: string;
}

export interface CountrySummary {
  registered: number | string;
  inGuidelines: number | string;
  inMft: number | string;
  forecastDemand?: string;
}

export interface CountryLevel {
  iso3: string;
  level: string;
}

export interface VolumeChannel {
  channel: string;
  pct: number;
}

export interface Milestone {
  milestone: string;
  status: string;
  label?: string;
  date?: string;
  next?: string;
  anticipated?: string;
  source?: string;
}

export interface JourneyPoint {
  label: string;
  year: number | string;
}

export interface ProductDetail {
  price?: Price;
  useCase?: string;
  access?: string[];
  adoption?: string[];
  research?: Research;
  country?: CountrySummary;
  /** keyed by year or label; values are a note string or channel split */
  volume?: Record<string, string | VolumeChannel[]> | null;
  volumeNote?: string;
  milestones?: Milestone[];
  /** keyed by category; values are a note string or per-country levels */
  countries?: Record<string, string | CountryLevel[]>;
  journey?: JourneyPoint[];
  [key: string]: unknown;
}

export interface Product {
  id: string;
  name: string;
  inn?: string;
  manufacturer?: string;
  class?: string;
  classLabel?: string;
  phase?: string;
  currentStage?: number;
  flag?: string | null;
  stages?: Stage[];
  detail?: ProductDetail;
  placeholder?: boolean;
  note?: string;
  [key: string]: unknown;
}

export interface ChangelogEntry {
  date: string;
  product: string;
  change: string;
}

export interface LaunchData {
  meta: Meta;
  stages: string[];
  glossary: Record<string, string>;
  changelog: ChangelogEntry[];
  products: Product[];
}

export interface WorldMap {
  w: number;
  h: number;
  countries: Record<string, { n: string; d: string }>;
  [key: string]: unknown;
}
