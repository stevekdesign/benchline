// Vertical timeline of a specimen's steps, newest at the bottom.
// A pending callback shows as a dashed step with no time yet.
import { timelineSteps } from '../lib/timeline';
import type { Specimen } from '../lib/types';
import './Timeline.css';

export default function Timeline({ specimen }: { specimen: Specimen }) {
  const steps = timelineSteps(specimen);
  return (
    <section className="card timeline" aria-labelledby="timeline-title">
      <div className="timeline__head">
        <h2 id="timeline-title">Timeline</h2>
        <span>Every step timestamped automatically on scan</span>
      </div>
      <ol className="timeline__list">
        {steps.map((step, i) => (
          <li key={step.key} className={`timeline-step timeline-step--${step.tone}`}>
            <div className="timeline-step__rail" aria-hidden="true">
              <span className="timeline-step__dot" />
              {i < steps.length - 1 ? <span className="timeline-step__line" /> : null}
            </div>
            <div className="timeline-step__body">
              <span className="timeline-step__title">{step.title}</span>
              <span className="timeline-step__detail">{step.detail}</span>
            </div>
            {step.at ? (
              <time className="timeline-step__time mono">{step.at}</time>
            ) : (
              <span className="timeline-step__time mono">
                <span aria-hidden="true">—</span>
                <span className="sr-only">Not yet</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
