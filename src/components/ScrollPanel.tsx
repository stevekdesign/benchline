// A scrolling panel with thin scrollbars that float on top of the content
// (like macOS), so they never take width away from the table and columns never shift.
//
// Scrolling itself stays native (wheel, trackpad, touch, keyboard); only the drawn bar is custom.
// The thumbs are decorative for assistive tech (aria-hidden) and can be dragged with a pointer.
// In Windows high-contrast mode, the browser's own scrollbars come back (see ScrollPanel.css).
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import './ScrollPanel.css';

const EDGE = 4; // gap between the thumb and the panel's edges, in px
const MIN_THUMB = 32; // never smaller than this, so it stays easy to grab
const CROSS = 10; // room left for the other bar when both show

interface Props {
  className?: string;
  /** Accessible name of the scroll region, e.g. "Specimen list, scrollable". */
  label: string;
  children: ReactNode;
}

type Axis = 'x' | 'y';

export default function ScrollPanel({ className = '', label, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const yRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const vp = viewportRef.current;
    const thumbs = { y: yRef.current, x: xRef.current };
    if (!panel || !vp || !thumbs.y || !thumbs.x) return;

    // Sizes for one axis. The vertical track starts below a sticky table header, if any.
    function metrics(axis: Axis) {
      const v = vp!;
      const start = axis === 'y' ? (v.querySelector('thead')?.offsetHeight ?? 0) : 0;
      const view = axis === 'y' ? v.clientHeight : v.clientWidth;
      const content = axis === 'y' ? v.scrollHeight : v.scrollWidth;
      const other = axis === 'y' ? v.scrollWidth > v.clientWidth + 1 : v.scrollHeight > v.clientHeight + 1;
      const track = view - start - EDGE * 2 - (other ? CROSS : 0);
      const len = Math.max(MIN_THUMB, (track * view) / content);
      const max = content - view; // how far it can scroll
      const scrolled = axis === 'y' ? v.scrollTop : v.scrollLeft;
      return { show: max > 1, start, track, len, max, pos: start + EDGE + (track - len) * (scrolled / max) };
    }

    function layout() {
      for (const axis of ['y', 'x'] as const) {
        const thumb = thumbs[axis]!;
        const m = metrics(axis);
        thumb.hidden = !m.show;
        if (!m.show) continue;
        if (axis === 'y') {
          thumb.style.height = `${m.len}px`;
          thumb.style.transform = `translateY(${m.pos}px)`;
        } else {
          thumb.style.width = `${m.len}px`;
          thumb.style.transform = `translateX(${m.pos}px)`;
        }
      }
    }

    // Show the bars more strongly while scrolling, then fade back to faint.
    let fadeTimer = 0;
    function onScroll() {
      layout();
      panel!.classList.add('is-scrolling');
      window.clearTimeout(fadeTimer);
      fadeTimer = window.setTimeout(() => panel!.classList.remove('is-scrolling'), 900);
    }

    // Dragging a thumb scrolls the panel proportionally.
    const cleanups: (() => void)[] = [];
    for (const axis of ['y', 'x'] as const) {
      const thumb = thumbs[axis]!;
      let startPointer = 0;
      let startScroll = 0;

      const down = (e: PointerEvent) => {
        e.preventDefault();
        thumb.setPointerCapture(e.pointerId);
        startPointer = axis === 'y' ? e.clientY : e.clientX;
        startScroll = axis === 'y' ? vp.scrollTop : vp.scrollLeft;
        panel.classList.add('is-dragging');
      };
      const move = (e: PointerEvent) => {
        if (!thumb.hasPointerCapture(e.pointerId)) return;
        const m = metrics(axis);
        const delta = ((axis === 'y' ? e.clientY : e.clientX) - startPointer) * (m.max / Math.max(1, m.track - m.len));
        if (axis === 'y') vp.scrollTop = startScroll + delta;
        else vp.scrollLeft = startScroll + delta;
      };
      const up = (e: PointerEvent) => {
        if (thumb.hasPointerCapture(e.pointerId)) thumb.releasePointerCapture(e.pointerId);
        panel.classList.remove('is-dragging');
      };
      // The thumb sits on top of the content, so pass wheel scrolling through to the panel.
      const wheel = (e: WheelEvent) => {
        e.preventDefault();
        vp.scrollBy(e.deltaX, e.deltaY);
      };

      thumb.addEventListener('pointerdown', down);
      thumb.addEventListener('pointermove', move);
      thumb.addEventListener('pointerup', up);
      thumb.addEventListener('pointercancel', up);
      thumb.addEventListener('wheel', wheel, { passive: false });
      cleanups.push(() => {
        thumb.removeEventListener('pointerdown', down);
        thumb.removeEventListener('pointermove', move);
        thumb.removeEventListener('pointerup', up);
        thumb.removeEventListener('pointercancel', up);
        thumb.removeEventListener('wheel', wheel);
      });
    }

    // Re-measure when the panel resizes or the content changes (e.g. a filter changes the rows).
    const resize = new ResizeObserver(layout);
    resize.observe(vp);
    if (vp.firstElementChild) resize.observe(vp.firstElementChild);
    vp.addEventListener('scroll', onScroll, { passive: true });
    layout();

    return () => {
      resize.disconnect();
      vp.removeEventListener('scroll', onScroll);
      window.clearTimeout(fadeTimer);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div ref={panelRef} className={`scroll-panel ${className}`}>
      <div ref={viewportRef} className="scroll-panel__viewport" tabIndex={0} role="region" aria-label={label}>
        {children}
      </div>
      <div ref={yRef} className="scroll-panel__thumb scroll-panel__thumb--y" aria-hidden="true" hidden />
      <div ref={xRef} className="scroll-panel__thumb scroll-panel__thumb--x" aria-hidden="true" hidden />
    </div>
  );
}
