// Small bits of router state passed between screens.

/** Set on the work queue's "Log callback" link, so the dialog knows to return there. */
export const FROM_QUEUE = { from: 'queue' } as const;

export function openedFromQueue(state: unknown): boolean {
  return (state as { from?: string } | null)?.from === 'queue';
}

/** Set when returning to the work queue, so focus goes back to that specimen's row. */
export function focusOrderState(orderId: string) {
  return { focusOrder: orderId };
}

export function focusOrderFrom(state: unknown): string | undefined {
  return (state as { focusOrder?: string } | null)?.focusOrder;
}
