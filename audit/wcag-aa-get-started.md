# WCAG 2.2 AA Audit — Get Started Checkout Flow

**Date:** 2026-05-13
**Scope:** `/get-started/*` multi-step flow only (role picker, details, payment, contract, confirmation, bespoke).
**Method:** Manual code-level review.
**Target conformance:** WCAG 2.2 Level **AA** (AAA out of scope).

The public marketing pages were audited and remediated separately — see [wcag-aaa-audit.md](./wcag-aaa-audit.md). The checkout flow has its own layout (`/get-started/layout.tsx`) without the MegaNav or skip link, so it needs its own pass.

---

## TL;DR — What needs fixing, ranked

| # | Issue | WCAG | Severity | Effort | Files |
|---|---|---|---|---|---|
| 1 | Details form missing `autoComplete` on every name/email/phone/company/title field | 1.3.5 (AA) | **High** | S | `details/page.tsx` + `FormField` component |
| 2 | Steps 2–4 + bespoke have no `<h1>` (jump straight to `<h2>`) | 1.3.1 (A) / 2.4.6 (AA) | **High** | XS | 4 page files |
| 3 | No step-specific page `<title>` — every step inherits the site default | 2.4.2 (A) | **High** | XS | 6 page files |
| 4 | `UpsellNudge` modal: no ESC-to-close, no initial focus, no focus return | 2.1.2 (A) / 2.4.3 (A) | **High** | S | `UpsellNudge.tsx` |
| 5 | Basket drawer inside `RolePicker` (mobile): no ESC, no focus management | 2.1.2 (A) / 2.4.3 (A) | **High** | S | `RolePicker.tsx` |
| 6 | Invoice email field missing `autoComplete="email"` | 1.3.5 (AA) | Med | XS | `payment/page.tsx` |
| 7 | Stripe `PaymentElement` wrapper has no accessible name | 1.3.1 (A) | Med | XS | `payment/page.tsx` |
| 8 | User-email input fails silently on invalid email (no error announced) | 3.3.1 (A) | Med | S | `details/page.tsx` (UserEmailInput) |
| 9 | Contract is delivered as an external PDF — WCAG compliance of PDF not verified | n/a | Med | M | external file + `contract/ContractClient.tsx` |
| 10 | Checkout layout has no skip-link (and MegaNav is intentionally hidden) | 2.4.1 (A) | Low | XS | `get-started/layout.tsx` |

**Done well already:**
- `ContractClient` has a strong **3.3.4 Error Prevention** pattern (must open PDF → enable checkbox → enable submit)
- `bespoke/page.tsx` is a **reference implementation** of `autoComplete` — copy this pattern into `details/page.tsx`
- `ProgressBar` has `<nav aria-label="Checkout progress">` + `aria-current="step"` — correct
- All form errors use `aria-invalid` + `aria-describedby` + `role="alert"` consistently
- Form state is preserved across step navigation (3.3.7 Redundant Entry — pass)
- Stripe errors and processing states surface as DOM text (4.1.3 Status Messages — pass)

---

## 1. Details form — missing `autoComplete` (1.3.5 AA)

**File:** [src/app/(site)/get-started/details/page.tsx](src/app/(site)/get-started/details/page.tsx)

The `FormField` component (lines 300–342) does not accept an `autoComplete` prop. Every name/email/phone/company/title field on the details form is therefore missing autofill metadata that WCAG 2.2 AA 1.3.5 requires.

**Fields affected** (lines 701–759):
- `firstName` — should be `autoComplete="given-name"`
- `lastName` — `autoComplete="family-name"`
- `email` — `autoComplete="email"`
- `company` — `autoComplete="organization"`
- `jobTitle` — `autoComplete="organization-title"`
- `phone` — `autoComplete="tel"`

**Fix:** widen `FormField` to accept an optional `autoComplete?: string` and forward it to the `<input>`. Pass the appropriate value at each call site. `bespoke/page.tsx:182–298` already does this correctly — copy that exact set of values.

Bonus: also add `inputMode="email"` on the email field for better mobile keyboards.

---

## 2. Steps 2–4 + bespoke have no `<h1>` (1.3.1 A / 2.4.6 AA)

Most checkout pages skip straight to `<h2>` without an `<h1>`. Screen readers and document outlines see a missing top-level heading.

