import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/site';
import { Marquee } from '@/components/ui/Marquee';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Infinite dual-row testimonial marquee; pauses on hover. */
export function Testimonials() {
  const firstRow = TESTIMONIALS;
  const secondRow = [...TESTIMONIALS].reverse();

  return (
    <section id="testimonials" className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Trusted by traders"
          title={
            <>
              Exporters and buyers,
              <br />
              <span className="text-gradient">in their own words.</span>
            </>
          }
          align="center"
        />
      </div>

      <div className="mt-16 space-y-6">
        <Marquee speed={52}>
          {firstRow.map((t) => (
            <TestimonialCard key={`a-${t.name}`} {...t} />
          ))}
        </Marquee>
        <Marquee speed={64} reverse>
          {secondRow.map((t) => (
            <TestimonialCard key={`b-${t.name}`} {...t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <figure className="group relative w-[21rem] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] sm:w-[24rem]">
      <span
        aria-hidden="true"
        className="gradient-border pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <Quote className="h-6 w-6 text-cyan-400/50" />
      <blockquote className="mt-4 text-sm leading-relaxed text-gray-300">{quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand font-display text-sm font-semibold text-base-900">
          {name.charAt(0)}
        </span>
        <span>
          <span className="block text-sm font-medium text-white">{name}</span>
          <span className="block text-xs text-gray-500">{role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
