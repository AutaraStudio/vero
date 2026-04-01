import Button from '@/components/ui/Button';

interface ContactCTAProps {
  heading?: string;
  body?: string;
  ctaLabel?: string;
}

export default function ContactCTA({ heading, body, ctaLabel }: ContactCTAProps) {
  return (
    <section className="contact-cta-section">
      <div className="container">
        <div className="contact-cta-card bordered-section">
          <div className="contact-cta-card__inner">
            <div className="stack--md">
              <h2 className="text-h4 color--primary">
                {heading ?? 'Need a more customised solution?'}
              </h2>
              <p className="text-body--md color--secondary leading--relaxed max-ch-60">
                {body ?? 'We offer tailored assessments for hiring, development and training. Get in touch to discuss what works for you.'}
              </p>
            </div>
            <Button variant="secondary" size="md" href="/contact">
              {ctaLabel ?? 'Talk to us'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
