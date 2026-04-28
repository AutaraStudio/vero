'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import './ContactForm.css';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FormState {
  name: string;
  email: string;
  company: string;
  message: string;
}

interface Errors {
  name?: string;
  email?: string;
  message?: string;
  form?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormState): Errors {
  const e: Errors = {};
  if (!values.name.trim())                    e.name    = 'Please enter your name';
  if (!values.email.trim())                   e.email   = 'Please enter your email';
  else if (!EMAIL_RE.test(values.email.trim())) e.email = 'Please enter a valid email';
  if (!values.message.trim())                 e.message = 'Please enter a message';
  else if (values.message.trim().length < 10) e.message = 'A bit more detail would help (at least 10 characters)';
  return e;
}

const INITIAL: FormState = { name: '', email: '', company: '', message: '' };

interface Props {
  /** Where the form posts. Default: /api/contact */
  endpoint?: string;
}

export default function ContactForm({ endpoint = '/api/contact' }: Props) {
  const [values, setValues]   = useState<FormState>(INITIAL);
  const [errors, setErrors]   = useState<Errors>({});
  const [status, setStatus]   = useState<Status>('idle');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    /* Live-clear an error once the user starts fixing it */
    if (touched[key] && errors[key as keyof Errors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function blur(key: keyof FormState) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validate({ ...values }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });

    const v = validate(values);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setStatus('submitting');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      setStatus('success');
      setValues(INITIAL);
      setTouched({});
    } catch (err) {
      setStatus('error');
      setErrors({
        form: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    }
  }

  /* ── Success state — replace form with confirmation ──── */
  if (status === 'success') {
    return (
      <div className="contact-form contact-form--success" role="status" aria-live="polite">
        <div className="contact-form__success-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10 16.5L14 20.5L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-h4 color--primary">Message received</h3>
        <p className="text-body--md color--secondary leading--snug">
          Thanks — we'll get back to you within one working day. In the meantime,
          feel free to keep exploring the site.
        </p>
        <Button
          variant="secondary"
          onClick={() => setStatus('idle')}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="contact-form__row">
        <Field
          id="cf-name"
          label="Your name"
          required
          value={values.name}
          onChange={(v) => update('name', v)}
          onBlur={() => blur('name')}
          error={touched.name ? errors.name : undefined}
          autoComplete="name"
        />
        <Field
          id="cf-email"
          label="Email"
          type="email"
          required
          value={values.email}
          onChange={(v) => update('email', v)}
          onBlur={() => blur('email')}
          error={touched.email ? errors.email : undefined}
          autoComplete="email"
          inputMode="email"
        />
      </div>

      <Field
        id="cf-company"
        label="Company"
        value={values.company}
        onChange={(v) => update('company', v)}
        autoComplete="organization"
      />

      <Field
        id="cf-message"
        label="Message"
        required
        textarea
        rows={5}
        value={values.message}
        onChange={(v) => update('message', v)}
        onBlur={() => blur('message')}
        error={touched.message ? errors.message : undefined}
        placeholder="Tell us a bit about what you're working on…"
      />

      {/* Form-level error (e.g. network failure) */}
      {errors.form && (
        <p className="contact-form__form-error" role="alert">
          {errors.form}
        </p>
      )}

      <div className="contact-form__actions">
        <Button
          variant="cta"
          type="submit"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </Button>
        <p className="text-body--xs color--tertiary">
          We'll only use these details to respond to your enquiry.
        </p>
      </div>
    </form>
  );
}

/* ── Field component ─────────────────────────────────────── */

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel';
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  required,
  type = 'text',
  textarea,
  rows = 4,
  placeholder,
  error,
  autoComplete,
  inputMode,
}: FieldProps) {
  const inputClass = `form-field__input${error ? ' has-error' : ''}${textarea ? ' form-field__textarea' : ''}`;

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label text-label--sm color--tertiary">
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          className={inputClass}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
