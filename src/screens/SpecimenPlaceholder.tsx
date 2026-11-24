// Temporary stand-in for the specimen timeline and callback screens (built next).
import { Link, useParams } from 'react-router';
import Footer from '../components/Footer';
import { useSpecimens } from '../lib/SpecimensContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function SpecimenPlaceholder() {
  const { orderId = '' } = useParams();
  const specimen = useSpecimens().getSpecimen(orderId);
  useDocumentTitle(`Specimen ${orderId}`);

  return (
    <main className="page">
      <Link to="/">← Back to work queue</Link>
      <h1 style={{ margin: 0, fontSize: 'var(--font-size-title)' }}>
        {specimen ? (
          <>
            <span className="mono">{specimen.orderId}</span> · {specimen.test}
          </>
        ) : (
          <>No specimen with order # {orderId}</>
        )}
      </h1>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Timeline screen coming next.</p>
      <Footer />
    </main>
  );
}
