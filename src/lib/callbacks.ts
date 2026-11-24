// Logged critical callbacks persist in localStorage (demo only).
import { demoClock } from './data';
import type { Callback, Nurse, Specimen } from './types';

const STORAGE_KEY = 'benchline.callbacks.v1';

export type LoggedCallbacks = Record<string, Callback>; // keyed by orderId

function isCallback(value: unknown): value is Callback {
  const v = value as Partial<Callback> | null;
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof v.nurseId === 'string' &&
    typeof v.nurseName === 'string' &&
    typeof v.nurseCredential === 'string' &&
    typeof v.at === 'string' &&
    v.readBack === true
  );
}

/** Reads saved callbacks, keeping only well-formed entries, so bad storage can never break the app. */
export function loadCallbacks(): LoggedCallbacks {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, cb]) => isCallback(cb)));
  } catch {
    return {};
  }
}

export function saveCallbacks(callbacks: LoggedCallbacks): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(callbacks));
  } catch {
    // Storage unavailable (private mode etc.) — the demo still works for this visit.
  }
}

export function clearCallbacks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** The call time is the demo clock, logged automatically. Read-back is required to log at all. */
export function newCallback(nurse: Nurse): Callback {
  return {
    nurseId: nurse.id,
    nurseName: nurse.name,
    nurseCredential: nurse.credential,
    at: demoClock,
    readBack: true,
  };
}

/** "Maria Alvarez, RN" */
export const nurseLabel = (cb: Callback) => `${cb.nurseName}, ${cb.nurseCredential}`;

/** Merge logged callbacks into the base data: clears the critical status and adds a timeline event. */
export function applyCallbacks(list: Specimen[], callbacks: LoggedCallbacks): Specimen[] {
  return list.map((s) => {
    const cb = callbacks[s.orderId];
    if (!cb || s.status !== 'critical-callback-due') return s;
    return {
      ...s,
      status: 'callback-logged',
      callback: cb,
      timeline: [
        ...s.timeline,
        { type: 'callback-logged', at: cb.at, where: s.orderingUnit, by: nurseLabel(cb) },
      ],
    };
  });
}
