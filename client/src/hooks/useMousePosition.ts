import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion';

export interface PointerState {
  /** Normalised -1..1 across the viewport, spring-smoothed. */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** Raw client coordinates in pixels, spring-smoothed. */
  clientX: MotionValue<number>;
  clientY: MotionValue<number>;
}

/**
 * Viewport pointer position as spring-smoothed motion values. Motion values
 * update outside React's render cycle, so consumers never re-render on move.
 */
export function useMousePosition(enabled = true): PointerState {
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  const spring = { stiffness: 120, damping: 20, mass: 0.4 };
  const x = useSpring(nx, spring);
  const y = useSpring(ny, spring);
  const clientX = useSpring(cx, spring);
  const clientY = useSpring(cy, spring);

  const raf = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        nx.set((event.clientX / window.innerWidth) * 2 - 1);
        ny.set((event.clientY / window.innerHeight) * 2 - 1);
        cx.set(event.clientX);
        cy.set(event.clientY);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled, nx, ny, cx, cy]);

  return { x, y, clientX, clientY };
}
