import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { useAuth } from '@/context/AuthContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { HeroBackdrop } from './HeroBackdrop';

interface Slide {
  heading: string[];
  body: string;
  stats: { value: string; label: string }[];
}

const SLIDES: Slide[] = [
  {
    heading: ['Smarter Sourcing.', 'Faster Deals. Global Reach.'],
    body: 'Technology-driven export solutions built for speed, trust and traceability — from verified African suppliers to buyers in 203 countries.',
    stats: [
      { value: '500+', label: 'Verified exporters' },
      { value: '1.2K+', label: 'RFQs matched' },
      { value: '203', label: 'Global destinations' },
    ],
  },
  {
    heading: ['Verified Supply.', 'Documented. Traceable.'],
    body: 'Every exporter passes licence, document and trade-history review before listing, so a quote you receive is one you can act on.',
    stats: [
      { value: '100%', label: 'Manually vetted' },
      { value: '6', label: 'Commodity categories' },
      { value: '585+', label: 'Active listings' },
    ],
  },
  {
    heading: ['No Brokers.', 'No Commission. Direct.'],
    body: 'Negotiate inside the inquiry thread and keep the margin that used to disappear into intermediaries on every shipment.',
    stats: [
      { value: '0%', label: 'Platform commission' },
      { value: '94%', label: 'Response rate' },
      { value: '$4.2B', label: 'Export market' },
    ],
  },
];

const AUTOPLAY_MS = 8000;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const uiOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const go = useCallback((dir: number) => {
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance, paused under reduced-motion.
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [go, reduced, index]);

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'supplier'
        ? '/dashboard/supplier'
        : '/dashboard/buyer';

  const slide = SLIDES[index];

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden">
      {/* ---- Night scene ---- */}
      <motion.div
        style={reduced ? undefined : { y: sceneY, scale: sceneScale }}
        className="absolute inset-0 z-0"
      >
        <HeroBackdrop />
      </motion.div>

      {/* Vignettes: keep the copy legible over the headlights */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[62%] bg-gradient-to-r from-base-900 via-base-900/75 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2/5 bg-gradient-to-t from-base-900 via-base-900/80 to-transparent"
      />

      {/* ---- Copy + stats ---- */}
      <motion.div
        style={reduced ? undefined : { opacity: uiOpacity }}
        className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[110rem] flex-col justify-between px-5 pb-10 pt-32 sm:px-8 sm:pt-36"
      >
        <div className="flex flex-1 items-center">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }}
                exit={{ opacity: 0, y: -14, transition: { duration: 0.22, ease: 'easeIn' } }}
                className="min-h-[13rem] sm:min-h-[15rem]"
              >
                <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                  {slide.heading.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-300 sm:text-lg">
                  {slide.body}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={() => navigate(user ? dashboardPath : '/signup')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-semibold text-base-900"
            >
              {user ? 'Go to dashboard' : 'See how it works'}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-base-900 text-white">
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </motion.button>
          </div>
        </div>

        {/* Bottom row: stats left, slide control right */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <AnimatePresence mode="wait">
            <motion.dl
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }}
              className="flex min-h-[4.5rem] flex-wrap gap-x-12 gap-y-6 sm:gap-x-16"
            >
              {slide.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-3xl font-bold text-white sm:text-4xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 max-w-[9rem] text-xs leading-snug text-gray-400 sm:text-sm">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </AnimatePresence>

          {/* Slide control */}
          <div className="flex items-center gap-4 self-start rounded-full border border-white/10 bg-base-900/70 px-3 py-2.5 backdrop-blur-xl lg:self-auto">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-base-900 transition-transform hover:scale-105"
            >
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Progress track */}
            <div className="relative h-px w-24 bg-white/15 sm:w-32">
              <motion.span
                key={index}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: reduced ? 0 : AUTOPLAY_MS / 1000,
                  ease: 'linear',
                }}
                className="absolute inset-0 origin-left bg-electric-500"
              />
            </div>

            <span className="pr-2 font-display text-lg font-semibold tabular-nums text-white">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
