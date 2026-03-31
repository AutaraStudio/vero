'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import OrderSummary from '../components/OrderSummary';
import { useBasket } from '@/store/basketStore';
import type { ContactDetails } from '@/store/basketStore';
import './details.css';

type FieldKey = keyof ContactDetails;

const FIELDS: Array<{
  key: FieldKey;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
}> = [
  { key: 'firstName', label: 'First name',    type: 'text',  placeholder: 'Jane',              required: true  },
  { key: 'lastName',  label: 'Last name',     type: 'text',  placeholder: 'Smith',             required: true  },
  { key: 'email',     label: 'Work email',    type: 'email', placeholder: 'jane@company.com',  required: true  },
  { key: 'company',   label: 'Company name',  type: 'text',  placeholder: 'Acme Ltd',          required: true  },
  { key: 'jobTitle',  label: 'Job title',     type: 'text',  placeholder: 'Head of People',    required: true  },
  { key: 'phone',     label: 'Phone number',  type: 'tel',   placeholder: '+44 7700 900000',   required: false },
];

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function DetailsPage() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, contactDetails } = state;

  const [form, setForm] = useState<ContactDetails>(contactDetails);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  // Guard: redirect if basket is empty
  useEffect(() => {
    if (selectedRoles.length === 0) {
      router.replace('/get-started');
    }
  }, [selectedRoles.length, router]);

  const validate = () => {
    const next: Partial<Record<FieldKey, string>> = {};
    FIELDS.forEach(({ key, label, type, required }) => {
      if (required && !form[key].trim()) {
        next[key] = `${label} is required.`;
      } else if (key === 'email' && form[key] && !validateEmail(form[key])) {
        next[key] = 'Please enter a valid email address.';
      }
    });
    return next;
  };

  const handleChange = (key: FieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitted) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    dispatch({ type: 'SET_CONTACT_DETAILS', payload: form });
    router.push('/get-started/contract');
  };

  // Pair first/last name; others are full-width
  const pairedFields = [
    FIELDS.slice(0, 2),     // firstName + lastName
    [FIELDS[2]],             // email
    [FIELDS[3]],             // company
    [FIELDS[4]],             // jobTitle
    [FIELDS[5]],             // phone
  ];

  return (
    <section className="details-page">
      <div className="container">
        <div className="details-layout">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate className="details-form">
            <div className="details-form__heading">
              <h1 className="text-h3 color--primary">Your details</h1>
              <p className="text-body--md color--secondary">
                We&apos;ll use these to set up your account and send your contract.
              </p>
            </div>

            {pairedFields.map((group, gi) => (
              <div key={gi} className={group.length > 1 ? 'form-row' : undefined}>
                {group.map(({ key, label, type, placeholder, required }) => (
                  <div key={key} className="form-field">
                    <label
                      htmlFor={`field-${key}`}
                      className="text-label--sm color--tertiary form-field__label"
                    >
                      {label}{required ? '' : ' (optional)'}
                    </label>
                    <input
                      id={`field-${key}`}
                      type={type}
                      value={form[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      required={required}
                      className={`form-field__input${errors[key] ? ' has-error' : ''}`}
                      autoComplete={
                        key === 'firstName' ? 'given-name' :
                        key === 'lastName'  ? 'family-name' :
                        key === 'email'     ? 'email' :
                        key === 'company'   ? 'organization' :
                        key === 'phone'     ? 'tel' : 'off'
                      }
                    />
                    <span className="form-field__error text-body--2xs" role="alert">
                      {errors[key] ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            ))}

            <div className="details-actions">
              <Button variant="primary" size="md" type="submit">
                Continue to contract →
              </Button>
              <Button variant="secondary" size="md" href="/get-started">
                ← Back
              </Button>
            </div>
          </form>

          {/* ── Order summary ── */}
          <OrderSummary />

        </div>
      </div>
    </section>
  );
}
