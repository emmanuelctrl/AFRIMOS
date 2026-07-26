import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SERVICES } from '@/lib/site';
import { cn } from '@/lib/utils';
import { EASE, viewportOnce } from '@/lib/motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DemandRings } from './DemandRings';

/** Alternating service rows that slide in from opposite sides. */
export function Services() {
  return (
    <section id="services" className="section pt-0">
      <SectionHeading
        eyebrow="How it works"
        title={
          <>
            One marketplace,
            <br />
            <span className="text-gradient">three vantage points.</span>
          </>
        }
      />

      <div className="mt-20 space-y-28">
        {SERVICES.map((service, i) => {
          const flipped = i % 2 === 1;
          return (
            <div
              key={service.index}
              className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
            >
              {/* Copy */}
              <motion.div
                initial={{ opacity: 0, x: flipped ? 48 : -48 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.9, ease: EASE }}
                className={cn(flipped && 'lg:order-2')}
              >
                <span className="font-display text-sm font-semibold tracking-[0.2em] text-electric-500">
                  {service.index}
                </span>
                <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {service.title}
                </h3>
                <p className="mt-5 text-lg leading-relaxed text-gray-400">{service.body}</p>

                <ul className="mt-8 space-y-3">
                  {service.points.map((point, pi) => (
                    <motion.li
                      key={point}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={viewportOnce}
                      transition={{ duration: 0.5, delay: 0.15 + pi * 0.08, ease: EASE }}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-electric-300/30 bg-electric-300/10">
                        <Check className="h-3 w-3 text-electric-500" strokeWidth={3} />
                      </span>
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Floating illustration */}
              <motion.div
                initial={{ opacity: 0, y: 40, rotateY: flipped ? -14 : 14 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 1, ease: EASE }}
                className={cn('perspective-1000', flipped && 'lg:order-1')}
              >
                <DemandRings variant={i} />
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
