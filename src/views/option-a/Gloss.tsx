"use client";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { GlossPiece } from "./logic";
import { useTipHandlers } from "./Tip";

// Inline glossary terms (dotted underline + tooltip definition).

interface GlossApi {
  glossary: Record<string, string>;
  split: (text: string, seen: Set<string>) => GlossPiece[];
}
export const GlossContext = createContext<GlossApi>({ glossary: {}, split: (t) => [t] });

export function Gloss({ term }: { term: string }) {
  const { glossary } = useContext(GlossContext);
  const tipProps = useTipHandlers();
  return (
    <span
      className="gloss"
      tabIndex={0}
      data-term={term}
      {...tipProps(
        <>
          <b>{term}</b>
          {glossary[term]}
        </>,
      )}
    >
      {term}
    </span>
  );
}

/**
 * Returns g(text): the text with the first occurrence (per `seen` set) of
 * each glossary term wrapped in <Gloss>. Call g() in document order — that is
 * what makes "first occurrence per product" match the legacy text walk.
 */
export function useGlosser(seen: Set<string>) {
  const { split } = useContext(GlossContext);
  return function g(text: unknown): ReactNode {
    const s = text == null ? "" : String(text);
    const pieces = split(s, seen);
    if (pieces.length === 1 && typeof pieces[0] === "string") return pieces[0];
    return pieces.map((p, i) => (typeof p === "string" ? p : <Gloss key={i} term={p.term} />));
  };
}
