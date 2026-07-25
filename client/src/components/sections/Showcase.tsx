import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, MapPin, Package, X } from 'lucide-react';
import { COMMODITIES, LISTINGS } from '@/lib/site';
import { EASE } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface Project {
  name: string;
  listings: string;
  origin: string;
  demand: number;
  blurb: string;
  specs: { label: string; value: string }[];
}

const PROJECTS: Project[] = COMMODITIES.map((c, i) => ({
  ...c,
  blurb:
    'Sourced directly from cooperatives and processing facilities, with certification, moisture and grading data attached to every listing.',
  specs: [
    { label: 'Active listings', value: c.listings },
    { label: 'Primary origin', value: c.origin },
    { label: 'Buyer demand', value: `${c.demand}%` },
    { label: 'Typical MOQ', value: LISTINGS[i % LISTINGS.length].moq },
  ],
}));

const GRADIENTS = [
  'from-cyan-500/30 via-neon-blue/10 to-transparent',
  'from-neon-purple/30 via-neon-indigo/10 to-transparent',
  'from-neon-blue/30 via-cyan-500/10 to-transparent',
  'from-neon-indigo/30 via-neon-purple/10 to-transparent',
  'from-cyan-400/30 via-neon-purple/10 to-transparent',
  'from-neon-purple/30 via-cyan-500/10 to-transparent',
];

/** Horizontally-scrolling commodity showcase; cards open a premium modal. */
export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<Project | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  // Translate the track horizontally as the pinned section scrolls.
  const x = useTransform(scrollYProgress, [0, 1], ['2%', '-62%']);

  return (
    <>
      <section id="showcase" className="relative">
        <div className="section pb-0">
          <SectionHeading
            eyebrow="Coverage"
            title={
              <>
                Six categories,
                <br />
                <span className="text-gradient">one supply network.</span>
              </>
            }
            description="Explore what African exporters are shipping right now — with live demand signals for each category."
          />
        </div>

        {/* Pinned horizontal scroller (desktop) */}
        <div ref={ref} className="relative hidden h-[280vh] md:block">
          <div className="sticky top-0 flex h-screen items-center overflow-hidden">
            <motion.div style={reduced ? undefined : { x }} className="flex gap-7 px-8">
              {PROJECTS.map((project, i) => (
                <ShowcaseCard
                  key={project.name}
                  project={project}
                  gradient={GRADIENTS[i % GRADIENTS.length]}
                  onOpen={() => setActive(project)}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Swipeable row (mobile) */}
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 py-12 md:hidden">
          {PROJECTS.map((project, i) => (
            <div key={project.name} className="snap-center">
              <ShowcaseCard
                project={project}
                gradient={GRADIENTS[i % GRADIENTS.length]}
                onOpen={() => setActive(project)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ---- Detail modal ---- */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-base-900/80 p-5 backdrop-blur-xl"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={active.name}
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-base-800/90 shadow-glass-lg backdrop-blur-2xl"
            >
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-cyan-500/25 via-neon-purple/15 to-transparent">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.35),transparent_60%)]" />
                <h3 className="absolute bottom-5 left-6 font-display text-4xl font-semibold tracking-tight text-white">
                  {active.name}
                </h3>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setActive(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-xl transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-6">
                <p className="text-sm leading-relaxed text-gray-400">{active.blurb}</p>

                <dl className="mt-6 grid grid-cols-2 gap-3">
                  {active.specs.map((spec) => (
                    <div key={spec.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <dt className="text-xs text-gray-500">{spec.label}</dt>
                      <dd className="mt-1 font-display text-lg font-semibold text-white">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${active.demand}%` }}
                    transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
                    className="h-full rounded-full bg-gradient-brand"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ShowcaseCard({
  project,
  gradient,
  onOpen,
}: {
  project: Project;
  gradient: string;
  onOpen: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -10 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="group relative h-[22rem] w-[19rem] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-base-800/60 p-7 text-left shadow-glass backdrop-blur-xl sm:h-[24rem] sm:w-[21rem]"
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-70 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <span
        aria-hidden="true"
        className="gradient-border pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
            {project.listings}
          </span>
          <ArrowUpRight className="h-5 w-5 text-white/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
        </div>

        <div>
          <h3 className="font-display text-3xl font-semibold tracking-tight text-white">
            {project.name}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-white/60">
            <MapPin className="h-3.5 w-3.5" />
            {project.origin}
          </p>

          <div className="mt-5 flex items-center justify-between text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Demand
            </span>
            <span className="tabular-nums text-white">{project.demand}%</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/15">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${project.demand}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-white/80"
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
