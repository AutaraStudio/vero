'use client';

/**
 * Shared form helpers + sub-components used across the get-started
 * checkout steps (Your Details and Portal Setup). Extracted so both
 * pages render identical field UI without duplicating ~300 lines.
 */

import { useRef, useState } from 'react';
import { isValidEmail } from '@/lib/emailValidation';

// ── Helper: normalise hex colour input ───────────────────────

export function normaliseHex(raw: string): string {
  const stripped = raw.replace(/^#+/, '');
  if (/^[0-9A-Fa-f]{1,6}$/.test(stripped)) return '#' + stripped;
  return raw;
}

// ── Helper: working-day date constraints ─────────────────────

function addWorkingDays(from: Date, days: number): Date {
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added++;
  }
  return result;
}

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Earliest selectable campaign open date — two working days out. */
export const MIN_OPEN_DATE = toDateString(addWorkingDays(new Date(), 2));

/** Latest close date for a given open date — one year after open. */
export function getMaxCloseDate(openDate: string): string {
  if (!openDate) return '';
  const d = new Date(openDate);
  d.setFullYear(d.getFullYear() + 1);
  return toDateString(d);
}

// ── Helper: single form field ─────────────────────────────────

export function FormField({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  readOnly = false,
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  readOnly?: boolean;
  /** WCAG 1.3.5 — supply the appropriate autofill token for personal-data fields */
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal' | 'search' | 'url' | 'none';
}) {
  const errorId = `${id}-error`;
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
        onBlur={onBlur}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && <span id={errorId} className="form-field__error" role="alert">{error}</span>}
    </div>
  );
}

// ── Helper: user email input ──────────────────────────────────

const EMAIL_INITIAL_VISIBLE = 5;
const EMAIL_LOAD_MORE_COUNT = 10;

