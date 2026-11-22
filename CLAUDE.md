# Benchline — Lab Specimen Tracker (portfolio prototype)

## What this is
A working web prototype for a portfolio case study. Concept: **every specimen gets a live timeline**.
Clinical Lab Scientists (CLS) in a hospital lab lose time because their legacy system:
1. doesn't show where a specimen physically is (they hunt for tubes by order number),
2. doesn't timestamp steps (they keep times on paper),
3. makes them type nurse names and initials by hand when logging critical-result callbacks.

Benchline solves those three problems in three screens. It is a **demo**: all data is fictional
sample data. Never add real patient, staff or hospital data, and never add analytics or tracking.

## Tech stack
- Vite + React + TypeScript
- React Router for screens (URLs below)
- Plain CSS with design tokens as CSS custom properties in `src/styles/tokens.css`. No UI library, no Tailwind.
- Fonts: Inter (UI) and IBM Plex Mono (order numbers, times, durations) from Google Fonts
- Deploys to Vercel. Include `vercel.json` with a rewrite of all paths to `/index.html` so deep links work.
- No backend, no API keys. State lives in React (context) and logged callbacks persist in `localStorage`.

## Commands
- `npm install` — install dependencies
- `npm run dev` — local dev server
- `npm run build` — production build (must pass before every commit)

## Source of truth
- `design-reference/` holds the approved designs as HTML (`work-queue.html`, `specimen-timeline.html`,
  `critical-callback.html`). They use a design-tool syntax (`<x-dc>`, `{{ }}` holes, `<sc-for>`), so do not
  copy that syntax. Match their **layout, spacing, colors, type and copy** exactly. If a design and this
  file disagree, this file wins; ask me if unsure.
- `src/data/specimens.json` (42 specimens, stations, demo clock) and `src/data/nurses.json` are the only data.

## Screens and routes
1. `/` — **Work queue**
   - Header: Benchline logo, search ("Scan or type order # to find a specimen"), "Core Lab · Day shift · K. Lee, CLS".
   - "Where the 42 active specimens are" bar: Receiving / Benches / Analyzers / Fridge, segment sizes and counts from data.
   - Instrument & bench cards (Chemistry A, Chemistry B, Hematology 1, Body fluids bench) are **toggle filters**
     (`aria-pressed`). Chemistry B is down: its card filters to specimens held from it.
   - Filter pills: All, Critical callback, STAT, Over turnaround, each with a derived count. Filters overlap.
   - Specimen table (see Table rules). Row order: most urgent first. Clicking an order # opens its timeline.
   - Search: typing or scanning an exact order # jumps to that specimen; partial input filters the table.
2. `/specimen/:orderId` — **Specimen timeline**
   - Timeline of events from data, newest at the bottom, each with time and place.
   - Side panel: "Where it is now", critical result card (if any) with "Log nurse callback", turnaround.
   - Pending callback shows as a dashed step until logged.
3. `/specimen/:orderId/callback` — **Log critical callback** (modal dialog over the timeline)
   - Autocomplete nurse search by name or initials; ordering unit's nurses listed first.
   - "Nurse read the result back to me" checkbox (required). Time is the demo clock, logged automatically.
   - Submit is disabled until a nurse is picked and read-back is checked; label says who ("Log callback to Maria Alvarez").
   - On submit: add a `callback-logged` event to the timeline, clear the critical-callback status, update every
     count on the work queue, show the success state, then return to the timeline.
   - Esc and the close button return to the timeline. Focus moves into the dialog and is trapped while open.

## Data rules (important)
- **Every count is derived from the data. Never hard-code a number** in UI (filter counts, location totals,
  instrument counts, "42 active", etc.).
- Time is a **demo clock** fixed at `demoClock` (08:42) so durations always match. "In lab" = demo clock − received.
- Urgency sort: critical callback due → over turnaround → STAT → everything else; ties by longest in lab first.
- Logged callbacks persist in `localStorage`. Add a small "Reset demo" link in the footer that clears it.
- Footer note on every screen: "Sample data only. No real patients or orders."

## Design tokens
- Background `#F6F7F9`, surface `#FFFFFF`, border `#E2E8F0`, input border `#CBD5E1`
- Text `#0F172A`, secondary text `#475569`, body-strong `#334155`
- Brand / primary `#0F766E` (hover `#134E4A`), brand tints for the location bar: `#99F6E4`, `#2DD4BF`, `#0F766E`, `#134E4A`
- Critical: text `#991B1B`/`#7F1D1D`, surface `#FEF2F2`, border `#FECACA`, button `#B91C1C`
- Warning / over turnaround text `#92400E`, STAT badge text `#9A3412` on `#FFEDD5`
- Success text `#166534` on `#DCFCE7`
- Zebra row `#EBEEF3`
- Radius: 12px cards, 10px inputs/buttons, 8px small buttons, 999px pills
- Spacing: multiples of 4px; page padding 32px; section gap 20px
- Type: 24px page title (700), 15–17px section titles (600), 14px body and table, 12–13px labels.
  Uppercase table headers 12px, letter-spacing 0.05em.

## Layout rules
- **App shell:** header and controls stay put; only the table region scrolls (fixed height panel, about 472px at 1440×980).
  The page itself should not need to scroll at desktop size. No layout shift when content changes.
- Max content width 1376px, centered. Desktop first (1280–1440), but nothing breaks at narrower widths:
  card grids wrap, the table scrolls horizontally inside its panel.

## Table rules
- `table-layout: fixed`. Short, fixed-format columns get minimal fixed widths:
  Order # 112px, Priority 104px, Received 104px, In lab 88px, Action 116px (tight padding).
  Test, Location now and Status share the remaining width.
- Column widths never change when filtering. Truncate overflow with an ellipsis and show the full text in a tooltip (`title`).
- Times and durations use tabular numbers.
- Sticky header row inside the scrolling panel. Show a "Sorted most urgent first" label near the list title.
- Zebra striping (alternate rows `#EBEEF3`), no row divider lines. Critical rows use `#FEF2F2` instead of the stripe.
  Stripes follow the visible order, so they restart when the filter changes.

## Accessibility
- Real `<button>`, `<a>`, `<input>` + `<label>`; never clickable divs.
- Text contrast at least 4.5:1. Status is never shown by color alone (text labels always present).
- Visible keyboard focus on everything interactive. Targets at least 44px, except compact in-table buttons (36px).
- Dialog: `role="dialog"`, labelled title, focus trap, Esc to close, focus returns to the trigger.
- Respect `prefers-reduced-motion` for any animation.

## How to work with me
- I'm a product designer. Explain what you're doing in plain language and keep changes small.
- Build one screen at a time and stop so I can review before moving on.
- Ask before adding any new dependency.
- Keep components small and in `src/components/`; screens in `src/screens/`; data helpers in `src/lib/`.
- Run `npm run build` before committing. Commit in small steps with clear messages (e.g. "Add work queue table with derived counts").
- Don't change design tokens or copy without asking.
