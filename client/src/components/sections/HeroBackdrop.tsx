import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useHeroPhoto } from '@/hooks/useHeroPhoto';
import { LazyHeroScene } from '@/components/three/LazyHeroScene';

/**
 * Renders the hero photograph when one is available and quietly falls back to
 * the 3D yard when it is not. The probe matters because the image is optional:
 * a missing file must not leave the hero empty.
 */
export function HeroBackdrop() {
  const reduced = usePrefersReducedMotion();
  const { status, src } = useHeroPhoto();

  if (status === 'missing' || (status === 'ready' && !src))
    return <LazyHeroScene className="absolute inset-0" />;

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-base-900">
      <motion.div
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: status === 'ready' ? 1 : 0, scale: 1 }}
        transition={{ opacity: { duration: 1.2 }, scale: { duration: 14, ease: 'easeOut' } }}
        className="absolute inset-0"
      >
        <img
          src={src ?? undefined}
          alt=""
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover"
          // The reference frames cargo on one side and open water on the other;
          // biasing right keeps the busy half away from the headline column.
          style={{ objectPosition: '70% center' }}
        />
      </motion.div>

      {/* Slow drift keeps a still photograph from feeling static */}
      {!reduced && status === 'ready' && (
        <motion.div
          aria-hidden="true"
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
