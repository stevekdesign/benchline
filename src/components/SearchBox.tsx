// Header search. Typing filters the work queue table; Enter opens a single match.
import type { KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { findExactOrder, searchByOrder } from '../lib/queue';
import { useSpecimens } from '../lib/SpecimensContext';
import './SearchBox.css';

const singleMatch = <T,>(list: T[]) => (list.length === 1 ? list[0] : undefined);

interface Props {
  query: string;
  setQuery: (q: string) => void;
}

export default function SearchBox({ query, setQuery }: Props) {
  const { specimens } = useSpecimens();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function openSpecimen(orderId: string) {
    setQuery('');
    navigate(`/specimen/${orderId}`);
  }

  // Typing only filters the table; it never navigates on its own.
  function handleChange(value: string) {
    setQuery(value);
    // Partial input filters the work queue, so bring the user there.
    if (value.trim() && pathname !== '/') navigate('/');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter (or a scanner, which sends Enter after the number) opens the specimen
    // when the search points to exactly one order.
    if (event.key !== 'Enter' || !query.trim()) return;
    const target = findExactOrder(specimens, query) ?? singleMatch(searchByOrder(specimens, query));
    if (target) openSpecimen(target.orderId);
  }

  return (
    <label className="search">
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <span className="sr-only">Search specimens</span>
      <input
        type="search"
        placeholder="Scan or type order # to find a specimen"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        spellCheck={false}
      />
    </label>
  );
}