| Step | Current top heading | File:line |
|---|---|---|
| `/get-started` (role picker) | ✅ `<h1>` "Select your roles" | `components/RolePicker.tsx:241` |
| `/get-started/details` | ❌ `<h2>` "Your details" | `details/page.tsx:687` |
| `/get-started/payment` | ❌ `<h2>` "Payment details" | `payment/page.tsx:291` |
| `/get-started/contract` | ❌ `<h2>` "Review and accept …" | `contract/ContractClient.tsx:67` |
| `/get-started/confirmation` | ✅ `<h1>` | `confirmation/page.tsx:174 + 218` |
| `/get-started/bespoke` | ❌ `<h2>` "Tell us about your requirements" | `bespoke/page.tsx:156` |

**Fix:** promote each step's main heading to `<h1>`. Existing `text-h2`/`text-h3` Tailwind/utility classes can stay — they're just visual sizing, semantics changes independently. Demote any nested headings if a clash arises.

---

## 3. No per-step `<title>` (2.4.2 A)

None of the `get-started/*` page files export `generateMetadata` or a `metadata` constant. They all inherit the site-wide default `<title>` from the root layout's `generateMetadata`. WCAG 2.4.2 (Level A) requires each page to have a unique, descriptive title so users can orient when switching tabs.

**Fix:** add `export const metadata = { title: '…' }` to each step's `page.tsx`:

| File | Suggested title |
|---|---|
| `get-started/page.tsx` | `'Select roles — Get started'` |
| `get-started/details/page.tsx` | `'Your details — Get started'` |
| `get-started/payment/page.tsx` | `'Payment — Get started'` |
| `get-started/contract/page.tsx` | `'Review terms — Get started'` |
| `get-started/confirmation/page.tsx` | `'Order confirmed — Vero Assess'` |
| `get-started/bespoke/page.tsx` | `'Bespoke enquiry — Get started'` |

The root layout's `generateMetadata` already provides a title template like `"%s — Vero Assess"` — so each step's title slots in automatically.

---

## 4. `UpsellNudge` modal — missing dialog plumbing (2.1.2 A / 2.4.3 A)

**File:** [src/app/(site)/get-started/components/UpsellNudge.tsx](src/app/(site)/get-started/components/UpsellNudge.tsx)

