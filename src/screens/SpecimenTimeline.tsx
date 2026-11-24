// Screen 2 — Specimen timeline (route "/specimen/:orderId").
// The callback dialog (route ".../callback") opens on top of this screen.
import { useEffect, useRef } from 'react';
import { Link, Outlet, useMatch, useParams } from 'react-router';
import Footer from '../components/Footer';
import SpecimenSidePanel from '../components/SpecimenSidePanel';
import Timeline from '../components/Timeline';
import { useSpecimens } from '../lib/SpecimensContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import './SpecimenTimeline.css';

export default function SpecimenTimeline() {
  const { orderId = '' } = useParams();
  const specimen = useSpecimens().getSpecimen(orderId);
  const dialogOpen = useMatch('/specimen/:orderId/callback') !== null;
  // One place sets the tab title for this screen and its dialog, so they never fight.
  useDocumentTitle(
    !specimen ? 'Specimen not found' : dialogOpen ? 'Log critical callback' : `Specimen ${specimen.orderId}`,
  );

  // When the callback dialog closes, return focus to its trigger ("Log nurse callback"),
  // or — once logged — to the "Nurse notified" line that replaced it.
  const wasOpen = useRef(dialogOpen);
  useEffect(() => {
    if (wasOpen.current && !dialogOpen) {
      document.querySelector<HTMLElement>('.side-card--critical .btn-critical, .side-card--critical .callback-done')?.focus();
    }
    wasOpen.current = dialogOpen;
  }, [dialogOpen]);

  if (!specimen) {
    return (
      <main className="page">
        <h1 className="specimen-head__title">No specimen with order # {orderId}</h1>
        <p className="specimen-head__meta">
          Check the number, or <Link to="/">go back to the work queue</Link>.
        </p>
        <Footer />
      </main>
    );
  }

  return (
    <main className="page">
      <div className="specimen-head">
        <h1 className="specimen-head__title mono">{specimen.orderId}</h1>
        {specimen.priority === 'STAT' ? <span className="specimen-head__stat">STAT</span> : null}
        <span className="specimen-head__meta">
          {specimen.test} · {specimen.orderingUnit}
        </span>
      </div>

      <div className="specimen-layout">
        <Timeline specimen={specimen} />
        <SpecimenSidePanel specimen={specimen} />
      </div>

      <Footer />
      {/* The callback dialog renders here when the URL ends in /callback. */}
      <Outlet />
    </main>
  );
}
