// Filters, counts, urgency sort and status wording for the work queue.
// Every number shown in the UI comes from these functions — never hard-code one.
import { getStation } from './data';
import { minutesInLab } from './time';
import type { LocationType, Specimen, Station } from './types';

/* ---------- Predicates ---------- */

export const isCriticalDue = (s: Specimen) => s.status === 'critical-callback-due';
export const isStat = (s: Specimen) => s.priority === 'STAT';
export const isOverTurnaround = (s: Specimen) => s.overTurnaround;

/** A running station shows what is on it; a down station shows what is held from it. */
export function belongsToStation(s: Specimen, station: Station): boolean {
  return station.status === 'down' ? s.heldFromStationId === station.id : s.stationId === station.id;
}

/* ---------- Filters ---------- */

export type PillFilter = 'all' | 'critical' | 'stat' | 'over';
/** Either a pill, or an instrument/bench card ("station:chemA"). */
export type Filter = PillFilter | `station:${string}`;

export const stationFilter = (stationId: string): Filter => `station:${stationId}`;

export function stationFromFilter(filter: Filter): Station | undefined {
  return filter.startsWith('station:') ? getStation(filter.slice('station:'.length)) : undefined;
}

export function matchesFilter(s: Specimen, filter: Filter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'critical':
      return isCriticalDue(s);
    case 'stat':
      return isStat(s);
    case 'over':
      return isOverTurnaround(s);
    default: {
      const station = stationFromFilter(filter);
      return station ? belongsToStation(s, station) : false;
    }
  }
}

/* ---------- Counts ---------- */

export function countWhere(list: Specimen[], test: (s: Specimen) => boolean): number {
  return list.reduce((n, s) => (test(s) ? n + 1 : n), 0);
}

export function pillCounts(list: Specimen[]): Record<PillFilter, number> {
  return {
    all: list.length,
    critical: countWhere(list, isCriticalDue),
    stat: countWhere(list, isStat),
    over: countWhere(list, isOverTurnaround),
  };
}

export function stationCount(list: Specimen[], station: Station): number {
  return countWhere(list, (s) => belongsToStation(s, station));
}

export const LOCATION_GROUPS: { type: LocationType; label: string }[] = [
  { type: 'receiving', label: 'Receiving' },
  { type: 'bench', label: 'Benches' },
  { type: 'analyzer', label: 'Analyzers' },
  { type: 'fridge', label: 'Fridge' },
];

export function locationCounts(list: Specimen[]) {
  return LOCATION_GROUPS.map((g) => ({
    ...g,
    count: countWhere(list, (s) => s.locationType === g.type),
  }));
}

/* ---------- Urgency sort ---------- */

/** Lower = more urgent: critical callback due → over turnaround → STAT → everything else. */
export function urgencyRank(s: Specimen): number {
  if (isCriticalDue(s)) return 0;
  if (isOverTurnaround(s)) return 1;
  if (isStat(s)) return 2;
  return 3;
}

/** Among critical callbacks only, STAT comes before Routine (0 = first). */
function criticalStatOrder(s: Specimen): number {
  return isCriticalDue(s) && !isStat(s) ? 1 : 0;
}

/**
 * Most urgent first. Critical callbacks: STAT before Routine.
 * Ties go to whichever has been in the lab longest.
 */
export function sortByUrgency(list: Specimen[]): Specimen[] {
  return [...list].sort(
    (a, b) =>
      urgencyRank(a) - urgencyRank(b) ||
      criticalStatOrder(a) - criticalStatOrder(b) ||
      minutesInLab(b) - minutesInLab(a) ||
      a.orderId.localeCompare(b.orderId),
  );
}

/* ---------- Search ---------- */

/** Ignore case, spaces and dashes so "24118342" and "24-118342" both match. */
const normalizeOrder = (text: string) => text.toLowerCase().replace(/[^0-9a-z]/g, '');

export function findExactOrder(list: Specimen[], query: string): Specimen | undefined {
  const q = normalizeOrder(query);
  return q ? list.find((s) => normalizeOrder(s.orderId) === q) : undefined;
}

export function searchByOrder(list: Specimen[], query: string): Specimen[] {
  const q = normalizeOrder(query);
  return q ? list.filter((s) => normalizeOrder(s.orderId).includes(q)) : list;
}

/* ---------- Status wording ---------- */

export type StatusTone = 'critical' | 'warning' | 'success' | 'neutral';

const ANALYTE_SHORT: Record<string, string> = { Potassium: 'K', Hemoglobin: 'Hgb' };

const STATUS_SHORT: Record<string, string> = {
  waiting: 'Waiting',
  held: 'Held',
  testing: 'Testing',
  received: 'Received',
  prepping: 'Being prepped',
  resulted: 'Resulted',
};

export function statusText(s: Specimen): { label: string; tone: StatusTone } {
  if (s.status === 'critical-callback-due') {
    const r = s.criticalResult;
    const note = r ? `${ANALYTE_SHORT[r.analyte] ?? r.analyte} ${r.value}` : 'result';
    return { label: `Critical: ${note} · callback due`, tone: 'critical' };
  }
  if (s.status === 'callback-logged') return { label: 'Callback logged', tone: 'success' };
  if (s.overTurnaround) {
    return { label: `${STATUS_SHORT[s.status] ?? s.status} · over turnaround`, tone: 'warning' };
  }
  switch (s.status) {
    case 'waiting':
      return { label: 'Waiting on bench', tone: 'neutral' };
    case 'held':
      return { label: 'Held · instrument down', tone: 'neutral' };
    case 'resulted': {
      const verified = s.timeline.some((e) => e.type === 'verified');
      return { label: verified ? 'Resulted · verified' : 'Resulted', tone: 'success' };
    }
    default:
      return { label: STATUS_SHORT[s.status] ?? s.status, tone: 'neutral' };
  }
}

/** "Location now" column text, e.g. "Fridge 2 · held from Chem B". */
export function locationText(s: Specimen): string {
  return getStation(s.stationId)?.detail ?? s.stationId;
}
