// Footer note shown on every screen, plus the "Reset demo" action.
import { useShell } from './AppShell';
import './Footer.css';

export default function Footer({ extra }: { extra?: string }) {
  const { resetDemo } = useShell();
  return (
    <footer className="app-footer">
      <p>
        Sample data only. No real patients or orders.
        {extra ? ` ${extra}` : null}
      </p>
      <button type="button" className="link-button" onClick={resetDemo}>
        Reset demo
      </button>
    </footer>
  );
}
