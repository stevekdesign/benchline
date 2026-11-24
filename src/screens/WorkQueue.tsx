// Screen 1 — Work queue (route "/").
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useShell } from '../components/AppShell';
import FilterPills from '../components/FilterPills';
import Footer from '../components/Footer';
import LocationBar from '../components/LocationBar';
import SpecimenTable from '../components/SpecimenTable';
import SearchStatus from '../components/SearchStatus';
import StationCards from '../components/StationCards';
import { focusOrderFrom } from '../lib/navState';
import { matchesFilter, searchByOrder, sortByUrgency, stationFromFilter, type Filter } from '../lib/queue';
import { useSpecimens } from '../lib/SpecimensContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import './WorkQueue.css';

const PILL_TITLES: Record<string, string> = {
  all: 'All active specimens',
  critical: 'Critical results awaiting callback',
  stat: 'STAT specimens',
  over: 'Over turnaround time',
};

function listTitle(filter: Filter): string {
  const station = stationFromFilter(filter);
  if (!station) return PILL_TITLES[filter] ?? PILL_TITLES.all;
  if (station.status === 'down') return `Held from ${station.name}`;
  if (station.type === 'bench') return `On the ${station.name.toLowerCase()}`;
  return `On ${station.name}`;
}

export default function WorkQueue() {
  useDocumentTitle('Work queue');
  const { specimens } = useSpecimens();
  const { query, setQuery, filter, setFilter } = useShell();
  const location = useLocation();
  const navigate = useNavigate();

  const searchText = query.trim();
  const rows = sortByUrgency(searchByOrder(specimens.filter((s) => matchesFilter(s, filter)), query));
  const emptyMessage = searchText
    ? `No specimens in this list match “${searchText}”.`
    : 'No specimens in this list right now.';

  function clearSearch() {
    setQuery('');
    document.querySelector<HTMLInputElement>('.app-header input[type="search"]')?.focus();
  }

  // Back from the callback dialog: return focus to that specimen's row —
  // its "Log callback" button, or its order # once the callback is logged.
  useEffect(() => {
    const orderId = focusOrderFrom(location.state);
    if (!orderId) return;
    const row = document.querySelector(`tr[data-order-id="${CSS.escape(orderId)}"]`);
    const target =
      row?.querySelector<HTMLElement>('.btn-callback') ??
      row?.querySelector<HTMLElement>('.order-link') ??
      document.querySelector<HTMLElement>('main h1');
    target?.focus();
    navigate('.', { replace: true, state: null }); // don't refocus on reload
  }, [location.state, navigate]);

  return (
    <main className="page work-queue">
      <LocationBar specimens={specimens} />
      <StationCards specimens={specimens} filter={filter} setFilter={setFilter} />

      <div className="work-queue__list-head">
        <div className="work-queue__title">
          {/* tabIndex -1: focusable from code (after "Reset demo"), not in the Tab order. */}
          <div className="work-queue__title-row">
            <h1 tabIndex={-1}>{listTitle(filter)}</h1>
            {searchText ? (
              <SearchStatus query={searchText} matches={rows.length} total={specimens.length} onClear={clearSearch} />
            ) : null}
          </div>
          <p>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h13M3 12h9M3 18h5" />
              <path d="M18 9v12M15 18l3 3 3-3" />
            </svg>
            Sorted most urgent first · filters overlap, so one specimen can be both STAT and awaiting a callback
          </p>
        </div>
        <FilterPills specimens={specimens} filter={filter} setFilter={setFilter} />
      </div>

      <p className="sr-only" aria-live="polite">
        {rows.length} {rows.length === 1 ? 'specimen' : 'specimens'} shown
      </p>
      <SpecimenTable rows={rows} emptyMessage={emptyMessage} />

      <Footer
        extra={`Every count on this screen is calculated from the same ${specimens.length} specimens.`}
      />
    </main>
  );
}
