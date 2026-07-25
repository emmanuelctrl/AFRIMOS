import { useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Magnetic cursor attraction: the element drifts toward the pointer while it
 * hovers, then springs home on leave. Disabled under reduced-motion.
 */
export function useMagnetic<T extends HTMLElement = HTMLButtonElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 260, damping: 18, mass: 0.6 };
  const x = useSpring(mx, spring);
  const y = useSpring(my, spring);

  const onPointerMove = (event: ReactPointerEvent<T>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    my.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return { ref, x, y, onPointerMove, onPointerLeave };
}
