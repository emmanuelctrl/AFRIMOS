import { motion } from 'framer-motion';
import { COMMODITIES } from '@/lib/site';
import { viewportOnce } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Ocean into cream: the ring reads as the tide running up onto sand.
const PALETTES = [
  { from: '#6FC8E4', to: '#0B6E99' },
  { from: '#EADFC7', to: '#2E9CC9' },
  { from: '#2E9CC9', to: '#EADFC7' },
];

/**
 * Floating glass panel with animated circular progress rings — used as the
 * illustration beside each service row.
 */
export function DemandRings({ variant = 0 }: { variant?: number }) {
  const reduced = usePrefersReducedMotion();
  const palette = PALETTES[variant % PALETTES.length];
  const items = COMMODITIES.slice(variant, variant + 3);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      animate={reduced ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: variant * 0.6 }}
      className="relative"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] blur-3xl"
        style={{
          background: `linear-gradient(135deg, ${palette.from}22, transparent 60%, ${palette.to}22)`,
        }}
      />

      <div className="relative rounded-3xl border border-cream-200/12 bg-cream-100/[0.09] p-7 shadow-glass backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-cream-50">Category demand</p>
          <span className="rounded-full border border-cream-200/12 bg-cream-100/[0.06] px-2.5 py-0.5 text-[0.65rem] text-gray-400">
            90d
          </span>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {items.map((c, i) => {
            const offset = circumference - (c.demand / 100) * circumference;
            const gid = `ring-${variant}-${i}`;
            return (
              <div key={c.name} className="flex flex-col items-center">
                <div className="relative h-[86px] w-[86px]">
                  <svg viewBox="0 0 86 86" className="h-full w-full -rotate-90">
                    <defs>
                      <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={palette.from} />
                        <stop offset="100%" stopColor={palette.to} />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="43"
                      cy="43"
                      r={radius}
                      fill="none"
                      stroke="rgba(234,223,199,0.12)"
                      strokeWidth="6"
                    />
                    <motion.circle
                      cx="43"
                      cy="43"
                      r={radius}
                      fill="none"
                      stroke={`url(#${gid})`}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      whileInView={{ strokeDashoffset: offset }}
                      viewport={viewportOnce}
                      transition={{ duration: 1.4, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-semibold text-cream-50">
                    {c.demand}%
                  </span>
                </div>
                <p className="mt-2.5 text-xs font-medium text-gray-300">{c.name}</p>
                <p className="text-[0.65rem] text-gray-500">{c.listings}</p>
              </div>
            );
          })}
        </div>

        {/* Progress bars */}
        <div className="mt-8 space-y-3">
          {items.map((c, i) => (
            <div key={c.name}>
              <div className="flex items-center justify-between text-[0.7rem] text-gray-500">
                <span>{c.origin}</span>
                <span className="tabular-nums">{c.demand}</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-cream-200/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${c.demand}%` }}
                  viewport={viewportOnce}
                  transition={{ duration: 1.1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${palette.from}, ${palette.to})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
