import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names, resolving conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number between a lower and upper bound. */
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/** Linear interpolation. */
export const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

/** Map a value from one range into another. */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin || 1);

/** Format large numbers compactly (12400 -> "12.4K"). */
export const formatCompact = (value: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
