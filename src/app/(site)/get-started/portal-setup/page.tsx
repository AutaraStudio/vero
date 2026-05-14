'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBasket, type ContactDetails } from '@/store/basketStore';
import { TIER_USER_LIMITS, type TierKey } from '@/lib/tierRecommendation';
import { useTextReveal } from '@/hooks/useTextReveal';
import { useFadeUp } from '@/hooks/useFadeUp';
import { gsap } from '@/lib/gsap';
import { Tooltip, TooltipContent } from '@/components/Tooltip/Tooltip';
import BasketContent from '../components/BasketContent';
import { usePublishPlanBarSubmitDisabled } from '../components/planBarSubmit';
import {
  UserEmailInput,
  normaliseHex,
  MIN_OPEN_DATE,
  getMaxCloseDate,
} from '../components/checkoutFormHelpers';
import { isValidEmail } from '@/lib/emailValidation';
import '../details/details.css';

// ── Page — Step 3: Portal setup ───────────────────────────────
// Users to add, assessment portal URL, candidate feedback reports,
// portal branding, and campaign dates. Contact info lives on the
// previous "Your details" step.

export default function PortalSetupPage() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, contactDetails, recommendedTier } = state;
  const isStarter = recommendedTier === 'starter';
  const userLimit = recommendedTier ? TIER_USER_LIMITS[recommendedTier as TierKey] : 5;

  /* WCAG 2.4.2 — descriptive page title for this checkout step. */
  useEffect(() => {
    document.title = 'Portal setup — Vero Assess';
  }, []);

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
  const [touched, setTouched] = useState<Partial<Record<keyof ContactDetails, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Logo upload state
  const [logoFileName, setLogoFileName] = useState<string>(() => form.logoFileName || '');

  const handleLogoFile = (file: File) => {
    setLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setForm((p) => ({ ...p, logoFile: base64, logoFileName: file.name }));
    };
    reader.readAsDataURL(file);
  };

  // User emails state
  const [userEmails, setUserEmails] = useState<string[]>(() =>
    form.usersToAdd ? form.usersToAdd.split('\n').filter(Boolean) : []
  );
  const [emailInput, setEmailInput] = useState('');

  const addUserEmail = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email || !isValidEmail(email)) return;
    if (userEmails.includes(email)) { setEmailInput(''); return; }
    if (userEmails.length >= userLimit) return;
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

  const updateUserEmail = (index: number, newEmail: string) => {
    const next = [...userEmails];
    next[index] = newEmail;
    setUserEmails(next);
    setForm((p) => ({ ...p, usersToAdd: next.join('\n') }));
  };

  const handleCsvImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const found = text
        .split(/[\n,;\r]+/)
        .map((s) => s.trim().toLowerCase().replace(/^["']|["']$/g, ''))
        .filter((s) => isValidEmail(s));
      const merged = [...new Set([...userEmails, ...found])];
      const next = merged.slice(0, userLimit);
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
  const [overriddenRoleDates, setOverriddenRoleDates] = useState<Set<string>>(new Set());

  // Starter accounts include exactly one user — their buyer email.
  useEffect(() => {
    if (isStarter) {
      setForm((prev) => ({ ...prev, usersToAdd: prev.email }));
    }
  }, [form.email, isStarter]);

  // ── Validation ─────────────────────────────────────────────

  const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  const SLUG_RE = /^[a-z0-9-]+$/;

  const validateField = (
    field: keyof ContactDetails,
    value: string,
  ): string | undefined => {
    switch (field) {
      case 'bespokeUrl':
        if (isStarter) return undefined;
        if (!value.trim()) return 'Portal URL is required';
        return SLUG_RE.test(value) ? undefined : 'Only lowercase letters, numbers, and hyphens';
      case 'brandColour1':
        if (isStarter) return undefined;
        if (!value.trim()) return 'Brand colour 1 is required';
        return HEX_RE.test(value) ? undefined : 'Enter a valid hex colour (e.g. #ff6600)';
      case 'brandColour2':
        if (isStarter) return undefined;
        if (!value.trim()) return 'Brand colour 2 is required';
        return HEX_RE.test(value) ? undefined : 'Enter a valid hex colour (e.g. #ff6600)';
      default:                return undefined;
    }
  };

  const validate = () => {
    const fields: (keyof ContactDetails)[] = ['bespokeUrl', 'brandColour1', 'brandColour2'];
    const errs: Partial<Record<keyof ContactDetails, string>> = {};
    fields.forEach((f) => {
      const msg = validateField(f, String(form[f] ?? ''));
      if (msg) errs[f] = msg;
    });
    return errs;
  };

  const setField = (field: keyof ContactDetails, value: string) => {
    setForm((p) => {
      const next = { ...p, [field]: value };
      if (touched[field] || submitAttempted) {
        const msg = validateField(field, value);
        setErrors((e) => ({ ...e, [field]: msg }));
      }
      return next;
    });
  };

  const handleBlur = (field: keyof ContactDetails) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const msg = validateField(field, String(form[field] ?? ''));
    setErrors((e) => ({ ...e, [field]: msg }));
  };

  /* Cross-field requirements — per client direction every question is
     compulsory. Combined with the per-field validators below, these
     gate the sticky Continue button. */
  const needsBranding = !isStarter;
  const needsDates = recommendedTier === 'starter' || recommendedTier === 'essential';

  const allDatesFilled = !needsDates
    ? true
    : selectedRoles.every((r) => {
        const d = form.roleDates[r.roleId];
        return !!(d?.openDate && d?.closeDate);
      });

  const usersFilled = isStarter
    ? form.usersToAdd.trim().length > 0
    : userEmails.length > 0;

  const logoFilled = !needsBranding ? true : !!form.logoFile;

  const fieldErrors = validate();
  const requiredFilled =
    Object.keys(fieldErrors).length === 0 &&
    usersFilled &&
    logoFilled &&
    allDatesFilled;

  /* Page-level error shown above the submit button when blocked. */
  const blockerMessage = !requiredFilled
    ? !usersFilled
      ? 'Please add at least one user email address.'
      : !logoFilled
      ? 'Please upload your portal logo.'
      : !allDatesFilled
      ? 'Please set open and close dates for every role.'
      : 'Please complete all required fields above.'
    : '';

  /* Gate the sticky PlanBar's Continue button — disabled until every
     required field on this step is complete and valid. */
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
          overriddenRoleDates.has(id) ? dates : { ...dates, [field]: value },
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

  if (selectedRoles.length === 0) return null;

  const err = errors;

  return (
    <section className="details-page">
      <div className="details-layout">

          {/* ── Form ── */}
          <form id="portal-setup-form" className="details-form" onSubmit={handleSubmit} noValidate>

            {/* Heading */}
            <div className="details-form__heading">
              <h1
                ref={headingRef as React.RefObject<HTMLHeadingElement>}
                className="text-h3 color--primary"
              >
                Portal setup
              </h1>
              <p className="text-body--sm color--tertiary">
                Set up who can access your assessment portal, how it&apos;s
                branded, and when your campaign runs.
              </p>
            </div>

            {/* Section — Users to add */}
            <div ref={s1Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
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
                    Email addresses of users who need system access (up to {userLimit})
                    <span aria-hidden="true" className="form-field__required">{' *'}</span>
                  </label>
                  <UserEmailInput
                    emails={userEmails}
                    inputValue={emailInput}
                    onInputChange={setEmailInput}
                    onAdd={addUserEmail}
                    onRemove={removeUserEmail}
                    onUpdate={updateUserEmail}
                    onCsvImport={handleCsvImport}
                    maxEmails={userLimit}
                    showCsvImport={userLimit >= 5}
                  />
                </div>
              )}
            </div>

            {/* Section — Assessment portal URL (hidden for starter) */}
            {!isStarter && (
              <div ref={s2Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
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
                      onChange={(e) => setField('bespokeUrl', e.target.value)}
                      onBlur={() => handleBlur('bespokeUrl')}
                      placeholder="your-company"
                      aria-invalid={!!err.bespokeUrl}
                      aria-describedby={err.bespokeUrl ? 'bespokeUrl-error' : undefined}
                    />
                    <span className="url-input-suffix text-body--sm color--tertiary">
                      .veroassess.com
                    </span>
                  </div>
                  {err.bespokeUrl && (
                    <span id="bespokeUrl-error" className="form-field__error" role="alert">{err.bespokeUrl}</span>
                  )}
                </div>
              </div>
            )}

            {/* Section — Candidate feedback reports */}
            <div ref={s3Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
              <p className="details-section__label">Candidate feedback reports</p>

              <div className="feedback-card">
                <div className="feedback-card__info">
                  <span className="feedback-card__icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <div className="feedback-card__info-text">
                    <p className="text-body--sm color--secondary">
                      When a candidate completes all 4 sections of Vero Assess, a combined feedback
                      report is automatically generated and sent to the candidate.
                    </p>
                  </div>
                </div>

                <div className="feedback-card__action">
                  <div className="feedback-card__action-text">
                    <p className="text-body--sm font--medium color--primary">
                      Send feedback reports to candidates
                    </p>
                    <p className="text-body--xs color--tertiary">
                      {form.sendFeedbackReports === 'yes'
                        ? 'Reports will be sent automatically on completion.'
                        : 'Reports will not be shared with candidates.'}
                    </p>
                  </div>
                  <label className="toggle-switch" htmlFor="sendFeedbackReports">
                    <input
                      type="checkbox"
                      id="sendFeedbackReports"
                      className="toggle-switch__input"
                      checked={form.sendFeedbackReports === 'yes'}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, sendFeedbackReports: e.target.checked ? 'yes' : 'no' }))
                      }
                    />
                    <span className="toggle-switch__track" aria-hidden="true">
                      <span className="toggle-switch__thumb" />
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section — Portal branding (hidden for starter) */}
            {!isStarter && (
              <div ref={s4Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
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
                      if (file) handleLogoFile(file);
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
                        if (file) handleLogoFile(file);
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
                <p className="text-body--xs color--tertiary">
                  Please use hex codes for the colours you want used.
                </p>
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
                        onChange={(e) => setField('brandColour1', normaliseHex(e.target.value))}
                        onBlur={() => handleBlur('brandColour1')}
                        placeholder="#472d6a"
                        maxLength={7}
                        aria-invalid={!!err.brandColour1}
                        aria-describedby={err.brandColour1 ? 'brandColour1-error' : undefined}
                      />
                      {/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.brandColour1) && (
                        <span
                          className="colour-swatch"
                          style={{ background: form.brandColour1 }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    {err.brandColour1 && (
                      <span id="brandColour1-error" className="form-field__error" role="alert">{err.brandColour1}</span>
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
                        onChange={(e) => setField('brandColour2', normaliseHex(e.target.value))}
                        onBlur={() => handleBlur('brandColour2')}
                        placeholder="#fec601"
                        maxLength={7}
                        aria-invalid={!!err.brandColour2}
                        aria-describedby={err.brandColour2 ? 'brandColour2-error' : undefined}
                      />
                      {/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(form.brandColour2) && (
                        <span
                          className="colour-swatch"
                          style={{ background: form.brandColour2 }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    {err.brandColour2 && (
                      <span id="brandColour2-error" className="form-field__error" role="alert">{err.brandColour2}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section — Campaign dates (Starter / Essential only; CS handles Growth & Scale) */}
            {(recommendedTier === 'starter' || recommendedTier === 'essential') && (
            <div ref={s5Ref as React.RefObject<HTMLDivElement>} className="stack--md details-section">
              <p className="details-section__label">Campaign dates</p>

              <p className="text-body--sm color--secondary">
                If you aren&apos;t sure of when you want your start and end dates to be, just leave them blank. You will be able to start inviting candidates once your link is live and can let us know an end date at a later stage. If you wish to amend these dates later, simply email <a href="mailto:support@veroassess.com" className="color--brand">support@veroassess.com</a>.
              </p>

              {/* Apply to all toggle */}
              <div className="dates-apply-all">
                <div className="toggle-row">
                  <label className="toggle-switch" htmlFor="applyAllDates">
                    <input
                      type="checkbox"
                      id="applyAllDates"
                      className="toggle-switch__input"
                      checked={applyAllDates}
                      onChange={(e) => {
                        setApplyAllDates(e.target.checked);
                        if (e.target.checked) setOverriddenRoleDates(new Set());
                      }}
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
                        min={MIN_OPEN_DATE}
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
                        min={globalOpenDate || MIN_OPEN_DATE}
                        max={getMaxCloseDate(globalOpenDate)}
                        onChange={(e) => handleGlobalDateChange('closeDate', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Per-category accordion — always visible; override individual roles when apply-all is on */}
              {applyAllDates && (
                <p className="text-body--xs color--tertiary dates-override-hint">
                  Need different dates for some roles? Override them below.
                </p>
              )}
                <div className="dates-categories">
                  {dateRolesByCategory.map((cat) => {
                    const isOpen = openDateCategories.has(cat.slug);
                    const datesSetCount = cat.roles.filter((r) => {
                      const d = form.roleDates[r.roleId];
                      return d?.openDate && d?.closeDate;
                    }).length;
                    const overrideCount = applyAllDates
                      ? cat.roles.filter((r) => overriddenRoleDates.has(r.roleId)).length
                      : 0;

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
                            {overrideCount > 0 && (
                              <span className="section-label dates-override-badge">
                                {overrideCount} override{overrideCount !== 1 ? 's' : ''}
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
                                      min={MIN_OPEN_DATE}
                                      onChange={(e) => {
                                        if (applyAllDates) {
                                          setOverriddenRoleDates((prev) => new Set(prev).add(role.roleId));
                                        }
                                        setForm((p) => ({
                                          ...p,
                                          roleDates: {
                                            ...p.roleDates,
                                            [role.roleId]: {
                                              ...dates,
                                              openDate: e.target.value,
                                            },
                                          },
                                        }));
                                      }}
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
                                      min={dates.openDate || MIN_OPEN_DATE}
                                      max={getMaxCloseDate(dates.openDate)}
                                      onChange={(e) => {
                                        if (applyAllDates) {
                                          setOverriddenRoleDates((prev) => new Set(prev).add(role.roleId));
                                        }
                                        setForm((p) => ({
                                          ...p,
                                          roleDates: {
                                            ...p.roleDates,
                                            [role.roleId]: {
                                              ...dates,
                                              closeDate: e.target.value,
                                            },
                                          },
                                        }));
                                      }}
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
            </div>
            )}

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
