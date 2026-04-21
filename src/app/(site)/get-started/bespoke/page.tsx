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
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const errors: Partial<Record<keyof BespokeDetails, string>> = {};
  if (submitAttempted) {
    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email';
    if (!form.company.trim()) errors.company = 'Company is required';
    if (!form.jobTitle.trim()) errors.jobTitle = 'Job title is required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
  }

  const requiredFilled = requiredFields.every((f) => form[f].trim().length > 0);
  const valid = Object.keys(errors).length === 0 && requiredFilled;

  const set = (field: keyof BespokeDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!valid) return;

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
                      required
                      autoComplete="given-name"
                    />
                    <span className="form-field__error">{errors.firstName ?? ''}</span>
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
                      required
                      autoComplete="family-name"
                    />
                    <span className="form-field__error">{errors.lastName ?? ''}</span>
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
                      required
                      autoComplete="email"
                    />
                    <span className="form-field__error">{errors.email ?? ''}</span>
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
                      required
                      autoComplete="organization"
                    />
                    <span className="form-field__error">{errors.company ?? ''}</span>
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
                      required
                      autoComplete="organization-title"
                    />
                    <span className="form-field__error">{errors.jobTitle ?? ''}</span>
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
                      required
                      autoComplete="tel"
                    />
                    <span className="form-field__error">{errors.phone ?? ''}</span>
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
