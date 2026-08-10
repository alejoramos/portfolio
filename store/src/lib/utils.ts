import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currency = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatPrice = (value: number) => currency.format(value);

const currencyWithPence = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

export const formatPricePrecise = (value: number) => currencyWithPence.format(value);

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Maps a value from one range to another without clamping. */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);

export const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Resolves a path authored as "under /public" against wherever the app is
 * actually deployed. The store is served from a subdirectory of the portfolio,
 * so a bare `/assets/...` would resolve against the domain root and 404.
 * `BASE_URL` is `/` in development, so this is a no-op there.
 */
export const asset = (path: string) =>
  path.startsWith('/') ? import.meta.env.BASE_URL.replace(/\/$/, '') + path : path;
