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
      <div className="absolute h-[26rem] w-[34rem] max-w-[90vw] rounded-full bg-electric-500/20 blur-[110px]" />

      <motion.div
        animate={reduced ? undefined : { y: [0, -14, 0], rotate: [-8, -7, -8] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{ rotate: -8 }}
        className="relative w-[92vw] max-w-[46rem]"
      >
        {/* Lifting cables */}
        <div className="absolute inset-x-[18%] -top-[60vh] flex h-[60vh] justify-between">
          {[0, 1].map((i) => (
            <span key={i} className="w-px bg-gradient-to-b from-transparent via-white/20 to-white/35" />
          ))}
        </div>

        {/* Body */}
        <div className="relative rounded-[6px] bg-gradient-to-b from-[#8E3128] via-[#7A2B22] to-[#5B1E17] p-[3px] shadow-[0_26px_60px_rgba(0,0,0,0.6)]">
          {/* Top rail */}
          <div className="h-2 rounded-t-[4px] bg-gradient-to-b from-[#A03A2E] to-[#6B2419]" />

          {/* Corrugated face */}
          <div className="flex h-32 items-stretch gap-[3px] overflow-hidden bg-[#6B2419] px-1 sm:h-40">
            {RIBS.map((i) => (
              <span
                key={i}
                className="flex-1 bg-gradient-to-b from-[#8E3128] via-[#72271E] to-[#571C15]"
                style={{ boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.45)' }}
              />
            ))}
          </div>

          {/* Bottom rail */}
          <div className="h-2 rounded-b-[4px] bg-gradient-to-b from-[#4A1811] to-[#6B2419]" />

          {/* Corner castings */}
          {[
            'left-0 top-0',
            'right-0 top-0',
            'left-0 bottom-0',
            'right-0 bottom-0',
          ].map((pos) => (
            <span
              key={pos}
              className={`absolute ${pos} h-5 w-7 rounded-[3px] bg-[#161E24] ring-1 ring-black/40`}
            />
          ))}

          {/* Door end with locking bars */}
          <div className="absolute inset-y-2 right-2 flex w-14 items-center justify-around rounded-[4px] bg-gradient-to-b from-[#2A3138] to-[#161E24] sm:w-16">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-[80%] w-[3px] rounded-full bg-black/25" />
            ))}
          </div>

          {/* Wordmark stencilled on the side */}
          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-display text-sm font-bold uppercase tracking-[0.3em] text-white/85 sm:text-base">
            AFRIMOS
          </span>
        </div>
      </motion.div>
    </div>
  );
}