The component has correct dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="nudge-headline"`), but is missing three pieces of expected dialog behaviour:

1. **No ESC-to-close** — keyboard users can't dismiss the nudge
2. **No initial focus** — when the dialog opens, focus stays wherever it was (often outside the dialog)
3. **No focus return** — when the dialog closes, focus doesn't return to the trigger

**Fix:** mirror the pattern already implemented in `NavBasket.tsx` (Batch 4 of the public-pages audit) — `triggerRef` captured at open, focus moved to a `closeBtnRef` inside the dialog on `useEffect`, `triggerRef.current?.focus()` after close. Plus a `keydown` listener that closes on Escape.

---

## 5. Basket drawer inside `RolePicker` — same missing plumbing

**File:** [src/app/(site)/get-started/components/RolePicker.tsx](src/app/(site)/get-started/components/RolePicker.tsx) (lines 426–438 area)

The mobile basket drawer also has correct ARIA but lacks ESC-to-close, initial focus on the close button, and focus return on close. Same fix as item 4.

---

## 6. Invoice email field missing `autoComplete` (1.3.5 AA)

**File:** [src/app/(site)/get-started/payment/page.tsx:515-540](src/app/(site)/get-started/payment/page.tsx#L515)

The "Send invoice to a different email?" `<input type="email">` has all the right labelling but no `autoComplete="email"`. One-line fix.

---

## 7. Stripe `PaymentElement` wrapper has no accessible name (1.3.1 A)

**File:** [src/app/(site)/get-started/payment/page.tsx:64-73](src/app/(site)/get-started/payment/page.tsx#L64)

The `<div className="stripe-element-wrapper">` containing Stripe's iframe-rendered `<PaymentElement>` has no accessible name. The fields inside the Stripe iframe are labelled by Stripe internally, but the wrapper region itself is anonymous to AT. Add `aria-label="Payment card details"` (or `aria-labelledby` pointing to a nearby heading).

**Note:** the autocomplete fields *inside* Stripe's iframe (cardholder name, billing address) are handled by Stripe and not directly controllable from this code. We can't fix those from our component; we rely on Stripe Elements doing it right. Worth flagging that as an external dependency.

---

## 8. UserEmailInput silent validation (3.3.1 A)

**File:** [src/app/(site)/get-started/details/page.tsx:56-296](src/app/(site)/get-started/details/page.tsx#L56) (UserEmailInput sub-component)

If a user types an invalid email and clicks "Add" (or presses Enter), the add silently fails — no error is announced or rendered. Sighted users see the input not clear; screen-reader users get nothing.

**Fix:** add a local `error` state, render a `role="alert"` paragraph below the input when validation fails (e.g. `"Enter a valid email address"`), and clear it on next keystroke.

---

## 9. Contract delivered as an external PDF (uncertain)

**File:** [src/app/(site)/get-started/contract/ContractClient.tsx:43](src/app/(site)/get-started/contract/ContractClient.tsx#L43)

`ContractClient` opens `contractPdfUrl` in a new window via `window.open(...)`. The PDF itself must be WCAG-AA compliant (tagged structure, real text not scanned images, proper reading order, accessible form fields if any). The page component is fine; the PDF asset is the unknown.

**Action:** run the PDF through Adobe Acrobat's Accessibility Checker (or equivalent — e.g. PAC 2024) and remediate findings in the source document. This is a content-team task, not a code task.

---

## 10. Checkout layout has no skip-link (2.4.1 A)

**File:** [src/app/(site)/get-started/layout.tsx](src/app/(site)/get-started/layout.tsx)

The site-wide skip link lives in `ConditionalShell.tsx`, which is intentionally bypassed when `pathname.startsWith('/get-started')` is true (so the marketing nav doesn't show during checkout). The get-started layout has a thin header (logo + plan summary), but no skip link.

Because the get-started header is short — logo + plan bar — the bypass-blocks rationale is weaker here than on a full marketing page. Still, technically a Level A criterion.

**Fix (small):** add a skip-link in `get-started/layout.tsx` immediately inside `<GetStartedShell>` pointing to the existing `<main id="main-content" tabIndex={-1}>`. The CSS class `.skip-link` already exists in `globals.css`.

---

## Things the audit looked at and found compliant

These passed cleanly and don't need work:

- **ProgressBar** (`components/ProgressBar.tsx:83-130`) — `<nav aria-label="Checkout progress">`, `<ol role="list">`, `aria-current="step"` on the active item, descriptive labels. Reference-quality implementation of a step indicator.
- **Form labels + error association** — every `FormField` correctly pairs `<label htmlFor>` with `<input id>` and wires `aria-invalid` / `aria-describedby` / `role="alert"`. Only `autoComplete` is missing.
- **`bespoke/page.tsx`** — full `autoComplete` coverage, proper labels, descriptive errors. Copy this pattern into `details/page.tsx`.
- **`ContractClient` flow** — "open PDF → enable checkbox → enable submit" is an elegant WCAG 3.3.4 Error Prevention pattern.
- **3.3.7 Redundant Entry** — form state is held in the basket store and re-populates when the user navigates back. Excellent.
- **4.1.3 Status Messages** — Stripe processing states, loading text, error notices all render as DOM text reachable by AT.
- **Custom file upload** (details page logo upload, lines 944–1007) — keyboard-operable button with `role="button"` + `tabIndex={0}` + Enter/Space handlers + descriptive `aria-label`. Filename feedback on upload.
- **2.4.7 Focus Visible** — all interactive elements are native `<button>` / `<input>` / `<a>` and inherit the global `:focus-visible` rule added in the public-pages Batch 1.
- **3.2.3 Consistent Navigation** — `PlanBar` + `ProgressBar` appear consistently across steps (except where intentionally hidden on terminal states).
- **3.2.2 On Input** — no field auto-submits or auto-navigates. All step transitions are user-triggered.

---

## Out of scope

- **The PDF contract itself** — content-team review
- **Stripe iframe internals** — external dependency, can't be remediated in our code
- **`/coming-soon`** — separate audit
- **`/admin/*`** — internal-only, separate audit
- **Screen reader manual passes** — recommended once the code changes land
- **Reduced-motion** — AAA, not in scope for AA target

---

## Recommended sequencing

**Batch G1 — quick wins (one PR, ~half-day):**
- Add `autoComplete` prop to `FormField` and wire it on every details-page field (item 1)
- Add `autoComplete="email"` to invoice email (item 6)
- Add `aria-label="Payment card details"` to Stripe wrapper (item 7)
- Promote `<h2>` → `<h1>` on details / payment / contract / bespoke (item 2)
- Add `export const metadata` per step (item 3)
- Add skip link to checkout layout (item 10)

**Batch G2 — dialog plumbing (one PR, ~half-day):**
- ESC handler + initial focus + focus return on `UpsellNudge` (item 4)
- Same on RolePicker's mobile basket drawer (item 5)
- Visible error on UserEmailInput silent fail (item 8)

**Batch G3 — content audit (separate task):**
- PDF accessibility check + remediation (item 9)

Once G1 and G2 land, the get-started flow will be at AA across all measured criteria. G3 closes the last unknown.
