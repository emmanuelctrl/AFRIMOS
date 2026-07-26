import { useEffect, useState } from 'react';

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

// One probe per page load, shared by every caller.
let pending: Promise<string | null> | null = null;

export type HeroPhotoStatus = 'loading' | 'ready' | 'missing';

/**
 * Reports whether a hero photograph is available, and its URL. Callers use it
 * both to render the photo and to decide what to compose on top of it.
 */
export function useHeroPhoto(): { status: HeroPhotoStatus; src: string | null } {
  const [status, setStatus] = useState<HeroPhotoStatus>('loading');
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    pending ??= probe(CANDIDATES);
    pending.then((found) => {
      if (cancelled) return;
      setSrc(found);
      setStatus(found ? 'ready' : 'missing');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, src };
}
