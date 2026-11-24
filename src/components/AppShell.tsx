// Layout shared by every screen: header on top, the screen below.
// Holds the search text and active filter so they survive a trip to a timeline and back.
import { useState } from 'react';
import { Link, Outlet, useOutletContext } from 'react-router';
import type { Filter } from '../lib/queue';
import SearchBox from './SearchBox';
import './AppShell.css';

export interface ShellState {
  query: string;
  setQuery: (q: string) => void;
  filter: Filter;
  setFilter: (f: Filter) => void;
}

export function useShell() {
  return useOutletContext<ShellState>();
}

export default function AppShell() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

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
        <SearchBox query={query} setQuery={setQuery} />
        <span className="app-user">
          Core Lab · Day shift · <strong>K. Lee, CLS</strong>
        </span>
      </header>
      <Outlet context={{ query, setQuery, filter, setFilter } satisfies ShellState} />
    </div>
  );
}