export function UserEmailInput({
  emails,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  onUpdate,
  onCsvImport,
  maxEmails,
  showCsvImport = true,
}: {
  emails: string[];
  inputValue: string;
  onInputChange: (v: string) => void;
  onAdd: (email: string) => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, newEmail: string) => void;
  onCsvImport: (file: File) => void;
  maxEmails: number;
  showCsvImport?: boolean;
}) {
  const csvRef = useRef<HTMLInputElement>(null);
  const atLimit = emails.length >= maxEmails;

  const [visibleCount, setVisibleCount] = useState(EMAIL_INITIAL_VISIBLE);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  /* WCAG 3.3.1 — previously, invalid emails were silently rejected by the
     parent. We now surface validation in-place so the user knows why their
     entry didn't land. */
  const [addError, setAddError] = useState<string | null>(null);

  const tryAdd = () => {
    const trimmed = inputValue.trim().toLowerCase();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setAddError('Enter a valid email address');
      return;
    }
    if (emails.includes(trimmed)) {
      setAddError('That email is already on the list');
      return;
    }
    setAddError(null);
    onAdd(inputValue);
  };

  const handleInputChange = (v: string) => {
    if (addError) setAddError(null);
    onInputChange(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryAdd();
    }
  };

  /* Auto-add on blur — the most common mistake is typing an email and
     moving on (or clicking Continue) without pressing Add, which
     silently discards it. Adding on blur means a valid pending email is
     never lost. Clicking the Add button itself doesn't blur the input
     (see onMouseDown preventDefault below), so this can't double-fire. */
  const handleBlur = () => {
    if (inputValue.trim()) tryAdd();
  };

  /* The Add button reads as "ready to use" when the input holds a valid,
     not-yet-added email — a clearer affordance than the plain enabled
     state. */
  const inputTrimmed = inputValue.trim().toLowerCase();
  const isReadyToAdd =
    !!inputTrimmed &&
    !atLimit &&
    isValidEmail(inputTrimmed) &&
    !emails.includes(inputTrimmed);

  // Filter emails by search query
  const filteredEmails = searchQuery
    ? emails
        .map((email, i) => ({ email, originalIndex: i }))
        .filter(({ email }) => email.toLowerCase().includes(searchQuery.toLowerCase()))
    : emails.map((email, i) => ({ email, originalIndex: i }));

  // Progressive loading: show visibleCount items, load 10 more at a time
  const isSearching = searchQuery.length > 0;
  const visibleEmails = isSearching
    ? filteredEmails
    : filteredEmails.slice(0, visibleCount);
  const remainingCount = isSearching ? 0 : filteredEmails.length - visibleCount;
  const hasMore = remainingCount > 0;
  const showLessVisible = !isSearching && visibleCount > EMAIL_INITIAL_VISIBLE;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + EMAIL_LOAD_MORE_COUNT);
  };

  const handleShowLess = () => {
    setVisibleCount(EMAIL_INITIAL_VISIBLE);
  };

  // Inline editing
  const startEdit = (index: number, email: string) => {
    setEditingIndex(index);
    setEditValue(email);
  };

  const saveEdit = (originalIndex: number) => {
    const trimmed = editValue.trim().toLowerCase();
    if (trimmed && isValidEmail(trimmed) && trimmed !== emails[originalIndex]) {
      onUpdate(originalIndex, trimmed);
    }
    setEditingIndex(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  return (
    <div className="user-emails">
      {/* Header row — counter pill on the left, CSV import on the right.
          Reads as a single bar above the input so the section doesn't
          stack into multiple offset rows. */}
      <div className="user-emails__header-row">
        <div
          className={`user-emails__counter${atLimit ? ' is-full' : ''}`}
          role="status"
          aria-live="polite"
        >
          <span className="user-emails__counter-count text-body--xs color--primary">
            {String(emails.length).padStart(2, '0')} / {String(maxEmails).padStart(2, '0')}
          </span>
          <span className="user-emails__counter-label text-body--xs color--secondary">
            {atLimit ? 'user limit reached' : `user${maxEmails === 1 ? '' : 's'} added`}
          </span>
        </div>

        {showCsvImport && (
          <>
            <button
              type="button"
              className="user-emails__import-btn"
              onClick={() => csvRef.current?.click()}
              disabled={atLimit}
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
          </>
        )}
      </div>

      <div className="user-emails__add-row">
        <input
          type="email"
          autoComplete="email"
          inputMode="email"
          className={`form-field__input${addError ? ' has-error' : ''}`}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={atLimit ? 'User limit reached' : 'jane@company.com'}
          aria-label="Add email address"
          aria-invalid={!!addError}
          aria-describedby={addError ? 'user-email-add-error' : undefined}
          disabled={atLimit}
        />
        <button
          type="button"
          className={`user-emails__add-btn${isReadyToAdd ? ' is-ready' : ''}`}
          /* Keep focus on the input when Add is clicked so the input's
             onBlur auto-add can't fire a duplicate alongside this click. */
          onMouseDown={(e) => e.preventDefault()}
          onClick={tryAdd}
          disabled={!inputValue.trim() || atLimit}
        >
          Add
        </button>
      </div>

      {/* Ghost rows — decorative duplicates that hint "you can add many".
          Only shown until the user adds their first email; the chip list
          below takes over after that. aria-hidden + tabIndex/-1 keeps them
          out of the AT and keyboard tree. */}
      {emails.length === 0 && !atLimit && (
        <div className="user-emails__ghost-rows" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="user-emails__add-row is-ghost">
              <input
                type="email"
                className="form-field__input"
                placeholder="jane@company.com"
                tabIndex={-1}
                disabled
              />
              <button
                type="button"
                className="user-emails__add-btn"
                tabIndex={-1}
                disabled
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {addError && (
        <span
          id="user-email-add-error"
          className="form-field__error"
          role="alert"
        >
          {addError}
        </span>
      )}

      {emails.length === 0 && (
        <div className="user-emails__empty" role="status">
          <span className="user-emails__empty-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="12" cy="16.25" r="1" fill="currentColor" />
            </svg>
          </span>
          <p className="user-emails__empty-text">
            <strong>No users added yet.</strong> Enter the email address of
            everyone who needs to log in and view candidate results, then press
            Add or hit Enter. At least one is required to continue.
          </p>
        </div>
      )}

      {emails.length > 0 && (
        <>
          {/* Search bar — shown when emails exceed initial threshold */}
          {emails.length > EMAIL_INITIAL_VISIBLE && (
            <div className="user-emails__search">
              <input
                type="text"
                className="form-field__input user-emails__search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email addresses..."
                aria-label="Search email addresses"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="user-emails__search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <div className="user-emails__chips">
            {visibleEmails.map(({ email, originalIndex }) => (
              <div key={`${originalIndex}-${email}`} className="user-email-chip">
                {editingIndex === originalIndex ? (
                  <input
                    type="email"
                    className="user-email-chip__edit-input text-body--sm"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); saveEdit(originalIndex); }
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    onBlur={() => saveEdit(originalIndex)}
                    autoFocus
                  />
                ) : (
                  <span className="text-body--sm color--primary user-email-chip__address">
                    {email}
                  </span>
                )}
                <div className="user-email-chip__actions">
                  {editingIndex !== originalIndex && (
                    <button
                      type="button"
                      className="user-email-chip__edit"
                      onClick={() => startEdit(originalIndex, email)}
                      aria-label={`Edit ${email}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    className="user-email-chip__remove"
                    onClick={() => onRemove(originalIndex)}
                    aria-label={`Remove ${email}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show more / Show less */}
          {(hasMore || showLessVisible) && (
            <div className="user-emails__toggle-row">
              {hasMore && (
                <button
                  type="button"
                  className="user-emails__toggle text-body--xs"
                  onClick={handleShowMore}
                >
                  Show {Math.min(remainingCount, EMAIL_LOAD_MORE_COUNT)} more
                  <span className="color--tertiary"> ({remainingCount} remaining)</span>
                </button>
              )}
              {showLessVisible && (
                <button
                  type="button"
                  className="user-emails__toggle text-body--xs"
                  onClick={handleShowLess}
                >
                  Collapse
                </button>
              )}
            </div>
          )}

          {/* Search results count */}
          {searchQuery && (
            <span className="text-body--xs color--tertiary">
              {filteredEmails.length} result{filteredEmails.length !== 1 ? 's' : ''} found
            </span>
          )}
        </>
      )}
    </div>
  );
}
