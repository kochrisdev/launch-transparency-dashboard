"use client";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface TipState {
  /** the card the tooltip is anchored to */
  anchor: HTMLElement;
  content: ReactNode;
}

/**
 * Fixed-position tooltip (#tip). Centred above the anchor, clamped to the
 * viewport; flips below when there is no room above — same maths as the
 * legacy showTipAt().
 */
export function Tooltip({ tip }: { tip: TipState | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!tip || !el) {
      setPos(null);
      return;
    }
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
      style={tip ? { display: "block", left: pos?.left, top: pos?.top } : undefined}
    >
      {tip?.content}
    </div>
  );
}
