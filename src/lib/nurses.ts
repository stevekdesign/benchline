// Nurse search for the callback dialog: by name or initials, ordering unit first.
import { nurses } from './data';
import type { Nurse } from './types';

/** Short unit names used on orders → the unit names in nurses.json. */
const UNIT_ALIASES: Record<string, string> = { ED: 'Emergency Dept' };

/** "ED, Bay 4" → { short: "ED", unit: "Emergency Dept" } */
export function orderingUnitOf(orderingUnit: string): { short: string; unit: string } {
  const short = orderingUnit.split(',')[0].trim();
  return { short, unit: UNIT_ALIASES[short] ?? short };
}

/** Lowercase, trimmed, accents removed — so "tomas" finds "Tomás". */
const fold = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Name contains the text, or initials start with it. Ordering unit's nurses first. */
export function matchNurses(query: string, orderingUnit: string): Nurse[] {
  const q = fold(query);
  const { unit } = orderingUnitOf(orderingUnit);
  const hits = nurses.filter((n) => !q || fold(n.name).includes(q) || fold(n.initials).startsWith(q));
  // Array sort is stable, so each group keeps the data's order.
  return [...hits].sort((a, b) => Number(b.unit === unit) - Number(a.unit === unit));
}
