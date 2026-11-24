// Screen 3 — Log critical callback (route "/specimen/:orderId/callback"), a modal over the timeline.
// Uses the native <dialog> in modal mode: the page behind is inert, Esc closes it.
// On top of that, Tab is looped inside the dialog so focus can never leave it.
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { focusOrderState, openedFromQueue } from '../lib/navState';
import { demoClock } from '../lib/data';
import { useSpecimens } from '../lib/SpecimensContext';
import { resultText } from '../lib/timeline';
import type { Nurse } from '../lib/types';
import NursePicker from './NursePicker';
import './CallbackDialog.css';

const FOCUSABLE = 'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export default function CallbackDialog() {
  const { orderId = '' } = useParams();
  const { getSpecimen, logCallback } = useSpecimens();
  const specimen = getSpecimen(orderId);
  const navigate = useNavigate();

  // Decided once when the dialog opens, so the success view stays up after the status clears.
  const [canLog] = useState(() => specimen?.status === 'critical-callback-due');
  const [picked, setPicked] = useState<Nurse | null>(null);
  const [readBack, setReadBack] = useState(false);
  const [done, setDone] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const timelinePath = `/specimen/${orderId}`;
  // Return where the dialog was opened from: the work queue, or the timeline.
  // "replace" swaps out the dialog's history entry, so the browser's Back button won't reopen it.
  const fromQueue = openedFromQueue(useLocation().state);
  const close = () =>
    fromQueue
      ? navigate('/', { replace: true, state: focusOrderState(orderId) })
      : navigate(timelinePath, { replace: true });

  // Open as a modal, focus the nurse search, and stop the page behind from scrolling.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    document.getElementById('nurse-search')?.focus();
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, []);

  // After logging, move focus to the success message so it's announced.
  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  if (!specimen || !specimen.criticalResult || !canLog) {
    // Nothing to log (no critical result, or already logged): go back to the timeline.
    return <Navigate to={timelinePath} replace />;
  }

  const ready = picked !== null && readBack;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!picked || !readBack || !specimen) return;
    logCallback(specimen.orderId, picked);
    setDone(true);
  }

  // Loop Tab / Shift+Tab inside the dialog.
  function trapTab(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const items = [...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="callback-dialog"
      aria-labelledby="callback-title"
      aria-describedby="callback-subtitle"
      onCancel={(e) => {
        // Esc: let the route decide what's open, so close by navigating.
        e.preventDefault();
        close();
      }}
      onKeyDown={trapTab}
    >
      <div className="callback-dialog__head">
        <div className="callback-dialog__titles">
          <h2 id="callback-title">Log critical callback</h2>
          <span id="callback-subtitle" className="callback-dialog__subtitle">
            <span className="mono">{specimen.orderId}</span> · {specimen.orderingUnit} ·{' '}
            <strong>{resultText(specimen.criticalResult)}</strong>
          </span>
        </div>
        <button type="button" className="callback-dialog__close" aria-label="Close" onClick={close}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {done && picked ? (
        <div className="callback-success">
          <span className="callback-success__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
          <h3 ref={successRef} tabIndex={-1}>
            Callback logged
          </h3>
          <p>
            Spoke with {picked.name}, {picked.credential} ({picked.initials}) at{' '}
            <span className="mono">{demoClock}</span>. Read-back confirmed. Added to the specimen timeline.
          </p>
          <button type="button" className="btn-primary" onClick={close}>
            {fromQueue ? 'Back to work queue' : 'Back to specimen'}
          </button>
        </div>
      ) : (
        <form className="callback-form" onSubmit={handleSubmit}>
          <NursePicker
            inputId="nurse-search"
            orderingUnit={specimen.orderingUnit}
            picked={picked}
            onPick={setPicked}
          />

          {/* Explicitly connected (htmlFor + id) as well as wrapping, so the whole row is clickable. */}
          <label className="readback" htmlFor="readback-check">
            <input
              id="readback-check"
              type="checkbox"
              required
              checked={readBack}
              onChange={(e) => setReadBack(e.target.checked)}
            />
            Nurse read the result back to me
          </label>

          <div className="call-time">
            <span>Time of call</span>
            <span className="mono">{demoClock} · logged automatically</span>
          </div>

          <button type="submit" className="callback-submit" disabled={!ready}>
            {picked ? `Log callback to ${picked.name}` : 'Choose who you spoke with'}
          </button>
        </form>
      )}
    </dialog>
  );
}
