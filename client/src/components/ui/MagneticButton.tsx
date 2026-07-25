import type { ReactNode, MouseEventHandler } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMagnetic } from '@/hooks/useMagnetic';

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  'aria-label'?: string;
}

const VARIANTS = {
  primary:
    'bg-gradient-brand text-base-900 shadow-glow-cyan hover:shadow-[0_0_60px_rgba(34,211,238,0.45)]',
  secondary:
    'border border-white/15 bg-white/5 text-white backdrop-blur-xl hover:border-white/30 hover:bg-white/10',
  ghost: 'text-gray-300 hover:text-white',
} as const;

/**
 * Button that drifts toward the cursor, lifts on hover and emits a ripple on
 * press. Falls back to a plain button under reduced-motion.
 */
export function MagneticButton({
  children,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
  ...rest
}: MagneticButtonProps) {
  const { ref, x, y, onPointerMove, onPointerLeave } = useMagnetic<HTMLButtonElement>(0.25);

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x, y }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold tracking-tight transition-colors duration-300',
        VARIANTS[variant],
        className
      )}
      {...rest}
    >
      {/* Sheen sweep on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
