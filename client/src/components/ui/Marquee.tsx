import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface MarqueeProps {
  children: ReactNode;
  /** Seconds for one full cycle. */
  speed?: number;
  reverse?: boolean;
  className?: string;
  /** Fade the left/right edges into the background. */
  fade?: boolean;
}

/**
 * Infinite horizontal scroller. The track is duplicated so the loop is
 * seamless; hovering pauses it, and reduced-motion turns it into a normal
 * horizontally scrollable row.
 */
export function Marquee({
  children,
  speed = 40,
  reverse = false,
  className,
  fade = true,
}: MarqueeProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <div className={cn('flex gap-6 overflow-x-auto pb-2', className)}>{children}</div>
    );
  }

  return (
    <div
      className={cn('group relative overflow-hidden', className)}
      style={
        fade
          ? {
              maskImage:
                'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            }
          : undefined
      }
    >
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={
          {
            '--marquee-duration': `${speed}s`,
            animationDirection: reverse ? 'reverse' : 'normal',
          } as React.CSSProperties
        }
      >
        {/* Two identical halves keep the -50% wrap seamless */}
        <div className="flex gap-6 pr-6">{children}</div>
        <div className="flex gap-6 pr-6" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
