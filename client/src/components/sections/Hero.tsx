import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { useAuth } from '@/context/AuthContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { LazyHeroScene } from '@/components/three/LazyHeroScene';

/** Small pulsing hotspot dot, as seen on the reference product shot. */
function Hotspot({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <span className={`absolute ${className}`} aria-hidden="true">
      <span className="relative flex h-3.5 w-3.5 items-center justify-center">
        <motion.span
          className="absolute h-full w-full rounded-full bg-white/70"
          animate={{ scale: [1, 2.1, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
        <span className="relative h-2 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
      </span>
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // The wordmark drifts up and fades; the container hangs back a beat — the
  // parallax split is what sells the depth as you scroll away.
  const wordY = useTransform(scrollYProgress, [0, 1], ['0%', '-38%']);
  const wordOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const uiOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'supplier'
        ? '/dashboard/supplier'
        : '/dashboard/buyer';

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
    >
      {/* ---- Layer 1: giant silver wordmark ---- */}
      <motion.div
        style={reduced ? undefined : { y: wordY, opacity: wordOpacity }}
        className="pointer-events-none absolute inset-x-0 top-[18%] z-[1] flex justify-center px-4 sm:top-[16%]"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 1.06, filter: 'blur(14px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: EASE }}
          className="display-wordmark select-none text-center text-[22vw] leading-none sm:text-[19vw] lg:text-[17vw]"
        >
          AFRIMOS
        </motion.h1>
      </motion.div>

      {/* ---- Layer 2: the container, in front of the letters ---- */}
      <motion.div
        style={reduced ? undefined : { y: sceneY, scale: sceneScale }}
        className="absolute inset-0 z-[2]"
      >
        <motion.div
          initial={{ opacity: 0, y: -70 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.7, delay: 0.25, ease: EASE }}
          className="h-full w-full"
        >
          <LazyHeroScene className="absolute inset-0" />
        </motion.div>

        {/* Hotspots pinned over the container */}
        {!reduced && (
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            <Hotspot className="left-[46%] top-[45%]" />
            <Hotspot className="left-[52%] top-[52%]" delay={0.8} />
            <Hotspot className="left-[64%] top-[58%]" delay={1.6} />
          </div>
        )}
      </motion.div>

      {/* Floor vignette — grounds the container in the scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-1/3 bg-gradient-to-t from-base-900 via-base-900/70 to-transparent"
      />

      {/* ---- Layer 3: floating UI ---- */}
      <motion.div
        style={reduced ? undefined : { opacity: uiOpacity }}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8"
      >
        <div className="flex min-h-[100svh] flex-col justify-end pb-24 pt-32 sm:pb-28">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            {/* Left glass card */}
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.8, ease: EASE }}
              className="max-w-sm rounded-2xl border border-white/10 bg-base-800/60 p-6 shadow-glass backdrop-blur-xl"
            >
              <h2 className="font-display text-2xl font-medium leading-snug text-white sm:text-[1.75rem]">
                Export effortlessly
                <br />
                in just days
              </h2>
              <button
                type="button"
                onClick={() => navigate(user ? dashboardPath : '/signup')}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-electric-500 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-glow-blue transition-all duration-300 hover:bg-electric-400 hover:shadow-[0_0_50px_rgba(184,115,51,0.65)]"
              >
                {user ? 'Open dashboard' : 'Start trading'}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
            </motion.div>

            {/* Right spec card */}
            <motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.95, ease: EASE }}
              className="hidden w-52 rounded-2xl border border-white/10 bg-base-800/60 p-3 shadow-glass backdrop-blur-xl lg:block"
            >
              <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-electric-500/25 via-base-700 to-base-800">
                <ShieldCheck className="h-9 w-9 text-electric-300" strokeWidth={1.5} />
              </div>
              <ul className="mt-3 space-y-1.5 px-1 pb-1 text-xs text-gray-300">
                {['Fully traceable', 'Quality assured', 'Export documented'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-electric-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating "global support" chip, overlapping the wordmark like the brief */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.15, ease: EASE }}
        style={reduced ? undefined : { opacity: uiOpacity }}
        className="absolute left-[6%] top-[38%] z-10 hidden rounded-xl border border-white/10 bg-base-800/70 px-5 py-3 text-center shadow-glass backdrop-blur-xl lg:block"
      >
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gray-400">
          Global reach
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-white">203 countries</p>
      </motion.div>
    </section>
  );
}
