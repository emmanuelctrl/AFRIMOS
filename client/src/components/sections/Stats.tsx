import { motion } from 'framer-motion';
import { STATS } from '@/lib/site';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { StaggerGroup, StaggerItem } from '@/components/ui/Reveal';

/**
 * Headline metrics with count-up animation.
 *
 * This is the page's one cream band: a light, paper-like strip cutting across
 * the night palette. It gives the scroll a beat of contrast and keeps the
 * numbers — the most quoted thing on the page — the brightest object on it.
 */
export function Stats() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-cream text-base-900">
      {/* Soft ocean wash so the band belongs to the rest of the palette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_50%_0%,rgba(11,110,153,0.12),transparent_70%)]"
      />

      <StaggerGroup className="relative mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StaggerItem
            key={stat.label}
            className="relative border-b border-cream-300/70 last:border-b-0 even:border-l lg:border-b-0 lg:border-l lg:first:border-l-0"
          >
            <div className="group relative h-full px-6 py-12 text-center transition-colors duration-500 hover:bg-cream-50/70 sm:px-8">
              {/* Hover rule */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-electric-500/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <p className="font-display text-4xl font-semibold tracking-tighter text-base-900 sm:text-5xl">
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.value % 1 !== 0 ? 1 : 0}
                />
              </p>
              <p className="mt-3 text-sm font-semibold text-espresso-700">{stat.label}</p>
              <p className="mt-1 text-xs text-cream-600">{stat.detail}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
