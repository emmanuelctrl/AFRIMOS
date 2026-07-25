import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const RIBS = Array.from({ length: 26 }, (_, i) => i);

/**
 * CSS-drawn shipping container used wherever the WebGL scene is not mounted —
 * mobile, low-core devices, reduced-motion and any WebGL failure. Without this
 * the hero simply had no subject on those devices.
 */
export function ContainerFallback() {
  const reduced = usePrefersReducedMotion();

  return (
    <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Warm ambient wash behind the crate */}
      <div className="absolute h-[26rem] w-[34rem] max-w-[90vw] rounded-full bg-electric-400/15 blur-[110px]" />

      <motion.div
        animate={reduced ? undefined : { y: [0, -14, 0], rotate: [-8, -7, -8] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ rotate: -8 }}
        className="relative w-[92vw] max-w-[46rem]"
      >
        {/* Lifting cables */}
        <div className="absolute inset-x-[18%] -top-[60vh] flex h-[60vh] justify-between">
          {[0, 1].map((i) => (
            <span key={i} className="w-px bg-gradient-to-b from-transparent via-silver-500/50 to-silver-400/70" />
          ))}
        </div>

        {/* Body */}
        <div className="relative rounded-[6px] bg-gradient-to-b from-silver-100 via-silver-200 to-silver-300 p-[3px] shadow-[0_30px_70px_rgba(0,0,0,0.55)]">
          {/* Top rail */}
          <div className="h-2 rounded-t-[4px] bg-gradient-to-b from-white/90 to-silver-300" />

          {/* Corrugated face */}
          <div className="flex h-32 items-stretch gap-[3px] overflow-hidden bg-silver-200 px-1 sm:h-40">
            {RIBS.map((i) => (
              <span
                key={i}
                className="flex-1 bg-gradient-to-b from-silver-100 via-silver-200 to-silver-400"
                style={{ boxShadow: 'inset -2px 0 3px rgba(120,95,65,0.35)' }}
              />
            ))}
          </div>

          {/* Bottom rail */}
          <div className="h-2 rounded-b-[4px] bg-gradient-to-b from-silver-400 to-silver-500" />

          {/* Corner castings */}
          {[
            'left-0 top-0',
            'right-0 top-0',
            'left-0 bottom-0',
            'right-0 bottom-0',
          ].map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} h-5 w-7 rounded-[3px] bg-base-700 ring-1 ring-black/40`}
            />
          ))}

          {/* Door end with locking bars */}
          <div className="absolute inset-y-2 right-2 flex w-14 items-center justify-around rounded-[4px] bg-gradient-to-b from-silver-300 to-silver-500 sm:w-16">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-[80%] w-[3px] rounded-full bg-base-700/70" />
            ))}
          </div>

          {/* Wordmark stencilled on the side */}
          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-display text-sm font-bold uppercase tracking-[0.3em] text-base-800/70 sm:text-base">
            AFRIMOS
          </span>
        </div>
      </motion.div>
    </div>
  );
}
