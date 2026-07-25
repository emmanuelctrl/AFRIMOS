import { cn } from '@/lib/utils';

/**
 * Fixed ambient backdrop for the cream page: soft warm washes, a faint grid and
 * a light grain. Purely decorative — pointer-events are disabled throughout.
 */
export function AmbientBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-base-900',
        className
      )}
    >
      {/* Warm washes — kept low-opacity so text contrast never drops */}
      <div className="absolute -left-40 -top-48 h-[36rem] w-[36rem] animate-aurora rounded-full bg-electric-300/20 blur-[120px]" />
      <div
        className="absolute -right-40 top-1/4 h-[40rem] w-[40rem] animate-aurora rounded-full bg-espresso-500/12 blur-[130px]"
        style={{ animationDelay: '-7s' }}
      />
      <div
        className="absolute bottom-[-14rem] left-1/3 h-[32rem] w-[32rem] animate-aurora rounded-full bg-electric-500/12 blur-[120px]"
        style={{ animationDelay: '-14s' }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(74,52,32,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(74,52,32,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)',
        }}
      />

      {/* Paper grain */}
      <div className="noise-overlay absolute inset-0" />
    </div>
  );
}
