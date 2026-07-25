import { motion } from 'framer-motion';
import { FEATURES } from '@/lib/site';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { StaggerGroup, StaggerItem } from '@/components/ui/Reveal';

/** Interactive glass card grid — each card tilts and glows toward the cursor. */
export function Features() {
  return (
    <section id="features" className="section">
      <SectionHeading
        eyebrow="Why AFRIMOS"
        title={
          <>
            Built for trade that
            <br />
            <span className="text-gradient">actually closes.</span>
          </>
        }
        description="Everything a cross-border commodity deal needs — verification, structure and visibility — in one intelligent marketplace."
      />

      <StaggerGroup className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <StaggerItem key={feature.title} className="h-full">
              <GlassCard className="h-full">
                {/* Animated icon tile */}
                <motion.div
                  whileHover={{ rotate: -8, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className={cn(
                    'relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br',
                    feature.accent
                  )}
                >
                  <Icon className="h-5 w-5 text-electric-300" strokeWidth={1.75} />
                </motion.div>

                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{feature.body}</p>

                {/* Mini illustration — a subtle signal bar chart */}
                <div className="mt-6 flex items-end gap-1" aria-hidden="true">
                  {[38, 62, 45, 78, 56, 90].map((h, i) => (
                    <motion.span
                      key={i}
                      initial={{ height: 4 }}
                      whileInView={{ height: h * 0.3 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
                      className="w-full rounded-sm bg-gradient-to-t from-white/5 to-electric-300/40 transition-colors duration-500 group-hover:to-electric-300/70"
                    />
                  ))}
                </div>
              </GlassCard>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
