import { useEffect, useState } from 'react';

const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

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

// One probe per slug per page load, shared by every card that asks.
const cache = new Map<string, Promise<string | null>>();

/**
 * Looks for a product photograph at `public/products/<slug>.<ext>`.
 *
 * Returns null until one is found — and forever if there is none, which is
 * the normal case: the drawn art in `CommodityArt` is the default, and a
 * photograph simply takes over when someone adds one. That means real
 * photography can be dropped in per category, a few at a time, with no code
 * change and no half-populated grid in the meantime.
 */
export function useProductPhoto(slug: string): string | null {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let found = cache.get(slug);
    if (!found) {
      found = probe(EXTENSIONS.map((ext) => `/products/${slug}.${ext}`));
      cache.set(slug, found);
    }
    found.then((result) => {
      if (!cancelled) setSrc(result);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return src;
}
