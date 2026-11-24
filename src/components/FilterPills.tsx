// All / Critical callback / STAT / Over turnaround, each with a derived count.
import { pillCounts, type Filter, type PillFilter } from '../lib/queue';
import type { Specimen } from '../lib/types';
import './FilterPills.css';

const PILLS: { key: PillFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical callback' },
  { key: 'stat', label: 'STAT' },
  { key: 'over', label: 'Over turnaround' },
];

interface Props {
  specimens: Specimen[];
  filter: Filter;
  setFilter: (f: Filter) => void;
}

export default function FilterPills({ specimens, filter, setFilter }: Props) {
  const counts = pillCounts(specimens);
  return (
    // Counts always cover every specimen (not just the current search), and the label says so.
    <div role="group" aria-label={`Filter. Counts include all ${specimens.length} specimens`} className="pills">
      {PILLS.map((p) => (
        <button
          key={p.key}
          type="button"
          className={`pill${p.key === 'critical' ? ' pill--critical' : ''}`}
          aria-pressed={filter === p.key}
          onClick={() => setFilter(p.key)}
        >
          {p.label} · {counts[p.key]}
        </button>
      ))}
    </div>
  );
}
