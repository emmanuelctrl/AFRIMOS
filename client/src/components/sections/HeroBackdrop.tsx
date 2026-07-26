import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * The hero photograph, on every device and in every state.
 *
 * There is no generated fallback behind this any more: the photo is the hero.
 * `public/hero-port.jpg` ships with the app, and VITE_HERO_IMAGE swaps it for
 * another URL without a code change.
 */
const SRC = import.meta.env.VITE_HERO_IMAGE || '/hero-port.jpg';

export function HeroBackdrop() {
  const reduced = usePrefersReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-base-900">
      {/* Graded ground under the photograph. If the image is ever slow or
          missing, the hero reads as deliberately dark rather than broken. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_35%,#17303D_0%,#0A141A_70%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ opacity: { duration: 1.2 }, scale: { duration: 14, ease: 'easeOut' } }}
        className="absolute inset-0"
      >
        <img
          src={SRC}
          alt=""
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover"
          // The frame puts cargo on one side and open yard on the other;
          // biasing right keeps the busy half away from the headline column.
          style={{ objectPosition: '70% center' }}
        />
      </motion.div>

      {/* Slow drift keeps a still photograph from feeling static */}
      {!reduced && (
        <motion.div
          animate={{ opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 bg-gradient-to-tr from-electric-700/25 via-transparent to-transparent"
        />
      )}

      {/* Grade the photo toward the site's night palette, with a cream haze
          along the horizon so the blues never go cold. */}
      <div className="absolute inset-0 bg-base-900/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cream-200/[0.06] to-transparent" />
    </div>
  );
}
