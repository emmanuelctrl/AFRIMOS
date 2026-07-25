import { useEffect } from 'react';
import Lenis from 'lenis';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Inertial smooth scrolling. Skipped entirely under reduced-motion so the
 * native scroll behaviour stays intact.
 */
export function useSmoothScroll(enabled = true) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!enabled || reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [enabled, reduced]);
}
