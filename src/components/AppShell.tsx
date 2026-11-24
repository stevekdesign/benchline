// Layout shared by every screen: header on top, the screen below.
// Holds the search text and active filter so they survive a trip to a timeline and back.
import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router';
import type { Filter } from '../lib/queue';
import { useSpecimens } from '../lib/SpecimensContext';
import SearchBox from './SearchBox';
import './AppShell.css';

export interface ShellState {
  query: string;
  setQuery: (q: string) => void;
  filter: Filter;
  setFilter: (f: Filter) => void;
  /** Puts the whole demo back to what a first-time visitor sees. */
  resetDemo: () => void;
}

export function useShell() {
  return useOutletContext<ShellState>();
}

export default function AppShell() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  // Bumped on every reset; used as a key so the screen remounts with fresh state and scroll.
  const [resetCount, setResetCount] = useState(0);
  const { resetDemo: clearLoggedCallbacks } = useSpecimens();
  const navigate = useNavigate();
  // Work queue shows search; specimen screens show a way back instead (per the designs).
  const onWorkQueue = useLocation().pathname === '/';
  const focusAfterReset = useRef(false);

  function resetDemo() {
    clearLoggedCallbacks();
    setQuery('');
    setFilter('all');
    setResetCount((n) => n + 1);
    focusAfterReset.current = true;
    navigate('/');
  }

  // Once the work queue is showing after a reset: back to the top, and move focus to the
  // page title so keyboard and screen-reader users aren't left on a button that's gone.
  useEffect(() => {
    if (!focusAfterReset.current || !onWorkQueue) return;
    focusAfterReset.current = false;
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>('main h1')?.focus();
  }, [resetCount, onWorkQueue]);

  return (
    <div className="shell">
      <header className="app-header">
        <Link to="/" className="app-logo">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3h6" />
            <path d="M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3" />
          </svg>
          Benchline
        </Link>
        {onWorkQueue ? (
          <SearchBox query={query} setQuery={setQuery} />
        ) : (
          <Link to="/" className="back-link">
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to work queue
          </Link>
        )}
        <span className="app-user">
          Core Lab · Day shift · <strong>K. Lee, CLS</strong>
        </span>
      </header>
      <p className="sr-only" role="status">
        {resetCount > 0 ? 'Demo reset' : ''}
      </p>
      <Outlet key={resetCount} context={{ query, setQuery, filter, setFilter, resetDemo } satisfies ShellState} />
    </div>
  );
}
