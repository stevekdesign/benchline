// "Who did you speak with?" — autocomplete by name or initials, ordering unit first.
// Keyboard: type to filter, ↑/↓ to move, Enter to pick. Mouse: click a row.
import { useEffect, useId, useState, type KeyboardEvent } from 'react';
import { matchNurses, orderingUnitOf } from '../lib/nurses';
import type { Nurse } from '../lib/types';
import ScrollPanel from './ScrollPanel';
import './NursePicker.css';

interface Props {
  inputId: string;
  orderingUnit: string;
  picked: Nurse | null;
  onPick: (nurse: Nurse | null) => void;
}

export default function NursePicker({ inputId, orderingUnit, picked, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const listId = useId();
  // Plain, predictable ids derived from the input's id, so label ↔ input is easy to verify.
  const labelId = `${inputId}-label`;
  const hintId = `${inputId}-hint`;
  const matches = matchNurses(query, orderingUnit);
  const optionId = (n: Nurse) => `${listId}-${n.id}`;
  const activeNurse = active >= 0 ? matches[active] : undefined;

  // Keep the highlighted row visible when moving with the arrow keys.
  useEffect(() => {
    if (activeNurse) document.getElementById(optionId(activeNurse))?.scrollIntoView({ block: 'nearest' });
  });

  function pick(nurse: Nurse) {
    onPick(nurse);
    setQuery(nurse.name);
    setActive(-1);
  }

  function handleChange(value: string) {
    setQuery(value);
    onPick(null); // typing again un-picks, as in the design
    setActive(value.trim() ? 0 : -1);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(matches.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault(); // never submit the form from the search box
      if (activeNurse) pick(activeNurse);
    }
  }

  const { short } = orderingUnitOf(orderingUnit);

  return (
    <div className="nurse-picker">
      <label htmlFor={inputId} id={labelId} className="nurse-picker__label">
        Who did you speak with?
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-labelledby={labelId}
        aria-expanded="true"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeNurse ? optionId(activeNurse) : undefined}
        aria-describedby={hintId}
        autoComplete="off"
        spellCheck={false}
        placeholder="Type a name or initials"
        className="nurse-picker__input"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <span id={hintId} className="nurse-picker__hint">
        Nurses on the ordering unit ({short}) are listed first
      </span>

      {/* Same floating scrollbar as the work queue table. Not a focusable region:
          the list is already operated from the search box (↑/↓, Enter). */}
      <ScrollPanel className="nurse-picker__box" viewportClassName="nurse-picker__viewport">
        <ul role="listbox" id={listId} aria-label="Matching nurses" className="nurse-picker__list">
          {matches.map((n, i) => {
            const selected = picked?.id === n.id;
            return (
              <li key={n.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  id={optionId(n)}
                  // Starts with the visible name; selected state comes from aria-selected.
                  aria-label={`${n.name}, ${n.credential}, initials ${n.initials}, ${n.unit}`}
                  aria-selected={selected}
                  tabIndex={-1}
                  className={`nurse-option${i === active ? ' nurse-option--active' : ''}`}
                  // Keep focus in the search box so typing and arrows keep working.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(n)}
                >
                  <span className="nurse-option__avatar" aria-hidden="true">
                    {n.initials}
                  </span>
                  <span className="nurse-option__text">
                    <span className="nurse-option__name">
                      {n.name}, {n.credential}
                    </span>
                    <span className="nurse-option__meta">
                      Initials {n.initials} · {n.unit}
                    </span>
                  </span>
                  {selected ? (
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nurse-option__check">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        {matches.length === 0 ? (
          <p className="nurse-picker__empty">No match. Check spelling, or add a name manually.</p>
        ) : null}
      </ScrollPanel>
      <p className="sr-only" aria-live="polite">
        {matches.length} {matches.length === 1 ? 'nurse' : 'nurses'} found
      </p>
    </div>
  );
}
