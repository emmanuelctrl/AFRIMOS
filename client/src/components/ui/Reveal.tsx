import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeUp, perspectiveReveal, stagger, viewportOnce } from '@/lib/motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** `fade` rises gently; `perspective` rotates up through 3D space. */
  variant?: 'fade' | 'perspective';
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article';
}

/** Scroll-triggered reveal for a single block. */
export function Reveal({ children, className, variant = 'fade', delay = 0, as = 'div' }: RevealProps) {
  const variants: Variants = variant === 'perspective' ? perspectiveReveal : fadeUp;
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variants}
      transition={{ delay }}
      className={cn(variant === 'perspective' && 'perspective-1000', className)}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  gap?: number;
}

/** Parent that reveals its `Reveal` children one after another. */
export function StaggerGroup({ children, className, gap = 0.08 }: StaggerGroupProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={stagger(gap)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Child of `StaggerGroup` — inherits the parent's orchestration. */
export function StaggerItem({
  children,
  className,
  variant = 'fade',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'fade' | 'perspective';
}) {
  return (
    <motion.div
      variants={variant === 'perspective' ? perspectiveReveal : fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
