// Instrument & bench cards. Each is a toggle filter (aria-pressed).
// A down instrument (Chemistry B) filters to specimens held from it.
import { getStation } from '../lib/data';
import { stationCount, stationFilter, type Filter } from '../lib/queue';
import type { Specimen, Station } from '../lib/types';
import './StationCards.css';

/** Which stations get a card, in display order. */
const CARD_STATION_IDS = ['chemA', 'chemB', 'heme', 'bf'];

type Tone = 'ok' | 'down' | 'busy';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

function describe(station: Station, specimens: Specimen[]): { tone: Tone; line: string } {
  const n = stationCount(specimens, station);
  if (station.status === 'down') {
    const heldAt = getStation(specimens.find((s) => s.heldFromStationId === station.id)?.stationId);
    const where = heldAt ? ` in ${heldAt.name}` : '';
    return { tone: 'down', line: `Down since ${station.downSince} · ${n} held${where}` };
  }
  if (station.type === 'bench') return { tone: 'busy', line: `Busy · ${n} waiting` };
  return { tone: 'ok', line: `Running · ${plural(n, 'specimen')}` };
}

interface Props {
  specimens: Specimen[];
  filter: Filter;
  setFilter: (f: Filter) => void;
}

export default function StationCards({ specimens, filter, setFilter }: Props) {
  const cards = CARD_STATION_IDS.map(getStation).filter((s): s is Station => Boolean(s));
  return (
    <section className="stations" aria-labelledby="stations-title">
      <h2 id="stations-title" className="eyebrow">
        Instruments &amp; benches · select one to filter the list
      </h2>
      <div className="stations__grid">
        {cards.map((station) => {
          const { tone, line } = describe(station, specimens);
          const key = stationFilter(station.id);
          const active = filter === key;
          return (
            <button
              key={station.id}
              type="button"
              className={`station-card station-card--${tone}`}
              // Starts with the visible text (station + status line), then says what it does.
              // aria-pressed tells assistive tech whether this filter is on.
              aria-label={`${station.name}: ${line}. Filter the specimen list`}
              aria-pressed={active}
              onClick={() => setFilter(active ? 'all' : key)}
            >
              <span className="station-card__name">{station.name}</span>
              <span className="station-card__line">
                <span className="station-card__dot" aria-hidden="true" />
                {/* Non-breaking space keeps each "·" with the word before it when the line wraps. */}
                <span className="station-card__text">{line.replace(/ · /g, ' · ')}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
