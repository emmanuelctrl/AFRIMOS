import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SceneBoundary } from './SceneBoundary';
import { ContainerFallback } from './ContainerFallback';

// Three.js is heavy — keep it out of the entry chunk entirely.
const HeroScene = lazy(() => import('./HeroScene'));

/**
 * Stand-in whenever WebGL is not in play. It draws the container in CSS rather
 * than showing an empty glow, so the hero always has its subject.
 */
function SceneFallback() {
  return <ContainerFallback />;
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
