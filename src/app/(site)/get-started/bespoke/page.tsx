'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useBasket } from '@/store/basketStore';
import type { BespokeDetails } from '@/store/basketStore';
import '../details/details.css';
import './bespoke.css';

export default function BespokePage() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, recommendedTier } = state;

  const [form, setForm] = useState<BespokeDetails>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    phone: '',
    approxRoles: '',
    approxCandidates: '',
    targetGoLive: '',
    requirements: '',
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof BespokeDetails, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof BespokeDetails, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^[+()\d\s-]{7,}$/;

  const validateField = (
    field: keyof BespokeDetails,
    value: string,
  ): string | undefined => {
    switch (field) {
      case 'firstName': return value.trim() ? undefined : 'First name is required';
      case 'lastName':  return value.trim() ? undefined : 'Last name is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email';
        return undefined;
      case 'company':   return value.trim() ? undefined : 'Company is required';
      case 'jobTitle':  return value.trim() ? undefined : 'Job title is required';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!PHONE_RE.test(value.trim())) return 'Enter a valid phone number';
        return undefined;
      default: return undefined;
    }
  };

  useEffect(() => {
    if (selectedRoles.length === 0) {
      router.replace('/get-started');
      return;
    }
    if (recommendedTier !== 'bespoke') {
      router.replace('/get-started/details');
    }
  }, [selectedRoles.length, recommendedTier, router]);

  if (selectedRoles.length === 0 || recommendedTier !== 'bespoke') return null;

  const requiredFields: (keyof BespokeDetails)[] = [
    'firstName', 'lastName', 'email', 'company', 'jobTitle', 'phone',
  ];

  const runFullValidation = (): Partial<Record<keyof BespokeDetails, string>> => {
    const errs: Partial<Record<keyof BespokeDetails, string>> = {};
    requiredFields.forEach((f) => {
      const msg = validateField(f, String(form[f] ?? ''));
      if (msg) errs[f] = msg;
    });
    return errs;
  };

  const requiredFilled = requiredFields.every((f) => form[f].trim().length > 0);

  const set = (field: keyof BespokeDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (touched[field] || submitAttempted) {
        const msg = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: msg }));
      }
    };

  const handleBlur = (field: keyof BespokeDetails) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
    const msg = validateField(field, String(form[field] ?? ''));
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const errs = runFullValidation();
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !requiredFilled) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/checkout/bespoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedRoles: selectedRoles.map((r) => ({
            roleId: r.roleId,
            roleName: r.roleName,
            roleSlug: r.roleSlug,
            roleHubspotValue: r.roleHubspotValue,
            categoryName: r.categoryName,
            categorySlug: r.categorySlug,
          })),
          bespokeDetails: form,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      dispatch({ type: 'SET_BESPOKE_DETAILS', payload: form });
      dispatch({ type: 'SUBMIT_BESPOKE_ENQUIRY' });
      router.push('/get-started/confirmation');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const uniqueCategories = [...new Set(selectedRoles.map((r) => r.categoryName))];
  const uniqueCategoryCount = uniqueCategories.length;

  return (
    <section className="bespoke-page" data-theme="brand-purple">
      <div className="container">
        <div className="details-layout">

          {/* ── Main form ── */}
          <div>
            <div className="bespoke-page__header">
              <span className="section-label">Bespoke solution</span>
              <h2 className="text-h3 color--primary">Tell us about your requirements</h2>
              <p className="text-body--sm color--secondary">
                Share some details and one of our team will be in touch within 24 hours to
                build a tailored assessment solution around your needs.
              </p>
            </div>

            <form id="bespoke-form" onSubmit={handleSubmit} noValidate>

              {/* ── Section 1: Your details ── */}
              <div className="details-section">
                <span className="details-section__label">Your details</span>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="bespoke-firstName" className="form-field__label text-label--sm color--tertiary">
                      First name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="bespoke-firstName"
                      className={`form-field__input${errors.firstName ? ' has-error' : ''}`}
                      type="text"
                      value={form.firstName}
                      onChange={set('firstName')}
                      onBlur={handleBlur('firstName')}
                      required
                      autoComplete="given-name"
                      aria-invalid={!!errors.firstName}
                      aria-describedby={errors.firstName ? 'bespoke-firstName-error' : undefined}
                    />
                    {errors.firstName && (
                      <span id="bespoke-firstName-error" className="form-field__error" role="alert">
                        {errors.firstName}
                      </span>
                    )}
                  </div>
                  <div className="form-field">
                    <label htmlFor="bespoke-lastName" className="form-field__label text-label--sm color--tertiary">
                      Last name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="bespoke-lastName"
                      className={`form-field__input${errors.lastName ? ' has-error' : ''}`}
                      type="text"
                      value={form.lastName}
                      onChange={set('lastName')}
                      onBlur={handleBlur('lastName')}
                      required
                      autoComplete="family-name"
                      aria-invalid={!!errors.lastName}
                      aria-describedby={errors.lastName ? 'bespoke-lastName-error' : undefined}
                    />
                    {errors.lastName && (
                      <span id="bespoke-lastName-error" className="form-field__error" role="alert">
                        {errors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="bespoke-email" className="form-field__label text-label--sm color--tertiary">
                      Work email <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="bespoke-email"
                      className={`form-field__input${errors.email ? ' has-error' : ''}`}
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      onBlur={handleBlur('email')}
                      required
                      autoComplete="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'bespoke-email-error' : undefined}
                    />
                    {errors.email && (
                      <span id="bespoke-email-error" className="form-field__error" role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <div className="form-field">
                    <label htmlFor="bespoke-company" className="form-field__label text-label--sm color--tertiary">
                      Company <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="bespoke-company"
                      className={`form-field__input${errors.company ? ' has-error' : ''}`}
                      type="text"
                      value={form.company}
                      onChange={set('company')}
                      onBlur={handleBlur('company')}
                      required
                      autoComplete="organization"
                      aria-invalid={!!errors.company}
                      aria-describedby={errors.company ? 'bespoke-company-error' : undefined}
                    />
                    {errors.company && (
                      <span id="bespoke-company-error" className="form-field__error" role="alert">
                        {errors.company}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="bespoke-jobTitle" className="form-field__label text-label--sm color--tertiary">
                      Job title <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="bespoke-jobTitle"
                      className={`form-field__input${errors.jobTitle ? ' has-error' : ''}`}
                      type="text"
                      value={form.jobTitle}
                      onChange={set('jobTitle')}
                      onBlur={handleBlur('jobTitle')}
                      required
                      autoComplete="organization-title"
                      aria-invalid={!!errors.jobTitle}
                      aria-describedby={errors.jobTitle ? 'bespoke-jobTitle-error' : undefined}
                    />
                    {errors.jobTitle && (
                      <span id="bespoke-jobTitle-error" className="form-field__error" role="alert">
                        {errors.jobTitle}
                      </span>
                    )}
                  </div>
                  <div className="form-field">
                    <label htmlFor="bespoke-phone" className="form-field__label text-label--sm color--tertiary">
                      Phone <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="bespoke-phone"
                      className={`form-field__input${errors.phone ? ' has-error' : ''}`}
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      onBlur={handleBlur('phone')}
                      required
                      autoComplete="tel"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'bespoke-phone-error' : undefined}
                    />
                    {errors.phone && (
                      <span id="bespoke-phone-error" className="form-field__error" role="alert">
                        {errors.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Section 2: Your requirements ── */}
              <div className="details-section">
                <span className="details-section__label">Your requirements</span>

                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="bespoke-approxRoles" className="form-field__label text-label--sm color--tertiary">
                      Approximately how many roles are you assessing for?
                    </label>
                    <select
                      id="bespoke-approxRoles"
                      className="form-field__input"
                      value={form.approxRoles}
                      onChange={set('approxRoles')}
                    >
                      <option value="">Select a range</option>
                      <option value="51–100">51–100</option>
                      <option value="101–250">101–250</option>
                      <option value="251–500">251–500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="bespoke-approxCandidates" className="form-field__label text-label--sm color--tertiary">
                      Approximately how many candidates per year?
                    </label>
                    <select
                      id="bespoke-approxCandidates"
                      className="form-field__input"
                      value={form.approxCandidates}
                      onChange={set('approxCandidates')}
                    >
                      <option value="">Select a range</option>
                      <option value="Under 500">Under 500</option>
                      <option value="500–2,500">500–2,500</option>
                      <option value="2,500–10,000">2,500–10,000</option>
                      <option value="10,000+">10,000+</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="bespoke-targetGoLive" className="form-field__label text-label--sm color--tertiary">
                    When are you looking to go live?
                  </label>
                  <input
                    id="bespoke-targetGoLive"
                    className="form-field__input"
                    type="date"
                    value={form.targetGoLive}
                    onChange={set('targetGoLive')}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="bespoke-requirements" className="form-field__label text-label--sm color--tertiary">
                    Specific requirements or questions
                  </label>
                  <textarea
                    id="bespoke-requirements"
                    className="form-field__input form-field__textarea"
                    rows={5}
                    value={form.requirements}
                    onChange={set('requirements')}
                    placeholder="Tell us about your assessment needs, any integrations required, or anything else that would help us prepare for our conversation."
                  />
                </div>
              </div>

              <div className="details-actions">
                <Button variant="primary" size="md" type="submit" disabled={!requiredFilled}>
                  Submit enquiry →
                </Button>
                <Link href="/get-started" className="form-back-link">
                  ← Back to roles
                </Link>
              </div>

            </form>
          </div>

          {/* ── Sidebar ── */}
          <aside className="bespoke-sidebar">
            <div className="order-summary__card">
              <p className="text-label--sm color--tertiary">Your selection</p>
              <p className="text-body--sm font--medium color--primary">
                {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} across {uniqueCategoryCount} {uniqueCategoryCount !== 1 ? 'categories' : 'category'}
              </p>
              <div className="bespoke-sidebar__categories">
                {uniqueCategories.map((cat) => (
                  <span key={cat} className="text-body--xs color--tertiary">{cat}</span>
                ))}
              </div>
              <p className="text-body--xs color--tertiary bespoke-sidebar__note">
                Our team will review your selection and advise on the best approach.
              </p>
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}
