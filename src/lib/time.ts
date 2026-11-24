import { demoClock } from './data';
import type { Specimen } from './types';

/** "08:42" → minutes since midnight. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** The demo clock is fixed, so durations always match the designs. */
export const demoNowMinutes = toMinutes(demoClock);

/** "In lab" = demo clock − received. */
export function minutesInLab(specimen: Specimen): number {
  return demoNowMinutes - toMinutes(specimen.receivedAt);
}
