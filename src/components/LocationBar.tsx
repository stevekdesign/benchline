// "Where the N active specimens are" — segment sizes and counts from the data.
import { locationCounts } from '../lib/queue';
import type { LocationType, Specimen } from '../lib/types';
import './LocationBar.css';

const TINT: Record<LocationType, string> = {
  receiving: 'var(--color-brand-tint-1)',
  bench: 'var(--color-brand-tint-2)',
  analyzer: 'var(--color-brand-tint-3)',
  fridge: 'var(--color-brand-tint-4)',
};

export default function LocationBar({ specimens }: { specimens: Specimen[] }) {
  const groups = locationCounts(specimens);
  return (
    <section className="card location-bar" aria-labelledby="where-title">
      <div className="location-bar__head">
        <h2 id="where-title">Where the {specimens.length} active specimens are</h2>
        <span className="location-bar__note">Updated on every scan</span>
      </div>
      <div className="location-bar__track" aria-hidden="true">
        {groups
          .filter((g) => g.count > 0)
          .map((g) => (
            <div key={g.type} style={{ flex: `${g.count} 1 0`, background: TINT[g.type] }} />
          ))}
      </div>
      <ul className="location-bar__legend">
        {groups.map((g) => (
          <li key={g.type}>
            <span className="location-bar__dot" style={{ background: TINT[g.type] }} aria-hidden="true" />
            {g.label} <strong>{g.count}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
