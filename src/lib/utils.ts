import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function formatDate(date: Date | string | null | undefined, locale: string): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

/** yyyy-mm-dd, the value format of <input type="date">. */
export const isoDate = (date: Date | null | undefined) => (date ? date.toISOString().slice(0, 10) : '');

export const pct = (part: number, total: number) => (total === 0 ? 0 : Math.round((part / total) * 100));
