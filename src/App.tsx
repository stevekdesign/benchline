import { Route, Routes } from 'react-router';
import AppShell from './components/AppShell';
import { SpecimensProvider } from './lib/SpecimensContext';
import SpecimenPlaceholder from './screens/SpecimenPlaceholder';
import WorkQueue from './screens/WorkQueue';

export default function App() {
  return (
    <SpecimensProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<WorkQueue />} />
          <Route path="specimen/:orderId" element={<SpecimenPlaceholder />} />
          <Route path="specimen/:orderId/callback" element={<SpecimenPlaceholder />} />
          <Route path="*" element={<WorkQueue />} />
        </Route>
      </Routes>
    </SpecimensProvider>
  );
}
