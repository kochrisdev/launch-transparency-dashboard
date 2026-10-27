"use client";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/** What the shared #tip shows, and the element it is anchored to. */
export interface TipState {
  anchor: Element;
  content: ReactNode;
}

export type ShowTip = (anchor: Element, content: ReactNode) => void;

/**
 * The single fixed-position tooltip (#tip). Positioned above the anchor,
 * centred and clamped to the viewport; flips below when there is no room —
 * same geometry as the legacy showTipAt().
 */
export function Tooltip({ tip }: { tip: TipState | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!tip || !el) return;
    const r = tip.anchor.getBoundingClientRect();
    const tw = el.offsetWidth;
    const th = el.offsetHeight;
    let x = r.left + r.width / 2 - tw / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
    let y = r.top - th - 10;
    if (y < 8) y = r.bottom + 10;
    setPos({ left: x, top: y });
  }, [tip]);

  return (
    <div
      id="tip"
      role="tooltip"
      ref={ref}
      style={{
        display: tip ? "block" : "none",
        left: pos ? pos.left + "px" : undefined,
        top: pos ? pos.top + "px" : undefined,
      }}
    >
      {tip?.content}
    </div>
  );
}
