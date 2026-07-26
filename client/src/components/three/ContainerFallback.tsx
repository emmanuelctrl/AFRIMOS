import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const RIBS = Array.from({ length: 30 }, (_, i) => i);

/** The box itself — corrugated flank, castings, door end and markings. */
function Box() {
  return (
    <div className="relative rounded-[5px] bg-gradient-to-b from-[#37708F] via-[#2C5C7E] to-[#1E4359] p-[3px] shadow-[0_30px_70px_rgba(0,0,0,0.65)]">
      <div className="h-2.5 rounded-t-[3px] bg-gradient-to-b from-[#456F87] to-[#16232C]" />

      <div className="flex h-28 items-stretch gap-[3px] overflow-hidden bg-[#244C64] px-1 sm:h-36">
        {RIBS.map((i) => (
          <span
            key={i}
            className="flex-1 bg-gradient-to-b from-[#37708F] via-[#2A587A] to-[#1B3D52]"
            style={{ boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.5)' }}
          />
        ))}
      </div>

      <div className="h-2.5 rounded-b-[3px] bg-gradient-to-b from-[#16232C] to-[#244C64]" />

      {/* Corner castings */}
      {['left-0 top-0', 'right-0 top-0', 'left-0 bottom-0', 'right-0 bottom-0'].map((pos) => (
        <span
          key={pos}
          className={`absolute ${pos} h-5 w-7 rounded-[3px] bg-[#131C24] ring-1 ring-black/40`}
        />
      ))}

      {/* Door end */}
      <div className="absolute inset-y-2 right-2 flex w-12 items-center justify-around rounded-[3px] bg-gradient-to-b from-[#26313A] to-[#131C24] sm:w-14">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[80%] w-[3px] rounded-full bg-[#AEBCC4]/50" />
        ))}
      </div>

      {/* Markings */}
      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-display text-sm font-bold uppercase tracking-[0.28em] text-cream-50/90 sm:text-base">
        AFRIMOS
      </span>
      <span className="absolute bottom-4 left-5 font-mono text-[0.55rem] tracking-widest text-cream-100/50">
        AFRU 482915 7
      </span>
    </div>
  );
}

/**
 * CSS stand-in for the WebGL container, used on mobile, low-core devices,
 * reduced-motion and any WebGL failure — so those devices still get the
 * subject rather than an empty glow.
 *
 * `yard` mirrors the full 3D scene: the box slung under a gantry spreader.
 * `solo` is just the box, for layering over the hero photograph.
 */
export function ContainerFallback({ variant = 'yard' }: { variant?: 'yard' | 'solo' }) {
  const reduced = usePrefersReducedMotion();
  const solo = variant === 'solo';

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {!solo && (
        <>
          {/* Crane floodlight wash */}
          <div className="absolute left-1/2 top-[18%] h-64 w-[36rem] max-w-[95vw] -translate-x-1/2 rounded-full bg-[#FFCE8F]/20 blur-[110px]" />

          {/* Gantry legs */}
          <div className="absolute inset-x-[4%] top-0 flex h-[62%] justify-between">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="w-3 rounded-sm bg-gradient-to-b from-[#B4562A] to-[#6E3319] sm:w-4"
              />
            ))}
          </div>
          {/* Top girder */}
          <div className="absolute inset-x-[4%] top-[6%] h-4 rounded-sm bg-gradient-to-b from-[#D8A33C] to-[#8E6A22] sm:h-5" />
        </>
      )}

      {solo && (
        /* Ocean glow behind the box, standing in for the 3D rim light */
        <div className="absolute left-1/2 top-1/2 h-[70%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric-400/25 blur-[70px]" />
      )}
      {solo && (
        /* Contact shadow, so the box does not read as a decal */
        <div className="absolute inset-x-[6%] bottom-[8%] h-[18%] rounded-[50%] bg-black/55 blur-2xl" />
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={reduced ? undefined : { y: [0, -10, 0], rotate: [-1.5, -0.8, -1.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ rotate: -1.5 }}
          className={solo ? 'relative w-[92%]' : 'relative w-[86vw] max-w-[34rem]'}
        >
          {!solo && (
            /* Spreader + slings */
            <div className="absolute inset-x-[10%] -top-24 h-24">
              <div className="absolute inset-x-0 top-0 h-2.5 rounded-sm bg-gradient-to-b from-[#E2B04A] to-[#9A7527]" />
              {['left-1', 'right-1'].map((pos) => (
                <span
                  key={pos}
                  className={`absolute ${pos} top-2.5 h-[5.5rem] w-px bg-gradient-to-b from-[#4A555E] to-[#2A3138]`}
                />
              ))}
            </div>
          )}

          <Box />
          {solo && (
            /* Grade the flat CSS box down toward the photograph behind it */
            <div className="pointer-events-none absolute inset-0 rounded-[5px] bg-gradient-to-tr from-base-900/55 via-transparent to-base-900/25" />
          )}
        </motion.div>
      </div>

      {!solo && (
        /* Wet apron reflection */
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0A141A] via-[#0A141A]/70 to-transparent" />
      )}
    </div>
  );
}
