import { motion } from 'framer-motion';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { LISTINGS } from '@/lib/site';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const SPARK = [28, 42, 35, 58, 49, 71, 63, 88, 76, 95];

/** Floating glass panel that mimics the live AFRIMOS trade dashboard. */
export function DashboardPreview() {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      animate={reduced ? undefined : { y: [0, -12, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
    >
      {/* Ambient glow behind the panel */}
      <div
        aria-hidden="true"
        className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-electric-500/15 via-transparent to-electric-600/15 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-glass-lg backdrop-blur-2xl">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-electric-400/70" />
          </div>
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-gray-500">
            Trade desk
          </span>
        </div>

        <div className="space-y-5 p-5">
          {/* Metric row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-500">Active inquiries</p>
              <p className="mt-1 font-display text-2xl font-semibold text-white">
                <AnimatedCounter value={248} />
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-electric-500">
                <TrendingUp className="h-3 w-3" /> +18.2%
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-gray-500">Response rate</p>
              <p className="mt-1 font-display text-2xl font-semibold text-white">
                <AnimatedCounter value={94} suffix="%" />
              </p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '94%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-brand"
                />
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Inquiry volume · 10 weeks</p>
              <ArrowUpRight className="h-3.5 w-3.5 text-electric-500" />
            </div>
            <div className="mt-4 flex h-20 items-end gap-1.5">
              {SPARK.map((v, i) => (
                <motion.span
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${v}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.05, ease: 'easeOut' }}
                  className="flex-1 rounded-t bg-gradient-to-t from-electric-500/30 to-electric-300"
                />
              ))}
            </div>
          </div>

          {/* Mini listing feed */}
          <div className="space-y-2">
            {LISTINGS.slice(0, 3).map((l) => (
              <div
                key={l.product}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">{l.product}</p>
                  <p className="truncate text-[0.7rem] text-gray-500">{l.company}</p>
                </div>
                <span className="ml-3 shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[0.65rem] text-electric-500">
                  {l.moq}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
