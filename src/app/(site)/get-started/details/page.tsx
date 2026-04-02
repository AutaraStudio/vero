'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBasket, type ContactDetails } from '@/store/basketStore';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import { gsap } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import { Tooltip, TooltipContent } from '@/components/Tooltip/Tooltip';
import OrderSummary from '../components/OrderSummary';
import './details.css';

// ── Helper: user email input ──────────────────────────────────

function UserEmailInput({
  emails,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  onCsvImport,
}: {
  emails: string[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: (email: string) => void;
  onRemove: (index: number) => void;
  onCsvImport: (file: File) => void;
}) {
  const csvRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd(inputValue);
    }
  };

  return (
    <div className="user-emails">
      <div className="user-emails__actions-row">
        <button
          type="button"
          className="user-emails__import-btn"
          onClick={() => csvRef.current?.click()}
        >
          Import from CSV
        </button>
        <input
          ref={csvRef}
          type="file"
          accept=".csv,text/csv"
          className="user-emails__csv-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onCsvImport(file);
            e.target.value = '';
          }}
        />
      </div>

      <div className="user-emails__add-row">
        <input
          type="email"
          className="form-field__input"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="jane@company.com"
          aria-label="Add email address"
        />
        <button
          type="button"
          className="user-emails__add-btn"
          onClick={() => onAdd(inputValue)}
          disabled={!inputValue.trim()}
        >
          Add
        </button>
      </div>

      {emails.length > 0 && (
        <div className="user-emails__chips">
          {emails.map((email, i) => (
            <div key={email} className="user-email-chip">
              <span className="text-body--sm color--primary user-email-chip__address">
                {email}
              </span>
              <button
                type="button"
                className="user-email-chip__remove"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${email}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

  // Logo upload state (visual only)
  const [logoFileName, setLogoFileName] = useState<string>('');

  // User emails state
  const [userEmails, setUserEmails] = useState<string[]>(() =>
    form.usersToAdd ? form.usersToAdd.split('\n').filter(Boolean) : []
  );
  const [emailInput, setEmailInput] = useState('');

  const addUserEmail = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (userEmails.includes(email)) { setEmailInput(''); return; }
    const next = [...userEmails, email];
    setUserEmails(next);
    setForm((p) => ({ ...p, usersToAdd: next.join('\n') }));
    setEmailInput('');
  };

  const removeUserEmail = (index: number) => {
    const next = userEmails.filter((_, i) => i !== index);
    setUserEmails(next);
    setForm((p) => ({ ...p, usersToAdd: next.join('\n') }));
  };

  const handleCsvImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const found = text
        .split(/[\n,;\r]+/)
        .map((s) => s.trim().toLowerCase().replace(/^["']|["']$/g, ''))
        .filter((s) => emailRegex.test(s));
      const next = [...new Set([...userEmails, ...found])];
      setUserEmails(next);
      setForm((p) => ({ ...p, usersToAdd: next.join('\n') }));
    };
    reader.readAsText(file);
  };

  // Campaign dates state
  const [applyAllDates, setApplyAllDates] = useState(false);
  const [globalOpenDate, setGlobalOpenDate] = useState('');
  const [globalCloseDate, setGlobalCloseDate] = useState('');
  const [openDateCategories, setOpenDateCategories] = useState<Set<string>>(new Set());
  const datesCategoryAnimatedRef = useRef<Set<string>>(new Set());

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

  // ── Campaign dates helpers ──────────────────────────────────

  const dateRolesByCategory = selectedRoles.reduce(
    (
      acc: Array<{ slug: string; name: string; roles: typeof selectedRoles }>,
      role
    ) => {
      const existing = acc.find((c) => c.slug === role.categorySlug);
      if (existing) {
        existing.roles.push(role);
      } else {
        acc.push({ slug: role.categorySlug, name: role.categoryName, roles: [role] });
      }
      return acc;
    },
    []
  );

  const handleGlobalDateChange = (field: 'openDate' | 'closeDate', value: string) => {
    if (field === 'openDate') setGlobalOpenDate(value);
    else setGlobalCloseDate(value);
    setForm((p) => ({
      ...p,
      roleDates: Object.fromEntries(
        Object.entries(p.roleDates).map(([id, dates]) => [
          id,
          { ...dates, [field]: value },
        ])
      ),
    }));
  };

  const toggleDateCategory = (slug: string) => {
    if (openDateCategories.has(slug)) {
      datesCategoryAnimatedRef.current.delete(slug);
    }
    setOpenDateCategories((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const makeDatesCategoryBodyRef = (slug: string) => (el: HTMLDivElement | null) => {
    if (!el || datesCategoryAnimatedRef.current.has(slug)) return;
    datesCategoryAnimatedRef.current.add(slug);
    gsap.from(el, {
      height: 0,
      opacity: 0,
      duration: 0.28,
      ease: 'power2.out',
      overflow: 'hidden',
      clearProps: 'height,opacity,overflow',
    });
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
          <form id="details-form" className="details-form" onSubmit={handleSubmit} noValidate>

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
            <div ref={s1Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
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
            <div ref={s2Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
              <p className="details-section__label">Key project contact</p>
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
            <div ref={s3Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
              <p className="details-section__label">Users to add</p>
              {isStarter ? (
                <div className="form-field">
                  <label
                    className="form-field__label text-label--sm color--tertiary"
                    htmlFor="usersToAdd"
                  >
                    Email addresses of users who need system access
                  </label>
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
                </div>
              ) : (
                <div className="form-field">
                  <label className="form-field__label text-label--sm color--tertiary">
                    Email addresses of users who need system access
                  </label>
                  <UserEmailInput
                    emails={userEmails}
                    inputValue={emailInput}
                    onInputChange={setEmailInput}
                    onAdd={addUserEmail}
                    onRemove={removeUserEmail}
                    onCsvImport={handleCsvImport}
                  />
                </div>
              )}
            </div>

            {/* Section 4 — Bespoke URL (hidden for starter) */}
            {!isStarter && (
              <div ref={s4Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
                <p className="details-section__label">Assessment portal URL</p>
                <div className="form-field">
                  <label
                    className="form-field__label text-label--sm color--tertiary form-field__label--flex"
                    htmlFor="bespokeUrl"
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
                  <div className="url-input-row">
                    <input
                      id="bespokeUrl"
                      type="text"
                      className={`form-field__input${err.bespokeUrl ? ' has-error' : ''}`}
                      value={form.bespokeUrl}
                      onChange={(e) => setForm((p) => ({ ...p, bespokeUrl: e.target.value }))}
                      placeholder="your-company"
                    />
                    <span className="url-input-suffix text-body--sm color--tertiary">
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
            <div ref={s5Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
              <p className="details-section__label">Candidate feedback reports</p>
              <p className="text-body--sm color--secondary">
                When a candidate completes all 4 sections of Vero Assess, a combined feedback
                report is automatically generated and sent to the candidate.
              </p>
              <a href="#" className="form-link">
                View an example report →
              </a>
              <p className="text-label--sm color--tertiary">
                Send feedback reports to candidates?
              </p>
              <div className="choice-cards">
                {(['yes', 'no'] as const).map((val) => (
                  <label
                    key={val}
                    className={`choice-card${form.sendFeedbackReports === val ? ' is-selected' : ''}`}
                    htmlFor={`feedback-${val}`}
                  >
                    <input
                      type="radio"
                      id={`feedback-${val}`}
                      name="sendFeedbackReports"
                      value={val}
                      checked={form.sendFeedbackReports === val}
                      onChange={() => setForm((p) => ({ ...p, sendFeedbackReports: val }))}
                      className="choice-card__input"
                    />
                    <span className="choice-card__indicator" aria-hidden="true" />
                    <span className="text-body--sm font--medium color--primary">
                      {val === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section 6 — Portal branding (hidden for starter) */}
            {!isStarter && (
              <div ref={s6Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
                <p className="details-section__label">Portal branding</p>
                <div className="form-field">
                  <label
                    className="form-field__label text-label--sm color--tertiary"
                    htmlFor="brandLogo"
                  >
                    Logo
                  </label>
                  <div
                    className={`logo-upload${logoFileName ? ' has-file' : ''}`}
                    onClick={() => document.getElementById('brandLogo')?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('is-dragging');
                    }}
                    onDragLeave={(e) => e.currentTarget.classList.remove('is-dragging')}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('is-dragging');
                      const file = e.dataTransfer.files[0];
                      if (file) setLogoFileName(file.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('brandLogo')?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload logo"
                  >
                    <input
                      id="brandLogo"
                      type="file"
                      accept="image/*"
                      className="logo-upload__input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setLogoFileName(file.name);
                      }}
                    />
                    {logoFileName ? (
                      <>
                        <span className="logo-upload__icon" aria-hidden="true">✓</span>
                        <span className="logo-upload__filename text-body--sm color--primary">
                          {logoFileName}
                        </span>
                        <span className="text-body--xs color--tertiary">Click to replace</span>
                      </>
                    ) : (
                      <>
                        <span className="logo-upload__icon" aria-hidden="true">↑</span>
                        <span className="text-body--sm color--secondary">
                          Click to upload your logo
                        </span>
                        <span className="text-body--xs color--tertiary">
                          PNG, JPG or SVG — max 2MB
                        </span>
                      </>
                    )}
                  </div>
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
                    <div className="colour-input-row">
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
                          className="colour-swatch"
                          style={{ background: form.brandColour1 }}
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
                    <div className="colour-input-row">
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
                          className="colour-swatch"
                          style={{ background: form.brandColour2 }}
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
            <div ref={s7Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
              <p className="details-section__label">Campaign dates</p>

              {/* Apply to all toggle */}
              <div className="dates-apply-all">
                <div className="toggle-row">
                  <label className="toggle-switch" htmlFor="applyAllDates">
                    <input
                      type="checkbox"
                      id="applyAllDates"
                      className="toggle-switch__input"
                      checked={applyAllDates}
                      onChange={(e) => setApplyAllDates(e.target.checked)}
                    />
                    <span className="toggle-switch__track" aria-hidden="true">
                      <span className="toggle-switch__thumb" />
                    </span>
                  </label>
                  <span className="text-body--sm color--secondary">
                    Apply the same dates to all roles
                  </span>
                </div>

                {applyAllDates && (
                  <div className="dates-apply-all__inputs">
                    <div className="form-field">
                      <label
                        className="form-field__label text-label--sm color--tertiary"
                        htmlFor="globalOpenDate"
                      >
                        Open date
                      </label>
                      <input
                        id="globalOpenDate"
                        type="date"
                        className="form-field__input"
                        value={globalOpenDate}
                        onChange={(e) => handleGlobalDateChange('openDate', e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label
                        className="form-field__label text-label--sm color--tertiary"
                        htmlFor="globalCloseDate"
                      >
                        Close date
                      </label>
                      <input
                        id="globalCloseDate"
                        type="date"
                        className="form-field__input"
                        value={globalCloseDate}
                        onChange={(e) => handleGlobalDateChange('closeDate', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Per-category accordion */}
              {!applyAllDates && (
                <div className="dates-categories">
                  {dateRolesByCategory.map((cat) => {
                    const isOpen = openDateCategories.has(cat.slug);
                    const datesSetCount = cat.roles.filter((r) => {
                      const d = form.roleDates[r.roleId];
                      return d?.openDate && d?.closeDate;
                    }).length;

                    return (
                      <div
                        key={cat.slug}
                        className={`dates-category${isOpen ? ' is-open' : ''}`}
                      >
                        <button
                          type="button"
                          className="dates-category__header"
                          onClick={() => toggleDateCategory(cat.slug)}
                          aria-expanded={isOpen}
                        >
                          <div className="dates-category__info">
                            <span className="text-body--sm font--medium color--primary">
                              {cat.name}
                            </span>
                            <span className="text-label--sm color--tertiary">
                              {cat.roles.length} role{cat.roles.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="dates-category__badges">
                            {datesSetCount > 0 && (
                              <span className="section-label">
                                {datesSetCount} date{datesSetCount !== 1 ? 's' : ''} set
                              </span>
                            )}
                            <span className="role-category__chevron" aria-hidden="true" />
                          </div>
                        </button>

                        {isOpen && (
                          <div
                            ref={makeDatesCategoryBodyRef(cat.slug)}
                            className="dates-category__body"
                          >
                            {cat.roles.map((role, idx) => {
                              const dates = form.roleDates[role.roleId] ?? {
                                openDate: '',
                                closeDate: '',
                              };
                              return (
                                <div
                                  key={role.roleId}
                                  className={`dates-role-row${
                                    idx === cat.roles.length - 1 ? ' dates-role-row--last' : ''
                                  }`}
                                >
                                  <span className="text-body--sm color--secondary dates-role-row__name">
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
                                            [role.roleId]: {
                                              ...dates,
                                              openDate: e.target.value,
                                            },
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
                                            [role.roleId]: {
                                              ...dates,
                                              closeDate: e.target.value,
                                            },
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div ref={actionsRef as React.RefObject<HTMLDivElement>} className="details-actions">
              <Button variant="primary" size="md" type="submit" disabled={!requiredFilled}>
                Continue to contract →
              </Button>
              <Link href="/get-started" className="form-back-link">
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
