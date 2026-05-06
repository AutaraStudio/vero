'use client';

interface Props {
  phone?: string;
  email?: string;
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.8 12.4 19.79 19.79 0 0 1 1.73 3.8 2 2 0 0 1 3.72 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.69a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Sidebar card on /contact — phone + email + opening hours.
 * Sits next to the contact form.
 */
export default function ContactMethods({ phone, email }: Props) {
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : undefined;

  return (
    <aside className="contact-methods" aria-label="Other ways to get in touch">
      <header className="contact-methods__header stack--md">
        <h3 className="text-h5 color--primary">Reach us directly</h3>
        <p className="text-body--sm color--secondary leading--snug">
          We typically respond within one working day.
        </p>
      </header>

      <ul className="contact-methods__list">
        {phone && telHref && (
          <li>
            <a href={telHref} className="contact-methods__item">
              <span className="contact-methods__icon" aria-hidden="true">
                <PhoneIcon />
              </span>
              <span className="contact-methods__text">
                <span className="contact-methods__label text-label--sm color--tertiary">
                  Phone
                </span>
                <span className="contact-methods__value text-body--md font--medium color--primary">
                  {phone}
                </span>
              </span>
            </a>
          </li>
        )}

        {email && (
          <li>
            <a href={`mailto:${email}`} className="contact-methods__item">
              <span className="contact-methods__icon" aria-hidden="true">
                <EmailIcon />
              </span>
              <span className="contact-methods__text">
                <span className="contact-methods__label text-label--sm color--tertiary">
                  Email
                </span>
                <span className="contact-methods__value text-body--md font--medium color--primary">
                  {email}
                </span>
              </span>
            </a>
          </li>
        )}

        <li>
          <div className="contact-methods__item contact-methods__item--static">
            <span className="contact-methods__icon" aria-hidden="true">
              <ClockIcon />
            </span>
            <span className="contact-methods__text">
              <span className="contact-methods__label text-label--sm color--tertiary">
                Hours
              </span>
              <span className="contact-methods__value text-body--md font--medium color--primary">
                Mon–Fri, 9am–5pm
              </span>
            </span>
          </div>
        </li>
      </ul>
    </aside>
  );
}
