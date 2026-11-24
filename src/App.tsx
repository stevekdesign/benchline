import { matchPath, Route, Routes, useLocation } from 'react-router';
import AppShell from './components/AppShell';
import CallbackDialog from './components/CallbackDialog';
import { openedFromQueue } from './lib/navState';
import { SpecimensProvider } from './lib/SpecimensContext';
import SpecimenTimeline from './screens/SpecimenTimeline';
import WorkQueue from './screens/WorkQueue';

const CALLBACK_PATH = '/specimen/:orderId/callback';

export default function App() {
  const location = useLocation();
  // Callback dialog opened from the work queue: keep the work queue on screen behind it.
  // (The URL is still /specimen/:orderId/callback; the page underneath is drawn as if at "/".)
  const overQueue = openedFromQueue(location.state) && matchPath(CALLBACK_PATH, location.pathname) !== null;

  return (
    <SpecimensProvider>
      <Routes location={overQueue ? '/' : location}>
        <Route element={<AppShell />}>
          <Route index element={<WorkQueue />} />
          <Route path="specimen/:orderId" element={<SpecimenTimeline />}>
            {/* Opened from the timeline: a modal on top of the timeline, which stays mounted underneath. */}
            <Route path="callback" element={<CallbackDialog />} />
          </Route>
          <Route path="*" element={<WorkQueue />} />
        </Route>
      </Routes>

      {/* Opened from the work queue: the same dialog, drawn over the work queue instead. */}
      {overQueue ? (
        <Routes>
          <Route path={CALLBACK_PATH} element={<CallbackDialog />} />
        </Routes>
      ) : null}
    </SpecimensProvider>
  );
}
