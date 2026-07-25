import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { EASE } from '@/lib/motion';
import { TRUST_BADGES } from '@/lib/site';
import { useAuth } from '@/context/AuthContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { LazyHeroScene } from '@/components/three/LazyHeroScene';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DashboardPreview } from './DashboardPreview';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Content recedes into the distance as the user scrolls away.
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'supplier'
        ? '/dashboard/supplier'
        : '/dashboard/buyer';

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-32 sm:pt-36"
    >
      {/* 3D backdrop — z-0 (not negative) so it stays above ancestor backgrounds */}
      <LazyHeroScene className="absolute inset-0 z-0" />

      {/* Scrim: keeps the headline legible over whatever the scene is doing */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-base-900 via-base-900/85 to-transparent lg:via-base-900/60 lg:to-transparent"
      />

      <motion.div
        style={reduced ? undefined : { y, opacity, scale }}
        className="relative z-10 mx-auto grid w-full max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center"
      >
        {/* ---- Copy ---- */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <StatusBadge label="Live marketplace · 203 countries" tone="cyan" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.08, ease: EASE }}
            className="mt-7 font-display text-[3.25rem] font-semibold leading-[0.98] tracking-tighter text-white xs:text-6xl sm:text-7xl lg:text-[5.5rem]"
          >
            African trade,
            <br />
            <span className="text-gradient">intelligently direct.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-gray-400 sm:text-xl"
          >
            AFRIMOS connects verified African commodity exporters with international buyers.
            Structured RFQs, live trade intelligence, direct negotiation — no middlemen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <MagneticButton onClick={() => navigate(user ? dashboardPath : '/signup')}>
              {user ? 'Go to dashboard' : 'Start trading free'}
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <Link to="/suppliers">
              <MagneticButton variant="secondary">Explore suppliers</MagneticButton>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-12"
          >
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              Certified supply
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400 backdrop-blur-md"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ---- Floating dashboard preview ---- */}
        <motion.div
          initial={{ opacity: 0, y: 48, rotateX: 12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
          className="perspective-1000"
        >
          <DashboardPreview />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute inset-x-0 bottom-8 z-10 flex justify-center"
      >
        <motion.span
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.24em] text-gray-500"
        >
          Scroll
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.div>
    </section>
  );
}
