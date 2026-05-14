'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket, type ContactDetails } from '@/store/basketStore';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import BasketContent from '../components/BasketContent';
import { usePublishPlanBarSubmitDisabled } from '../components/planBarSubmit';
import { FormField } from '../components/checkoutFormHelpers';
import { isValidEmail } from '@/lib/emailValidation';
import './details.css';

// ── Page — Step 2: Your details ───────────────────────────────
// Contact info + key project contact only. Users / portal URL /
// feedback / branding / campaign dates live on the Portal Setup step.

export default function DetailsPage() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, contactDetails } = state;

  /* WCAG 2.4.2 — set a unique, descriptive page title for this checkout step.
     Client components can't export server-side metadata, so we set the title
     imperatively. */
  useEffect(() => {
    document.title = 'Your details — Vero Assess';
  }, []);

  // Guard
  useEffect(() => {
    if (selectedRoles.length === 0) {
      router.replace('/get-started');
    }
  }, [selectedRoles.length, router]);

  /* Form state holds the full ContactDetails object — even though this
     step only edits contact + key-contact fields — so navigating back
     here from Portal Setup and forward again preserves the later
     sections' data. */
  const [form, setForm] = useState<ContactDetails>(() => ({ ...contactDetails }));
  const [errors, setErrors] = useState<Partial<Record<keyof ContactDetails, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactDetails, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Sync key contact when "same as me" is checked
  useEffect(() => {
    if (form.keyContactSameAsMe) {
      setForm((prev) => ({
        ...prev,
        keyContactName: `${prev.firstName} ${prev.lastName}`.trim(),
        keyContactEmail: prev.email,
      }));
    }
  }, [form.keyContactSameAsMe, form.firstName, form.lastName, form.email]);

  // ── Validation ─────────────────────────────────────────────

  const PHONE_RE = /^[+()\d\s-]{7,}$/;

  const validateField = (
    field: keyof ContactDetails,
    value: string,
    full: ContactDetails,
  ): string | undefined => {
    switch (field) {
      case 'firstName':       return value.trim() ? undefined : 'First name is required';
      case 'lastName':        return value.trim() ? undefined : 'Last name is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!isValidEmail(value)) return 'Enter a valid email address';
        return undefined;
      case 'company':         return value.trim() ? undefined : 'Company is required';
      case 'jobTitle':        return value.trim() ? undefined : 'Job title is required';
      case 'phone':
        if (!value.trim()) return 'Phone is required';
        if (!PHONE_RE.test(value.trim())) return 'Enter a valid phone number';
        return undefined;
      case 'keyContactName':
        if (full.keyContactSameAsMe) return undefined;
        return value.trim() ? undefined : 'Key contact name is required';
      case 'keyContactEmail':
        if (full.keyContactSameAsMe) return undefined;
        if (!value.trim()) return 'Key contact email is required';
        if (!isValidEmail(value)) return 'Enter a valid email address';
        return undefined;
      default:                return undefined;
    }
  };

  const FIELDS: (keyof ContactDetails)[] = [
    'firstName', 'lastName', 'email', 'company', 'jobTitle', 'phone',
    'keyContactName', 'keyContactEmail',
  ];

  const validate = () => {
    const errs: Partial<Record<keyof ContactDetails, string>> = {};
    FIELDS.forEach((f) => {
      const msg = validateField(f, String(form[f] ?? ''), form);
      if (msg) errs[f] = msg;
    });
    return errs;
  };

  const setField = (field: keyof ContactDetails, value: string) => {
    setForm((p) => {
      const next = { ...p, [field]: value };
      if (touched[field] || submitAttempted) {
        const msg = validateField(field, value, next);
        setErrors((e) => ({ ...e, [field]: msg }));
      }
      return next;
    });
  };

  const handleBlur = (field: keyof ContactDetails) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const msg = validateField(field, String(form[field] ?? ''), form);
    setErrors((e) => ({ ...e, [field]: msg }));
  };

  /* Every field must pass its per-field validator — presence AND format.
     Gates the sticky PlanBar's "Continue" button so it only enables when
     the step is genuinely complete and valid. */
  const fieldErrors = validate();
  const requiredFilled = Object.keys(fieldErrors).length === 0;

  const blockerMessage = !requiredFilled
    ? 'Please complete all required fields above.'
    : '';

  usePublishPlanBarSubmitDisabled(!requiredFilled);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    dispatch({ type: 'SET_CONTACT_DETAILS', payload: form });
    router.push('/get-started/portal-setup');
  };

  // ── Animations ─────────────────────────────────────────────

  const headingRef = useTextReveal({ scroll: false, delay: 0.05 });
  const s1Ref = useFadeUp({ delay: 0.15, y: 16 });
  const s2Ref = useFadeUp({ delay: 0.2, y: 16 });

  if (selectedRoles.length === 0) return null;

  const err = errors;

  return (
    <section className="details-page">
      <div className="details-layout">

          {/* ── Form ── */}
          <form id="details-form" className="details-form" onSubmit={handleSubmit} noValidate>

            {/* Heading */}
            <div className="details-form__heading">
              <h1
                ref={headingRef as React.RefObject<HTMLHeadingElement>}
                className="text-h3 color--primary"
              >
                Your details
              </h1>
              <p className="text-body--sm color--tertiary">
                Tell us about your organisation and the person responsible for this account.
              </p>
            </div>

            {/* Section 1 — Your details */}
            <div ref={s1Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
              <div className="form-row">
                <FormField
                  id="firstName"
                  label="First name"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(v) => setField('firstName', v)}
                  onBlur={() => handleBlur('firstName')}
                  placeholder="Jane"
                  error={err.firstName}
                />
                <FormField
                  id="lastName"
                  label="Last name"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(v) => setField('lastName', v)}
                  onBlur={() => handleBlur('lastName')}
                  placeholder="Smith"
                  error={err.lastName}
                />
              </div>
              <div className="form-row">
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(v) => setField('email', v)}
                  onBlur={() => handleBlur('email')}
                  placeholder="jane@company.com"
                  error={err.email}
                />
                <FormField
                  id="company"
                  label="Company name"
                  autoComplete="organization"
                  value={form.company}
                  onChange={(v) => setField('company', v)}
                  onBlur={() => handleBlur('company')}
                  placeholder="Acme Ltd"
                  error={err.company}
                />
              </div>
              <div className="form-row">
                <FormField
                  id="jobTitle"
                  label="Job title"
                  autoComplete="organization-title"
                  value={form.jobTitle}
                  onChange={(v) => setField('jobTitle', v)}
                  onBlur={() => handleBlur('jobTitle')}
                  placeholder="Head of Talent"
                  error={err.jobTitle}
                />
                <FormField
                  id="phone"
                  label="Phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(v) => setField('phone', v)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+44 7700 000000"
                  error={err.phone}
                />
              </div>
            </div>

            {/* Section 2 — Key project contact */}
            <div ref={s2Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
              <p className="details-section__label">Key project contact</p>
              <p className="text-body--sm color--secondary details-section__intro">
                The day-to-day contact our team will work with to get your
                assessment portal set up.
              </p>
              <div className="form-field">
                <label className="checkbox-label-row text-body--sm color--secondary">
                  <input
                    type="checkbox"
                    checked={form.keyContactSameAsMe}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, keyContactSameAsMe: e.target.checked }))
                    }
                  />
                  Same as my details
                </label>
              </div>
              <div className="form-row">
                <FormField
                  id="keyContactName"
                  label="Key contact name"
                  value={form.keyContactName}
                  onChange={(v) => setField('keyContactName', v)}
                  onBlur={() => handleBlur('keyContactName')}
                  error={err.keyContactName}
                  readOnly={form.keyContactSameAsMe}
                />
                <FormField
                  id="keyContactEmail"
                  label="Key contact email"
                  type="email"
                  value={form.keyContactEmail}
                  onChange={(v) => setField('keyContactEmail', v)}
                  onBlur={() => handleBlur('keyContactEmail')}
                  error={err.keyContactEmail}
                  readOnly={form.keyContactSameAsMe}
                />
              </div>
            </div>

            {/* Back + Continue live in the sticky PlanBar. We still surface
                the validation blocker inline so the user knows why the
                sticky submit is disabled. */}
            {submitAttempted && blockerMessage && (
              <div className="details-actions">
                <p className="form-field__error" role="alert">{blockerMessage}</p>
              </div>
            )}

          </form>

          {/* ── Sidebar — same component as the role picker, read-only. ── */}
          <aside className="basket">
            <div className="basket__sticky">
              <BasketContent mode="review" />
            </div>
          </aside>
      </div>
    </section>
  );
}
