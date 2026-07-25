import { cn } from '@/lib/utils';

/**
 * Fixed ambient backdrop: aurora blobs, a faint grid, and a noise overlay.
 * Purely decorative — pointer-events are disabled throughout.
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
      {/* Aurora glows */}
      <div className="absolute -left-40 -top-48 h-[36rem] w-[36rem] animate-aurora rounded-full bg-cyan-500/10 blur-[120px]" />
      <div
        className="absolute -right-40 top-1/4 h-[40rem] w-[40rem] animate-aurora rounded-full bg-neon-purple/10 blur-[130px]"
        style={{ animationDelay: '-7s' }}
      />
      <div
        className="absolute bottom-[-14rem] left-1/3 h-[32rem] w-[32rem] animate-aurora rounded-full bg-neon-blue/10 blur-[120px]"
        style={{ animationDelay: '-14s' }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 20%, transparent 75%)',
        }}
      />

      {/* Film grain */}
      <div className="noise-overlay absolute inset-0" />
    </div>
  );
}
