"use client";
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent, MouseEvent, ReactNode } from "react";

// Shared floating tooltip (#tip). Anything on the page can show it anchored to
// an element; it is positioned above the anchor (or below if there's no room),
// clamped to the viewport — same geometry as the legacy showTipAt().

interface TipState {
  anchor: Element;
  content: ReactNode;
}
interface TipApi {
  show: (anchor: Element, content: ReactNode) => void;
  hide: () => void;
}

const TipContext = createContext<TipApi>({ show: () => {}, hide: () => {} });

export function useTip(): TipApi {
  return useContext(TipContext);
}

/** Props that show `content` on hover/focus and hide it on leave/blur. */
export function useTipHandlers() {
  const tip = useTip();
  return useCallback(
    (content: ReactNode | (() => ReactNode)) => {
      const show = (e: MouseEvent<Element> | FocusEvent<Element>) =>
        tip.show(e.currentTarget, typeof content === "function" ? (content as () => ReactNode)() : content);
      return { onMouseEnter: show, onFocus: show, onMouseLeave: tip.hide, onBlur: tip.hide };
    },
    [tip],
  );
}

export function TipProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TipState | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const api = useMemo<TipApi>(
    () => ({
      show: (anchor, content) => setState({ anchor, content }),
      hide: () => setState(null),
    }),
    [],
  );

  useLayoutEffect(() => {
    const tip = ref.current;
    if (!tip || !state) return;
    const r = state.anchor.getBoundingClientRect();
    const tw = tip.offsetWidth,
      th = tip.offsetHeight;
    let x = r.left + r.width / 2 - tw / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
    let y = r.top - th - 10;
    if (y < 8) y = r.bottom + 10;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }, [state]);

  return (
    <TipContext.Provider value={api}>
      {children}
      <div id="tip" role="tooltip" ref={ref} style={state ? { display: "block" } : undefined}>
        {state?.content}
      </div>
    </TipContext.Provider>
  );
}
