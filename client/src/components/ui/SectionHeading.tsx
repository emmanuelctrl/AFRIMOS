import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './Reveal';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

/** Eyebrow + title + description, revealed on scroll. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-electric-500">
            <span className="h-px w-6 bg-gradient-to-r from-electric-300 to-transparent" />
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2 className="font-display text-[2.5rem] font-semibold leading-[1.05] tracking-tighter text-espresso-900 sm:text-5xl lg:text-[3.5rem]">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.12}>
          <p className="mt-5 text-lg leading-relaxed text-espresso-600">{description}</p>
        </Reveal>
      )}
    </div>
  );
}
