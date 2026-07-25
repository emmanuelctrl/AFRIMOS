import { motion } from 'framer-motion';
import { ArrowUpRight, Boxes, Compass } from 'lucide-react';
import { EASE, viewportOnce } from '@/lib/motion';
import { Reveal } from '@/components/ui/Reveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const AVATARS = [
  { initials: 'AB', tint: 'from-electric-400 to-electric-600' },
  { initials: 'HM', tint: 'from-silver-300 to-silver-500' },
  { initials: 'ST', tint: 'from-electric-300 to-electric-500' },
];

/**
 * Mirrors the reference layout: an eyebrow + statement on the left, a visual
 * card in the middle, and a trust/stat stack on the right.
 */
export function WhyUs() {
  return (
    <section className="section pt-0">
      <div className="grid items-end gap-8 lg:grid-cols-3">
        {/* ---- Statement ---- */}
        <div>
          <Reveal>
            <p className="mb-5 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-espresso-600">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-electric-500/20 ring-1 ring-electric-400/40">
                <Compass className="h-3.5 w-3.5 text-electric-500" />
              </span>
              Why us
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-3xl font-medium leading-[1.12] tracking-tight text-espresso-900 sm:text-[2.6rem]">
              Tailoring export solutions
              <br />
              for every commodity
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-espresso-600">
              From a single specialty coffee lot to bulk sesame shipments, every listing carries the
              specs, certifications and terms a buyer needs to move.
            </p>
          </Reveal>
        </div>

        {/* ---- Visual card ---- */}
        <motion.a
          href="/suppliers"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.9, ease: EASE }}
          whileHover={{ y: -8 }}
          className="group relative overflow-hidden rounded-2xl border border-espresso-900/10 bg-white/70 p-5 shadow-glass backdrop-blur-xl"
        >
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-espresso-900">Verified supply</p>
            <ArrowUpRight className="h-4 w-4 text-espresso-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-espresso-900" />
          </div>

          {/* Stacked crate illustration */}
          <div className="relative mt-6 flex h-40 items-end justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-electric-500/15 via-base-700/60 to-base-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,154,90,0.28),transparent_65%)]" />
            {[0.55, 0.8, 0.65, 0.9, 0.7].map((h, i) => (
              <motion.span
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h * 100}%` }}
                viewport={viewportOnce}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.08, ease: EASE }}
                className="relative w-8 rounded-t-sm bg-gradient-to-t from-electric-700 to-electric-400 shadow-[0_0_18px_rgba(184,115,51,0.35)]"
              />
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-espresso-600">
            <Boxes className="h-3.5 w-3.5 text-electric-500" />
            585+ active listings
          </div>
        </motion.a>

        {/* ---- Trust stack ---- */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
            className="flex items-center justify-between rounded-2xl border border-espresso-900/10 bg-white/70 p-6 shadow-glass backdrop-blur-xl"
          >
            <div>
              <p className="font-display text-4xl font-semibold text-espresso-900">
                <AnimatedCounter value={450} suffix="+" />
              </p>
              <p className="mt-1 text-sm text-espresso-600">Industry leaders trust us</p>
            </div>
            <div className="flex -space-x-3">
              {AVATARS.map((a) => (
                <span
                  key={a.initials}
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${a.tint} text-xs font-semibold text-base-600 ring-2 ring-base-700`}
                >
                  {a.initials}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="flex items-center gap-3 rounded-2xl border border-espresso-900/10 bg-white/70 px-6 py-5 shadow-glass backdrop-blur-xl"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-electric-500/20">
              <span className="h-2.5 w-2.5 rotate-45 rounded-sm bg-electric-400" />
            </span>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-espresso-900">
              Leading the way forward
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
