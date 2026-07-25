import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EASE, viewportOnce } from '@/lib/motion';
import { useAuth } from '@/context/AuthContext';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { MagneticButton } from '@/components/ui/MagneticButton';

/** Dramatic conversion section with drifting particles and a glowing headline. */
export function CallToAction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reduced = usePrefersReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: (i % 6) * 0.8,
        duration: 9 + (i % 5) * 2.5,
        size: i % 3 === 0 ? 3 : 2,
      })),
    []
  );

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'supplier'
        ? '/dashboard/supplier'
        : '/dashboard/buyer';

  return (
    <section className="relative overflow-hidden px-5 py-32">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[52rem] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-electric-500/20 via-electric-500/15 to-electric-600/20 blur-[110px]" />
      </div>

      {/* Floating particles */}
      {!reduced && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((p, i) => (
            <motion.span
              key={i}
              initial={{ y: '105%', opacity: 0 }}
              animate={{ y: '-10%', opacity: [0, 0.8, 0] }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ left: p.left, width: p.size, height: p.size }}
              className="absolute rounded-full bg-electric-300/70"
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportOnce}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <h2 className="font-display text-[2.75rem] font-semibold leading-[1.02] tracking-tighter text-white sm:text-6xl lg:text-7xl">
          Ready to trade
          <br />
          <span className="text-gradient">without the middlemen?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-gray-400">
          Join the intelligent marketplace built for African commodity exports. Free for buyers,
          free to list for suppliers.
        </p>

        <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            onClick={() => navigate(user ? dashboardPath : '/signup')}
            className="px-8 py-4 text-base"
          >
            {user ? 'Go to dashboard' : 'Get started free'}
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <Link to="/pricing">
            <MagneticButton variant="secondary" className="px-8 py-4 text-base">
              View pricing
            </MagneticButton>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
