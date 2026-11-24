// Specimen table. Fixed column widths, sticky header, zebra rows that follow the visible order.
import { Link } from 'react-router';
import { FROM_QUEUE } from '../lib/navState';
import { isCriticalDue, locationText, statusText } from '../lib/queue';
import { minutesInLab } from '../lib/time';
import type { Specimen } from '../lib/types';
import ScrollPanel from './ScrollPanel';
import './SpecimenTable.css';

interface Props {
  rows: Specimen[];
  emptyMessage: string;
}

export default function SpecimenTable({ rows, emptyMessage }: Props) {
  return (
    <ScrollPanel className="table-panel" label="Specimen list, scrollable">
      <table className="specimen-table">
        <colgroup>
          <col style={{ width: 112 }} />
          <col />
          <col style={{ width: 104 }} />
          <col />
          <col />
          <col style={{ width: 104 }} />
          <col style={{ width: 88 }} />
          <col style={{ width: 116 }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Order #</th>
            <th scope="col">Test</th>
            <th scope="col">Priority</th>
            <th scope="col">Location now</th>
            <th scope="col">Status</th>
            <th scope="col">Received</th>
            <th scope="col">In lab</th>
            <th scope="col" className="col-action">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="specimen-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((s, i) => <Row key={s.orderId} specimen={s} striped={i % 2 === 1} />)
          )}
        </tbody>
      </table>
    </ScrollPanel>
  );
}

function Row({ specimen: s, striped }: { specimen: Specimen; striped: boolean }) {
  const critical = isCriticalDue(s);
  const status = statusText(s);
  const where = locationText(s);
  const rowClass = critical ? 'row--critical' : striped ? 'row--striped' : undefined;

  return (
    <tr className={rowClass} data-order-id={s.orderId}>
      <td className="mono">
        <Link to={`/specimen/${s.orderId}`} className="order-link">
          {s.orderId}
        </Link>
      </td>
      <td title={s.test}>{s.test}</td>
      <td>
        {s.priority === 'STAT' ? (
          <span className="badge-stat">STAT</span>
        ) : (
          <span className="priority-routine">Routine</span>
        )}
      </td>
      <td title={where}>{where}</td>
      <td title={status.label}>
        <span className={`status status--${status.tone}`}>{status.label}</span>
      </td>
      <td className="mono cell-received">{s.receivedAt}</td>
      <td className={`mono${s.overTurnaround ? ' cell-over' : ''}`}>{minutesInLab(s)} min</td>
      <td className="col-action">
        {critical ? (
          <Link
            to={`/specimen/${s.orderId}/callback`}
            state={FROM_QUEUE} // so the dialog returns to the work queue when closed
            className="btn-callback"
            aria-label={`Log callback for ${s.orderId}`}
          >
            Log callback
          </Link>
        ) : null}
      </td>
    </tr>
  );
}
