import Button from '@/components/ui/Button';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero section--flush">
      {/* ── Upper: centred text block ── */}
      <div className="hero__header">
        <div className="container">
          <div className="bordered-section hero__header-inner">
            <span className="hero__label text-label--md">Vero Assess</span>

            <h1 className="hero__title text-h1 text-balance">
              Identify authentic talent.
              <br />
              Make strategic hiring decisions.
            </h1>

            <p className="hero__intro text-body--lg text-centre max-ch-55 mx-auto">
              Evaluate applicants in depth and at speed. Vero Assess reduces
              workloads, enhances recruitment and delivers the talent your
              organisation needs.
            </p>

            <div className="hero__cta">
              <Button variant="cta" size="lg" href="/get-started">
                Get started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lower: bordered visual area ── */}
      <div className="hero__visual-wrap">
        <div className="container">
          <div className="bordered-section hero__visual">
            {/* Floating tags */}
            <div className="hero__tag hero__tag--danger" aria-hidden="true">
              <span className="hero__tag-icon hero__tag-icon--x" />
              <span className="hero__tag-text text-label--sm">OFAC hits found</span>
            </div>

            <div className="hero__tag hero__tag--success hero__tag--left" aria-hidden="true">
              <span className="hero__tag-icon hero__tag-icon--check" />
              <span className="hero__tag-text text-label--sm">Enhanced background check</span>
            </div>

            <div className="hero__tag hero__tag--success hero__tag--right" aria-hidden="true">
              <span className="hero__tag-icon hero__tag-icon--check" />
              <span className="hero__tag-text text-label--sm">2 assessments completed</span>
            </div>

            {/* Placeholder image area */}
            <div className="hero__placeholder" />
          </div>
        </div>
      </div>
    </section>
  );
}
