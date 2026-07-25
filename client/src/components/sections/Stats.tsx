import { motion } from 'framer-motion';
import { STATS } from '@/lib/site';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { StaggerGroup, StaggerItem } from '@/components/ui/Reveal';

/** Headline metrics with count-up animation and glowing dividers. */
export function Stats() {
  return (
    <section className="relative border-y border-espresso-900/10 bg-white/35">
      <StaggerGroup className="mx-auto grid max-w-7xl grid-cols-2 gap-px lg:grid-cols-4">
        {STATS.map((stat) => (
          <StaggerItem key={stat.label} className="relative">
            <div className="group relative h-full px-6 py-12 text-center transition-colors duration-500 hover:bg-white/40 sm:px-8">
              {/* Hover glow */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-electric-300/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <p className="font-display text-4xl font-semibold tracking-tighter text-espresso-900 sm:text-5xl">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.value % 1 !== 0 ? 1 : 0}
                />
              </p>
              <p className="mt-3 text-sm font-medium text-espresso-700">{stat.label}</p>
              <p className="mt-1 text-xs text-espresso-500">{stat.detail}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
