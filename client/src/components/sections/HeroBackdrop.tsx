import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { LazyHeroScene } from '@/components/three/LazyHeroScene';

/**
 * Where the hero photograph lives. Drop a file named `hero-port.*` into
 * `client/public/` (or point VITE_HERO_IMAGE at any URL) and it becomes the
 * backdrop; until then the generated 3D yard is used instead.
 *
 * Several extensions are probed rather than demanding one, so the file does not
 * have to be renamed or converted to be picked up.
 */
const CANDIDATES: string[] = [
  import.meta.env.VITE_HERO_IMAGE,
  '/hero-port.jpg',
  '/hero-port.jpeg',
  '/hero-port.png',
  '/hero-port.webp',
  '/hero-port.avif',
].filter(Boolean) as string[];

/** Resolves to the first candidate that actually decodes, or null if none do. */
function probe(sources: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    let i = 0;
    const next = () => {
      if (i >= sources.length) return resolve(null);
      const src = sources[i++];
      const img = new Image();
      img.onload = () => (img.naturalWidth > 1 ? resolve(src) : next());
      img.onerror = next;
      img.src = src;
    };
    next();
  });
}

type Status = 'loading' | 'ready' | 'missing';

/**
 * Renders the hero photograph when one is available and quietly falls back to
 * the 3D yard when it is not. The probe matters because the image is optional:
 * a missing file must not leave the hero empty.
 */
export function HeroBackdrop() {
  const reduced = usePrefersReducedMotion();
  const [status, setStatus] = useState<Status>('loading');
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    probe(CANDIDATES).then((found) => {
      if (cancelled) return;
      setSrc(found);
      setStatus(found ? 'ready' : 'missing');
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
          className="absolute inset-0 bg-gradient-to-tr from-electric-700/20 via-transparent to-transparent"
        />
      )}

      {/* Grade the photo toward the site's night palette */}
      <div className="absolute inset-0 bg-base-900/45" />
    </div>
  );
}
