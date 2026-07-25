import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/useCountUp';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

/** Number that counts up when it scrolls into view. */
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const { ref, value: current } = useCountUp(value, { decimals });

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {current.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
