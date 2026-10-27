// Editions replace the old generator scripts (build-synthetic-edition.js,
// build-unitaid-theme.js). Each page component takes an `edition` prop and
// renders the same UI; the edition decides the dataset, the URL prefix, the
// title suffix and the extra chrome/skin.
export type Edition = "main" | "synthetic" | "unitaid";

export const EDITIONS: Record<
  Edition,
  { prefix: string; dataFile: string; titleSuffix: string }
> = {
  main: { prefix: "", dataFile: "data/products.js", titleSuffix: "" },
  synthetic: {
    prefix: "synthetic/",
    dataFile: "data/products.synthetic.js",
    titleSuffix: " · Synthetic Data",
  },
  unitaid: {
    prefix: "unitaid/",
    dataFile: "data/products.js",
    titleSuffix: " · Unitaid Brand",
  },
};

/** Pages that exist in each edition (mirrors the old generator PAGES lists). */
export type PageKey =
  | "index"
  | "option-b"
  | "illustrated-journey-dashboard"
  | "pipeline"
  | "story"
  | "explainer"
  | "widget";

export const EDITION_PAGES: Record<Edition, PageKey[]> = {
  main: ["index", "option-b", "illustrated-journey-dashboard", "pipeline", "story", "explainer", "widget"],
  synthetic: ["index", "option-b", "pipeline", "story", "widget"],
  unitaid: ["index", "option-b", "pipeline", "story"],
};
