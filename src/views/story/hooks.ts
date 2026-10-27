import { useEffect, useState, type RefObject } from "react";

/**
 * Index of the scroll step currently crossing the middle band of the viewport
 * (IntersectionObserver with a -45% top/bottom root margin, as in the legacy
 * page). Starts at 0; without IntersectionObserver it simply stays at 0.
 */
export function useActiveStep(container: RefObject<HTMLElement | null>, count: number): number {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const root = container.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".step"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(parseInt((e.target as HTMLElement).dataset.i ?? "0", 10));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [container, count]);
  return active;
}

/**
 * Count from 0 up to `target` once `start` first becomes true (≈700 ms total),
 * or jump straight to the target under prefers-reduced-motion. Never restarts.
 */
export function useCountUp(target: number, start: boolean): number {
  const [value, setValue] = useState(0);
  // latch: once started, scrolling away must not stop or restart the count
  const [started, setStarted] = useState(false);
  if (start && !started) setStarted(true);
  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !target) {
      setValue(target);
      return;
    }
    let v = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      v++;
      setValue(v);
      if (v < target) timer = setTimeout(tick, 700 / target);
    };
    tick();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [started, target]);
  return value;
}
