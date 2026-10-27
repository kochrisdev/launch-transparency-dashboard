import type { LaunchData, Product } from "@/lib/types";

// schema.org structured data for search engines and knowledge-graph crawlers.
// Derived from the data at render time, never stored; @id ties each product to
// its canonical node in ontology/launch-data.jsonld (which carries the ATC and
// Wikidata alignments). Not rendered for synthetic datasets so fictional
// products can never be indexed as real medicines.
const SITE = "https://kochrisdev.github.io/launch-transparency-dashboard";

export function buildJsonLd(data: LaunchData, tracked: Product[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "@id": SITE + "/ontology/launch-data.jsonld#dataset",
        name: "LAUNCH Transparency Dashboard dataset",
        description:
          "Access-pathway status of new antimalarial medicines — stages, milestones, country access and procurement — with public-source provenance on every figure.",
        url: SITE + "/",
        dateModified: data.meta.lastUpdated,
        creativeWorkStatus: data.meta.dataStatus,
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "application/ld+json",
            contentUrl: SITE + "/ontology/launch-data.jsonld",
          },
        ],
      },
      ...tracked.map((p) => ({
        "@type": "Drug",
        "@id": SITE + "/ontology/launch-data.jsonld#product-" + p.id,
        name: p.name,
        nonProprietaryName: p.inn,
        manufacturer: { "@type": "Organization", name: p.manufacturer },
        url: SITE + "/#" + p.id,
      })),
    ],
  };
}

export function JsonLd({ data, tracked }: { data: LaunchData; tracked: Product[] }) {
  return <script type="application/ld+json">{JSON.stringify(buildJsonLd(data, tracked))}</script>;
}
