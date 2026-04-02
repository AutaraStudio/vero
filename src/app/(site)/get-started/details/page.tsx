'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBasket, type ContactDetails } from '@/store/basketStore';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import Button from '@/components/ui/Button';
import { Tooltip, TooltipContent } from '@/components/Tooltip/Tooltip';
import OrderSummary from '../components/OrderSummary';
import './details.css';

// ── Helper: single form field ─────────────────────────────────

function FormField({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  readOnly = false,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="form-field">
      <label className="form-field__label text-label--sm color--tertiary" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        className={`form-field__input${error ? ' has-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function DetailsPage() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, contactDetails, recommendedTier } = state;
  const isStarter = recommendedTier === 'starter';

  // Guard
  useEffect(() => {
    if (selectedRoles.length === 0) {
      router.replace('/get-started');
    }
  }, [selectedRoles.length, router]);

  // Form state — pre-populated from store
  const [form, setForm] = useState<ContactDetails>(() => ({
    ...contactDetails,
    usersToAdd: isStarter
      ? contactDetails.email || contactDetails.usersToAdd
      : contactDetails.usersToAdd,
    roleDates:
      Object.keys(contactDetails.roleDates).length > 0
        ? contactDetails.roleDates
        : Object.fromEntries(
            selectedRoles.map((r) => [r.roleId, { openDate: '', closeDate: '' }])
          ),
  }));

  const [errors, setErrors] = useState<Partial<Record<keyof ContactDetails, string>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Sync usersToAdd for starter when email changes
  useEffect(() => {
    if (isStarter) {
      setForm((prev) => ({ ...prev, usersToAdd: prev.email }));
    }
  }, [form.email, isStarter]);

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

  const validate = () => {
    const errs: Partial<Record<keyof ContactDetails, string>> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.company.trim()) errs.company = 'Company is required';
    if (!form.jobTitle.trim()) errs.jobTitle = 'Job title is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!isStarter && form.bespokeUrl && !/^[a-z0-9-]+$/.test(form.bespokeUrl)) {
      errs.bespokeUrl = 'Only lowercase letters, numbers, and hyphens';
    }
    if (!isStarter && form.brandColour1 && !/^#[0-9A-Fa-f]{6}$/.test(form.brandColour1)) {
      errs.brandColour1 = 'Enter a valid hex colour (e.g. #ff6600)';
    }
    if (!isStarter && form.brandColour2 && !/^#[0-9A-Fa-f]{6}$/.test(form.brandColour2)) {
      errs.brandColour2 = 'Enter a valid hex colour (e.g. #ff6600)';
    }
    return errs;
  };

  const requiredFilled = !!(
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.company.trim() &&
    form.jobTitle.trim() &&
    form.phone.trim()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    dispatch({ type: 'SET_CONTACT_DETAILS', payload: form });
    router.push('/get-started/contract');
  };

  // ── Animations ─────────────────────────────────────────────

  const headingRef = useTextReveal({ scroll: false, delay: 0.05 });
  const s1Ref = useFadeUp({ delay: 0.15, y: 16 });
  const s2Ref = useFadeUp({ delay: 0.2, y: 16 });
  const s3Ref = useFadeUp({ delay: 0.25, y: 16 });
  const s4Ref = useFadeUp({ delay: 0.3, y: 16 });
  const s5Ref = useFadeUp({ delay: 0.35, y: 16 });
  const s6Ref = useFadeUp({ delay: 0.4, y: 16 });
  const s7Ref = useFadeUp({ delay: 0.45, y: 16 });
  const actionsRef = useFadeUp({ delay: 0.5, y: 16 });

  if (selectedRoles.length === 0) return null;

  const err = submitAttempted ? errors : {};

  return (
    <section className="details-page">
      <div className="container">
        <div className="details-layout">

          {/* ── Form ── */}
          <form className="details-form" onSubmit={handleSubmit} noValidate>

            {/* Heading */}
            <div className="details-form__heading">
              <h2
                ref={headingRef as React.RefObject<HTMLHeadingElement>}
                className="text-h3 color--primary"
              >
                Your details
              </h2>
              <p className="text-body--sm color--tertiary">
                Tell us about your organisation and the person responsible for this account.
              </p>
            </div>

            {/* Section 1 — Your details */}
            <div ref={s1Ref as React.RefObject<HTMLDivElement>} className="stack--md">
              <div className="form-row">
                <FormField
                  id="firstName"
                  label="First name"
                  value={form.firstName}
                  onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
                  placeholder="Jane"
                  error={err.firstName}
                />
                <FormField
                  id="lastName"
                  label="Last name"
                  value={form.lastName}
                  onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
                  placeholder="Smith"
                  error={err.lastName}
                />
              </div>
              <div className="form-row">
                <FormField
                  id="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                  placeholder="jane@company.com"
                  error={err.email}
                />
                <FormField
                  id="company"
                  label="Company name"
                  value={form.company}
                  onChange={(v) => setForm((p) => ({ ...p, company: v }))}
                  placeholder="Acme Ltd"
                  error={err.company}
                />
              </div>
              <div className="form-row">
                <FormField
                  id="jobTitle"
                  label="Job title"
                  value={form.jobTitle}
                  onChange={(v) => setForm((p) => ({ ...p, jobTitle: v }))}
                  placeholder="Head of Talent"
                  error={err.jobTitle}
                />
                <FormField
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                  placeholder="+44 7700 000000"
                  error={err.phone}
                />
              </div>
            </div>

            {/* Section 2 — Key project contact */}
            <div ref={s2Ref as React.RefObject<HTMLDivElement>} className="stack--md">
              <p className="text-label--sm color--tertiary">Key project contact</p>
              <div className="form-field">
                <label
                  className="text-body--sm color--secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={form.keyContactSameAsMe}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, keyContactSameAsMe: e.target.checked }))
                    }
                    style={{
                      accentColor: 'var(--color--interactive-primary)',
                      width: '1rem',
                      height: '1rem',
                      flexShrink: 0,
                    }}
                  />
                  Same as my details
                </label>
              </div>
              <div className="form-row">
                <FormField
                  id="keyContactName"
                  label="Key contact name"
                  value={form.keyContactName}
                  onChange={(v) => setForm((p) => ({ ...p, keyContactName: v }))}
                  readOnly={form.keyContactSameAsMe}
                />
                <FormField
                  id="keyContactEmail"
                  label="Key contact email"
                  type="email"
                  value={form.keyContactEmail}
                  onChange={(v) => setForm((p) => ({ ...p, keyContactEmail: v }))}
                  readOnly={form.keyContactSameAsMe}
                />
              </div>
            </div>

            {/* Section 3 — Users to add */}
            <div ref={s3Ref as React.RefObject<HTMLDivElement>} className="stack--md">
              <p className="text-label--sm color--tertiary">Users to add</p>
              <div className="form-field">
                <label
                  className="form-field__label text-label--sm color--tertiary"
                  htmlFor="usersToAdd"
                >
                  Email addresses of users who need system access
                </label>
                {isStarter ? (
                  <>
                    <input
                      id="usersToAdd"
                      type="email"
                      className="form-field__input"
                      value={form.usersToAdd}
                      readOnly
                    />
                    <span className="text-body--xs color--tertiary">
                      Starter accounts include 1 user.
                    </span>
                  </>
                ) : (
                  <textarea
                    id="usersToAdd"
                    className="form-field__input"
                    rows={4}
                    value={form.usersToAdd}
                    onChange={(e) => setForm((p) => ({ ...p, usersToAdd: e.target.value }))}
                    placeholder={'jane@company.com\njohn@company.com'}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                  />
                )}
              </div>
            </div>

            {/* Section 4 — Bespoke URL (hidden for starter) */}
            {!isStarter && (
              <div ref={s4Ref as React.RefObject<HTMLDivElement>} className="stack--md">
                <p className="text-label--sm color--tertiary">Assessment portal URL</p>
                <div className="form-field">
                  <label
                    className="form-field__label text-label--sm color--tertiary"
                    htmlFor="bespokeUrl"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    Choose a URL for your assessment portal
                    <Tooltip
                      content={
                        <TooltipContent body="This will be the web address candidates use to access their assessments." />
                      }
                    >
                      {''}
                    </Tooltip>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <input
                      id="bespokeUrl"
                      type="text"
                      className={`form-field__input${err.bespokeUrl ? ' has-error' : ''}`}
                      value={form.bespokeUrl}
                      onChange={(e) => setForm((p) => ({ ...p, bespokeUrl: e.target.value }))}
                      placeholder="your-company"
                      style={{
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        flex: 1,
                        minWidth: 0,
                      }}
                    />
                    <span
                      className="text-body--sm color--tertiary"
                      style={{
                        padding: '0.625rem 0.75rem',
                        background: 'var(--color--surface-sunken)',
                        border: '1px solid var(--color--border-default)',
                        borderLeft: 'none',
                        borderTopRightRadius: 'var(--radius--md)',
                        borderBottomRightRadius: 'var(--radius--md)',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      .veroassess.com
                    </span>
                  </div>
                  {err.bespokeUrl && (
                    <span className="form-field__error">{err.bespokeUrl}</span>
                  )}
                </div>
              </div>
            )}

            {/* Section 5 — Candidate feedback reports */}
            <div ref={s5Ref as React.RefObject<HTMLDivElement>} className="stack--md">
              <p className="text-label--sm color--tertiary">Candidate feedback reports</p>
              <p className="text-body--sm color--secondary">
                When a candidate completes all 4 sections of Vero Assess, a combined feedback
                report is automatically generated and sent to the candidate.
              </p>
              <a
                href="#"
                className="text-body--sm color--brand"
                style={{ textDecoration: 'none', display: 'inline-block' }}
              >
                View an example report →
              </a>
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend
                  className="text-label--sm color--tertiary"
                  style={{ marginBottom: '0.75rem', float: 'left', width: '100%' }}
                >
                  Send feedback reports to candidates?
                </legend>
                <div style={{ display: 'flex', gap: '1.5rem', clear: 'both' }}>
                  {(['yes', 'no'] as const).map((val) => (
                    <label
                      key={val}
                      className="text-body--sm color--secondary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="sendFeedbackReports"
                        value={val}
                        checked={form.sendFeedbackReports === val}
                        onChange={() =>
                          setForm((p) => ({ ...p, sendFeedbackReports: val }))
                        }
                        style={{
                          accentColor: 'var(--color--interactive-primary)',
                          width: '1rem',
                          height: '1rem',
                          flexShrink: 0,
                        }}
                      />
                      {val === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Section 6 — Portal branding (hidden for starter) */}
            {!isStarter && (
              <div ref={s6Ref as React.RefObject<HTMLDivElement>} className="stack--md">
                <p className="text-label--sm color--tertiary">Portal branding</p>
                <div className="form-field">
                  <label
                    className="form-field__label text-label--sm color--tertiary"
                    htmlFor="brandLogo"
                  >
                    Logo
                  </label>
                  <input
                    id="brandLogo"
                    type="file"
                    accept="image/*"
                    className="form-field__input"
                    style={{ padding: '0.5rem 0.75rem', cursor: 'pointer' }}
                  />
                </div>
                <div className="form-row">
                  {/* Brand colour 1 */}
                  <div className="form-field">
                    <label
                      className="form-field__label text-label--sm color--tertiary"
                      htmlFor="brandColour1"
                    >
                      Brand colour 1
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        id="brandColour1"
                        type="text"
                        className={`form-field__input${err.brandColour1 ? ' has-error' : ''}`}
                        value={form.brandColour1}
                        onChange={(e) => setForm((p) => ({ ...p, brandColour1: e.target.value }))}
                        placeholder="#472d6a"
                        maxLength={7}
                      />
                      {/^#[0-9A-Fa-f]{6}$/.test(form.brandColour1) && (
                        <span
                          style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: 'var(--radius--md)',
                            background: form.brandColour1,
                            border: '1px solid var(--color--border-default)',
                            flexShrink: 0,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    {err.brandColour1 && (
                      <span className="form-field__error">{err.brandColour1}</span>
                    )}
                  </div>
                  {/* Brand colour 2 */}
                  <div className="form-field">
                    <label
                      className="form-field__label text-label--sm color--tertiary"
                      htmlFor="brandColour2"
                    >
                      Brand colour 2
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        id="brandColour2"
                        type="text"
                        className={`form-field__input${err.brandColour2 ? ' has-error' : ''}`}
                        value={form.brandColour2}
                        onChange={(e) => setForm((p) => ({ ...p, brandColour2: e.target.value }))}
                        placeholder="#fec601"
                        maxLength={7}
                      />
                      {/^#[0-9A-Fa-f]{6}$/.test(form.brandColour2) && (
                        <span
                          style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: 'var(--radius--md)',
                            background: form.brandColour2,
                            border: '1px solid var(--color--border-default)',
                            flexShrink: 0,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    {err.brandColour2 && (
                      <span className="form-field__error">{err.brandColour2}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section 7 — Campaign dates */}
            <div ref={s7Ref as React.RefObject<HTMLDivElement>} className="stack--md">
              <p className="text-label--sm color--tertiary">Campaign dates</p>
              <div className="stack--sm">
                {selectedRoles.map((role) => {
                  const dates = form.roleDates[role.roleId] ?? { openDate: '', closeDate: '' };
                  return (
                    <div
                      key={role.roleId}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '0.75rem',
                        alignItems: 'end',
                      }}
                    >
                      <span
                        className="text-body--sm color--secondary"
                        style={{ paddingBottom: '0.625rem' }}
                      >
                        {role.roleName}
                      </span>
                      <div className="form-field">
                        <label
                          className="form-field__label text-label--sm color--tertiary"
                          htmlFor={`open-${role.roleId}`}
                        >
                          Open date
                        </label>
                        <input
                          id={`open-${role.roleId}`}
                          type="date"
                          className="form-field__input"
                          value={dates.openDate}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              roleDates: {
                                ...p.roleDates,
                                [role.roleId]: { ...dates, openDate: e.target.value },
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="form-field">
                        <label
                          className="form-field__label text-label--sm color--tertiary"
                          htmlFor={`close-${role.roleId}`}
                        >
                          Close date
                        </label>
                        <input
                          id={`close-${role.roleId}`}
                          type="date"
                          className="form-field__input"
                          value={dates.closeDate}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              roleDates: {
                                ...p.roleDates,
                                [role.roleId]: { ...dates, closeDate: e.target.value },
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div ref={actionsRef as React.RefObject<HTMLDivElement>} className="details-actions">
              <Button variant="primary" size="md" type="submit" disabled={!requiredFilled}>
                Continue to contract →
              </Button>
              <Link
                href="/get-started"
                className="text-body--sm color--brand"
                style={{ textDecoration: 'none' }}
              >
                ← Back to roles
              </Link>
            </div>

          </form>

          {/* ── Sidebar ── */}
          <OrderSummary />
        </div>
      </div>
    </section>
  );
}
