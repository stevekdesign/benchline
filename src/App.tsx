import { Route, Routes } from 'react-router';
import AppShell from './components/AppShell';
import CallbackDialog from './components/CallbackDialog';
import { SpecimensProvider } from './lib/SpecimensContext';
import SpecimenTimeline from './screens/SpecimenTimeline';
import WorkQueue from './screens/WorkQueue';

export default function App() {
  return (
    <SpecimensProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<WorkQueue />} />
          <Route path="specimen/:orderId" element={<SpecimenTimeline />}>
            {/* Opens as a modal on top of the timeline, which stays mounted underneath. */}
            <Route path="callback" element={<CallbackDialog />} />
          </Route>
          <Route path="*" element={<WorkQueue />} />
        </Route>
      </Routes>
    </SpecimensProvider>
  );
}
