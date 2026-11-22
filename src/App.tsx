import { Route, Routes } from 'react-router';

// Placeholder only — screens are built one at a time in src/screens/.
function Placeholder() {
  return (
    <main style={{ padding: 'var(--page-padding)' }}>
      <h1 style={{ fontSize: 'var(--font-size-title)', fontWeight: 700, margin: 0 }}>Benchline</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>Project setup complete. Screens coming next.</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Placeholder />} />
    </Routes>
  );
}
