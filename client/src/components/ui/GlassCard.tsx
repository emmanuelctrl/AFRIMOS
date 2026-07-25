import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  tilt?: number;
  /** Show the cursor-following specular highlight. */
  glow?: boolean;
  as?: 'div' | 'article' | 'li';
}

/**
 * Frosted card with cursor-tracked 3D tilt, a specular highlight that follows
 * the pointer, and an animated gradient border on hover.
 */
export function GlassCard({
  children,
  className,
  tilt = 8,
  glow = true,
  as = 'div',
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 180, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useMotionValue(0), spring);
  const rotateY = useSpring(useMotionValue(0), spring);

  // Specular highlight follows the pointer, smoothed by the same spring.
  const glowX = useTransform(useSpring(px, spring), (v) => `${v * 100}%`);
  const glowY = useTransform(useSpring(py, spring), (v) => `${v * 100}%`);
  const background = useMotionTemplate`radial-gradient(320px circle at ${glowX} ${glowY}, rgba(34,211,238,0.14), transparent 70%)`;

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    px.set(nx);
    py.set(ny);
    rotateY.set((nx - 0.5) * tilt * 2);
    rotateX.set(-(ny - 0.5) * tilt * 2);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    px.set(0.5);
    py.set(0.5);
  };

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={cn(
        'group preserve-3d relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl',
        'transition-colors duration-300 hover:border-white/20',
        className
      )}
    >
      {/* Cursor-following specular highlight */}
      {glow && !reduced && (
        <motion.span
          aria-hidden="true"
          style={{ background }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      {/* Gradient border, revealed on hover */}
      <span
        aria-hidden="true"
        className="gradient-border pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative">{children}</div>
    </MotionTag>
  );
}
