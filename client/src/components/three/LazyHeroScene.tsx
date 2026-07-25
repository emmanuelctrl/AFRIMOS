import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SceneBoundary } from './SceneBoundary';

// Three.js is heavy — keep it out of the entry chunk entirely.
const HeroScene = lazy(() => import('./HeroScene'));

/** Static gradient stand-in used while loading, and as the reduced-motion fallback. */
function SceneFallback() {
  return (
    <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
      <div className="h-[26rem] w-[26rem] max-w-[80vw] rounded-full bg-gradient-to-br from-electric-500/25 via-electric-500/15 to-electric-600/25 blur-[90px]" />
    </div>
  );
}

/**
 * Mounts the 3D hero only when it is on screen, the device is wide enough to
 * benefit, and the user has not asked for reduced motion.
 */
export function LazyHeroScene({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    // Skip the WebGL scene on small screens and low-core devices.
    const wideEnough = window.matchMedia('(min-width: 768px)').matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    setCapable(wideEnough && cores > 2);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showScene = capable && !reduced && visible;

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {showScene ? (
        <SceneBoundary fallback={<SceneFallback />}>
          <Suspense fallback={<SceneFallback />}>
            <HeroScene />
          </Suspense>
        </SceneBoundary>
      ) : (
        <SceneFallback />
      )}
    </div>
  );
}
