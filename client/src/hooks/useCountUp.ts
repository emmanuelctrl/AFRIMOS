import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface Options {
  duration?: number;
  decimals?: number;
}

/**
 * Counts from 0 to `target` once the element scrolls into view.
 * Respects reduced-motion by snapping straight to the final value.
 */
export function useCountUp(target: number, { duration = 1800, decimals = 0 }: Options = {}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    // easeOutExpo — fast start, gentle settle
    const ease = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(target * ease(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration, reduced]);

  return { ref, value: Number(value.toFixed(decimals)) };
}
