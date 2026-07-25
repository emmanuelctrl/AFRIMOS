import type { Variants, Transition } from 'framer-motion';

/** Shared easing curve — calm, premium, never bouncy. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const transition = (duration = 0.7, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE,
});

/** Fade + rise, the default reveal for section content. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: transition() },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition(0.9) },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: transition(0.8) },
};

/** Cinematic 3D reveal — content rotates up into the viewport. */
export const perspectiveReveal: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: 12, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: transition(0.9),
  },
};

/** Parent container that staggers its children. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

/** Viewport config used by every scroll-triggered section. */
export const viewportOnce = { once: true, amount: 0.25 } as const;
