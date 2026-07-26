import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  label?: string;
  className?: string;
  tone?: 'emerald' | 'cyan';
}

/** Live status pill with a softly pulsing indicator ring. */
export function StatusBadge({
  label = 'Systems Operational',
  className,
  tone = 'emerald',
}: StatusBadgeProps) {
  const dot = tone === 'emerald' ? 'bg-electric-400' : 'bg-electric-300';

  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-300 backdrop-blur-xl',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          aria-hidden="true"
          className={cn('absolute inline-flex h-full w-full animate-pulse-ring rounded-full', dot)}
        />
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', dot)} />
      </span>
      {label}
    </span>
  );
}
