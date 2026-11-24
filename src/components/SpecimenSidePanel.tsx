// Side panel on the timeline: where it is now, critical result (if any), turnaround.
import { Link } from 'react-router';
import { nurseLabel } from '../lib/callbacks';
import { agoText } from '../lib/time';
import { lastScan, resultText, turnaround, whereNow } from '../lib/timeline';
import type { Specimen } from '../lib/types';
import './SpecimenSidePanel.css';

export default function SpecimenSidePanel({ specimen }: { specimen: Specimen }) {
  return (
    <aside className="side-panel">
      <WhereNowCard specimen={specimen} />
      {specimen.criticalResult ? <CriticalResultCard specimen={specimen} /> : null}
      <TurnaroundCard specimen={specimen} />
    </aside>
  );
}

function WhereNowCard({ specimen }: { specimen: Specimen }) {
  const { place, detail } = whereNow(specimen);
  const scan = lastScan(specimen);
  return (
    <section className="card side-card" aria-labelledby="where-now-title">
      <h2 id="where-now-title" className="eyebrow">
        Where it is now
      </h2>
      <span className="side-card__place">{place}</span>
      {detail ? <span className="side-card__spot">{detail}</span> : null}
      {scan ? (
        <span className="side-card__note">
          Last scanned <span className="mono">{scan.at}</span> · {agoText(scan.at)}
        </span>
      ) : null}
    </section>
  );
}

function CriticalResultCard({ specimen }: { specimen: Specimen }) {
  const r = specimen.criticalResult!;
  const cb = specimen.callback;
  return (
    <section className="side-card side-card--critical" aria-labelledby="critical-title">
      <h2 id="critical-title" className="eyebrow eyebrow--critical">
        Critical result
      </h2>
      <div className="critical-value">
        <span>{r.analyte}</span>
        <strong>{r.value}</strong>
        <span>{r.unit}</span>
      </div>
      <span className="critical-limit">
        Critical limit {r.criticalLimit} · ordered by {specimen.orderingUnit}
      </span>
      {cb ? (
        // tabIndex -1: focus lands here when the callback dialog closes after logging.
        <p className="callback-done" tabIndex={-1}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
          <span>
            Nurse notified at <span className="mono">{cb.at}</span> · {nurseLabel(cb)}
          </span>
        </p>
      ) : (
        <Link
          to={`/specimen/${specimen.orderId}/callback`}
          className="btn-critical"
          aria-label={`Log nurse callback for ${resultText(r)}`}
        >
          Log nurse callback
        </Link>
      )}
    </section>
  );
}

function TurnaroundCard({ specimen }: { specimen: Specimen }) {
  const t = turnaround(specimen);
  return (
    <section className="card side-card side-card--tight" aria-labelledby="tat-title">
      <h2 id="tat-title" className="eyebrow">
        Turnaround
      </h2>
      <span className="side-card__tat">
        <strong>{t.minutes} min</strong> {t.resulted ? 'received → resulted' : 'in lab so far'}
        {!t.resulted && specimen.overTurnaround ? (
          <span className="side-card__over"> · over turnaround</span>
        ) : null}
      </span>
      <span className="side-card__body">No paper log needed: times are captured on every scan</span>
    </section>
  );
}
