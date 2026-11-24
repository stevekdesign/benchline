// Shown next to the list title while a search filters the table:
// "3 matches for “1183” · filter counts include all 42 · Clear search"
import './SearchStatus.css';

interface Props {
  query: string;
  matches: number;
  total: number;
  onClear: () => void;
}

export default function SearchStatus({ query, matches, total, onClear }: Props) {
  return (
    <p className="search-status">
      <span className="search-status__count">
        {matches} {matches === 1 ? 'match' : 'matches'} for “
        <span className="search-status__query" title={query}>
          {query}
        </span>
        ”
      </span>
      <span className="search-status__note"> · filter counts include all {total}</span>
      <button type="button" className="search-status__clear" onClick={onClear}>
        Clear search
      </button>
    </p>
  );
}
