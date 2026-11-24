// Logged critical callbacks persist in localStorage (demo only).
import { demoClock } from './data';
import type { Callback, Specimen } from './types';

const STORAGE_KEY = 'benchline.callbacks.v1';

export type LoggedCallbacks = Record<string, Callback>; // keyed by orderId

export function loadCallbacks(): LoggedCallbacks {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoggedCallbacks) : {};
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

export function newCallback(nurseId: string, nurseName: string): Callback {
  return { nurseId, nurseName, at: demoClock, readBack: true };
}

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
        { type: 'callback-logged', at: cb.at, where: s.orderingUnit, by: cb.nurseName },
      ],
    };
  });
}
