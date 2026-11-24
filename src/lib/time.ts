import { demoClock } from './data';
import type { Specimen } from './types';

/** "08:42" → minutes since midnight. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** The demo clock is fixed, so durations always match the designs. */
export const demoNowMinutes = toMinutes(demoClock);

/** Minutes from a time ("08:21") until the demo clock. */
export function minutesAgo(hhmm: string): number {
  return demoNowMinutes - toMinutes(hhmm);
}

/** "In lab" = demo clock − received. */
export function minutesInLab(specimen: Specimen): number {
  return minutesAgo(specimen.receivedAt);
}

/** "21 min ago", or "just now" for the current minute. */
export function agoText(hhmm: string): string {
  const n = minutesAgo(hhmm);
  return n <= 0 ? 'just now' : `${n} min ago`;
}
