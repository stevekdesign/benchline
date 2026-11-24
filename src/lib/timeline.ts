// Turns a specimen's timeline data into the words shown on the timeline screen.
import { getStation } from './data';
import { agoText, minutesInLab, toMinutes } from './time';
import type { CriticalResult, Specimen, TimelineEvent } from './types';

export type StepTone = 'normal' | 'critical' | 'pending';

export interface TimelineStep {
  key: string;
  title: string;
  detail: string;
  /** null for a step that hasn't happened yet. */
  at: string | null;
  tone: StepTone;
}

/** Physical scans (where the tube was handled), used for "Last scanned". */
const SCAN_TYPES = new Set(['received', 'placed', 'testing', 'moved']);

const join = (...parts: (string | undefined | null | false)[]) => parts.filter(Boolean).join(' · ');

/** "Potassium 6.8 mmol/L" */
export function resultText(r: CriticalResult): string {
  return `${r.analyte} ${r.value} ${r.unit}`;
}

/** "high" when the limit is "> 6.0", "low" when it is "< 7.0". */
function criticalDirection(r: CriticalResult): string {
  return r.criticalLimit.trim().startsWith('<') ? 'low' : 'high';
}

function describeEvent(e: TimelineEvent, s: Specimen): Omit<TimelineStep, 'key' | 'at'> {
  switch (e.type) {
    case 'collected':
      return { title: 'Collected', detail: join(e.where, e.by && `by ${e.by}`), tone: 'normal' };
    case 'received':
      return { title: 'Received in lab', detail: join(e.where, e.by && `scanned by ${e.by}`), tone: 'normal' };
    case 'placed':
      return { title: 'Placed on bench', detail: e.where, tone: 'normal' };
    case 'testing':
      return { title: 'Testing started', detail: e.where, tone: 'normal' };
    case 'moved':
      return { title: 'Moved', detail: join(e.where, e.note), tone: 'normal' };
    case 'resulted':
      if (e.critical && s.criticalResult) {
        const r = s.criticalResult;
        return {
          title: 'Resulted · critical value',
          detail: `${resultText(r)} flagged critical ${criticalDirection(r)}`,
          tone: 'critical',
        };
      }
      return { title: 'Resulted', detail: e.where, tone: 'normal' };
    case 'verified':
      return { title: 'Verified', detail: join(e.where, e.by && `by ${e.by}`), tone: 'normal' };
    case 'callback-logged':
      return {
        title: 'Nurse notified',
        detail: join(e.by && `Spoke with ${e.by}`, 'read-back confirmed'),
        tone: 'normal',
      };
    default:
      return { title: e.type, detail: join(e.where, e.note), tone: 'normal' };
  }
}

/** All steps in time order (newest at the bottom), plus a pending step while a callback is due. */
export function timelineSteps(s: Specimen): TimelineStep[] {
  const steps: TimelineStep[] = s.timeline.map((e, i) => ({
    key: `${i}-${e.type}`,
    at: e.at,
    ...describeEvent(e, s),
  }));

  if (s.status === 'critical-callback-due') {
    const resulted = [...s.timeline].reverse().find((e) => e.type === 'resulted');
    steps.push({
      key: 'pending-callback',
      title: 'Nurse notified',
      detail: join('Pending', resulted && `result posted ${agoText(resulted.at)}`),
      at: null,
      tone: 'pending',
    });
  }
  return steps;
}

/* ---------- Side panel ---------- */

export function lastScan(s: Specimen): TimelineEvent | undefined {
  return [...s.timeline].reverse().find((e) => SCAN_TYPES.has(e.type));
}

/** "Chemistry A" + "Rack 1 · position 1", or "Fridge 2" + "Shelf 1 · held from Chemistry B". */
export function whereNow(s: Specimen): { place: string; detail: string | null } {
  const station = getStation(s.stationId);
  const place = station?.name ?? s.stationId;

  let spot: string | null = null;
  if (s.position) {
    spot = s.position.replace(', ', ' · ');
  } else {
    // e.g. last scan "Fridge 2, shelf 1" → "Shelf 1"
    const where = lastScan(s)?.where ?? '';
    const prefix = `${place}, `;
    if (where.startsWith(prefix)) {
      const rest = where.slice(prefix.length);
      spot = rest.charAt(0).toUpperCase() + rest.slice(1);
    }
  }

  const heldFrom = getStation(s.heldFromStationId);
  const detail = join(spot, heldFrom && `held from ${heldFrom.name}`);
  return { place, detail: detail || null };
}

/** Received → resulted if there is a result, otherwise time in lab so far. */
export function turnaround(s: Specimen): { minutes: number; resulted: boolean } {
  const resulted = s.timeline.find((e) => e.type === 'resulted');
  if (resulted) {
    return { minutes: toMinutes(resulted.at) - toMinutes(s.receivedAt), resulted: true };
  }
  return { minutes: minutesInLab(s), resulted: false };
}
