import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SceneBoundary } from './SceneBoundary';
import { ContainerFallback } from './ContainerFallback';

const ContainerShowpiece = lazy(() => import('./ContainerShowpiece'));

function SoloFallback() {
  return <ContainerFallback variant="solo" />;
}

/**
 * Mounts the close-up container only when it is on screen and the device can
 * afford WebGL. Everywhere else the CSS container stands in, so the subject is
 * on the page either way — the thing that must never happen here is an empty
 * box of nothing where the container should be.
 */
export function LazyContainerShowpiece({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    const wideEnough = window.matchMedia('(min-width: 768px)').matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    setCapable(wideEnough && cores > 2);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '200px',
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const show3D = capable && !reduced && visible;

  return (
    <div ref={ref} className={className} aria-hidden="true">
      {show3D ? (
        <SceneBoundary fallback={<SoloFallback />}>
          <Suspense fallback={<SoloFallback />}>
            <ContainerShowpiece />
          </Suspense>
        </SceneBoundary>
      ) : (
        <SoloFallback />
      )}
    </div>
  );
}
