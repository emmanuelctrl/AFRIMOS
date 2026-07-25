import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const LOGO_PATH =
  'M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z';

interface LogoProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}

/** AFRIMOS geometric mark with a cyan→purple gradient fill. */
export function Logo({ className, size = 28, withWordmark = false }: LogoProps) {
  return (
    <Link to="/" aria-label="AFRIMOS home" className={cn('flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 256 256" width={size} height={size} aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id="afrimos-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <path d={LOGO_PATH} fill="url(#afrimos-mark)" />
      </svg>
      {withWordmark && (
        <span className="font-display text-lg font-semibold tracking-tight text-white">AFRIMOS</span>
      )}
    </Link>
  );
}
