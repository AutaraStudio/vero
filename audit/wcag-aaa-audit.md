# WCAG 2.2 AAA Accessibility Audit — Vero Assess

**Date:** 2026-05-13
**Scope:** 7 static public pages (Home, About, Contact, How It Works, Pricing, Science, Compliance) + shared infrastructure (layout, MegaNav, Footer, animation hooks, theme tokens).
**Method:** Manual code-level review. No automated tool scan run (recommended as a follow-up second pass).
**Target conformance:** WCAG 2.2 Level AAA. AA failures flagged separately as **higher priority**.

---

## TL;DR — What needs fixing, ranked

| # | Issue | WCAG | Level | Effort | Files |
|---|---|---|---|---|---|
| 1 | No skip-to-main link | 2.4.1 | **A** | XS | `(site)/ConditionalShell.tsx` |
| 2 | Animation hooks ignore `prefers-reduced-motion` | 2.3.3 | **AAA** | M | 4 hooks, Lenis, marquee, slider |
| 3 | Auto-scrolling marquee + auto-advancing slider can't be paused | 2.2.2 | **A** | S | `LogoMarquee`, `FeatureSlider` |
| 4 | Light-theme `--color--text-tertiary` likely fails AA contrast | 1.4.3 | **AA** | S | `globals.css` token redefine |
| 5 | Light-theme `--color--text-secondary` fails AAA contrast | 1.4.6 | AAA | S | `globals.css` token redefine |
| 6 | Dark-theme `--color--text-tertiary` (white @ 50%) fails AAA | 1.4.6 | AAA | S | `globals.css` token redefine |
| 7 | Orange/blue CTA + white label fails AA contrast | 1.4.3 | **AA** | S | `globals.css` interactive-cta-text |
| 8 | No global `:focus-visible` baseline | 2.4.7 / 2.4.13 | **AA** / AAA | S | `globals.css` |
| 9 | Image alt text falls back to `""` instead of meaningful default | 1.1.1 | **A** | XS | `FeatureSlider`, `StickySteps`, `DimensionsSection` |
| 10 | `<nav>` element has no `aria-label` | 1.3.1 | **A** *(best practice)* | XS | `MegaNav.tsx` |
| 11 | MegaNav dropdown panels may obscure focused elements | 2.4.11 | **AA** (2.2) | M | `MegaNav` sticky behaviour |
| 12 | `StickyTabs` misnamed — not a real tab widget | n/a (clarity) | — | XS | rename to `StickySections` |
| 13 | Cookie consent "Reject optional" button label is ambiguous | 3.3.2 | **A** | XS | `CookieConsent.tsx:97` |

**Hard blockers for AAA:** items 2, 5, 6.
**Hard blockers for AA:** items 1, 3, 4, 7, 8, 9, 11.

---

## 1. Foundational issues (affect every page)

### 1.1 Skip-to-main link — **2.4.1 Bypass Blocks (A) — FAIL**

There is no skip link anywhere in the layout chain (`src/app/layout.tsx`, `src/app/(site)/ConditionalShell.tsx`, `src/components/MegaNav/MegaNav.tsx`). Keyboard users must tab through the entire MegaNav (top items + dropdowns + basket + CTAs) before reaching page content on every navigation.

**Fix:** add a visually-hidden-until-focused link as the first focusable element in `ConditionalShell.tsx`, targeting `#main-content`. Every page already wraps content in `<main>` — add the `id="main-content"` attribute to those.

```tsx
<a href="#main-content" className="skip-link">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  inset-block-start: 0.5rem;
  inset-inline-start: 0.5rem;
  background: var(--color--surface-raised);
  color: var(--color--text-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius--md);
  transform: translateY(-200%);
  transition: transform var(--transition--default);
  z-index: 1000;
}
.skip-link:focus { transform: translateY(0); }
```

---

### 1.2 `prefers-reduced-motion` not honoured globally — **2.3.3 (AAA) — FAIL**

Only **one** of the project's animation primitives honours the user's reduced-motion preference: `src/hooks/useContentReveal.ts:30-49`. Every other animation runs at full intensity regardless of system setting.

| Animation source | File | Reduced-motion check? |
|---|---|---|
| `useTextReveal` (every heading h1–h4) | `src/hooks/useTextReveal.ts` | ❌ No |
| `useFadeUp` (body/CTA reveals everywhere) | `src/hooks/useFadeUp.ts` | ❌ No |
| `useScrollAnimation` | `src/hooks/useScrollAnimation.ts` | ❌ No |
| `useCountUp` | `src/hooks/useCountUp.ts` | ❌ No |
| `useContentReveal` | `src/hooks/useContentReveal.ts` | ✅ Yes (lines 30-49) |
| Lenis smooth scroll | `src/components/SmoothScroll.tsx:17-25` | ❌ No |
| Footer fan rotation/scale | `src/components/Footer/FooterFan.tsx:36-75` | ❌ No |
| LogoMarquee infinite scroll | `src/components/LogoMarquee/marqueeAnimation.ts` | ❌ No |
| FeatureSlider auto-advance | `src/components/FeatureSlider/sliderAnimations.ts` | ❌ No |
| MediaBlock modal open/close | `src/components/MediaBlock/MediaBlock.tsx:149-193` | ❌ No |

A handful of component CSS files (`CTAStatement.css:191`, `DirectionalList.css:122`, `Hero.css:222`, `StickySteps.css:204`, `Tooltip.css:163`) include local `@media (prefers-reduced-motion: reduce)` blocks — these are isolated fixes, not a system-wide guarantee. `globals.css` has **no** global reduced-motion rule.

**Fix (two layers):**

1. **Global CSS belt-and-braces in `globals.css`** — defuses any animation we miss:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
2. **Hook-level checks** — copy the pattern from `useContentReveal.ts:30-49` into `useTextReveal`, `useFadeUp`, `useScrollAnimation`, `useCountUp`, the marquee, the slider, the FooterFan, and the MediaBlock modal. Use `gsap.matchMedia()` for clean teardown:
   ```ts
   const mm = gsap.matchMedia();
   mm.add('(prefers-reduced-motion: no-preference)', () => {
     // full animation
   });
   mm.add('(prefers-reduced-motion: reduce)', () => {
     gsap.set(elements, { opacity: 1, y: 0, filter: 'none', visibility: 'visible' });
   });
   ```
3. **Lenis (`SmoothScroll.tsx`)** — short-circuit init when reduced motion is on:
   ```tsx
   if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
   ```

---

### 1.3 Auto-playing animation > 5 s can't be paused — **2.2.2 Pause Stop Hide (A) — FAIL**

- **`LogoMarquee`** (`src/components/LogoMarquee/LogoMarquee.tsx`) scrolls continuously via `initMarquee()` (line 62) — `marqueeAnimation.ts` has no pause control or `prefers-reduced-motion` check.
- **`FeatureSlider`** (`src/components/FeatureSlider/FeatureSlider.tsx:64`) uses `initGSAPSlider()` — auto-advance behaviour not user-pausable.

WCAG 2.2.2 requires a mechanism to pause, stop, or hide any auto-playing animation longer than 5 s. Today neither exists.

**Fix:**
- Add a visible pause/play toggle button to each component (small, top-right of the marquee/slider region), or
- Pause on hover **and** on keyboard focus within the region, or
- At minimum, fully stop the animation when `prefers-reduced-motion: reduce` (this alone does NOT satisfy 2.2.2 — a pause control is still required for non-reduced-motion users).

The clean fix is both: pause control + reduced-motion respect.

---

### 1.4 No global `:focus-visible` baseline — **2.4.7 (AA) / 2.4.13 (AAA) — PARTIAL**

`:focus-visible` styles exist in 7 places (`Button.css`, `MediaBlock.css`, `NavBasket.css`, `FAQSection.css`, `pricing.css`, `details.css`, `admin-landing.module.css`) — but there is no global baseline in `globals.css`. Any interactive element rendered without a per-component focus rule (links inside `MegaNav`, body links, slider arrows, social icons, etc.) inherits whatever the browser default is — and on some elements that default is invisible or removed by `*` resets.

**Fix:** add a global baseline at the bottom of `globals.css` that any component can override:

```css
:focus-visible {
  outline: 2px solid var(--color--interactive-primary);
  outline-offset: 2px;
  border-radius: var(--radius--sm);
}
```

For **AAA (2.4.13 Focus Appearance)** also verify each focus ring meets the size and contrast spec (perimeter ≥ 2 CSS px thick; 3:1 against both the focused element and the adjacent background). The current 2 px outline at `--color--interactive-primary` should satisfy this in most themes — needs re-verification in `dark-yellow`, `brand-yellow-deep`, and `brand-orange` where the colour contrast tightens.

---

## 2. Theme contrast — AAA 7:1 threshold

Contrast ratios calculated against actual hex values in `src/app/globals.css:151-251`. Approximations have ±0.2 tolerance. **All values are for normal text (≤ 18 pt / 14 pt bold).** Large-text AAA threshold is 4.5:1; normal-text AAA is 7:1.

### 2.1 Light themes (white-ish page-bg)

| Token | Resolved colour | vs page-bg (#fff) | AAA 7:1 | AA 4.5:1 |
|---|---|---|---|---|
| `--color--text-primary` (neutral-900 `#1d2331`) | very dark navy | **~16.3:1** | ✅ | ✅ |
| `--color--text-secondary` (neutral-600 `~#60656F`) | mid grey | **~5.8:1** | ❌ | ✅ |
| `--color--text-tertiary` (neutral-400 `~#A5A7AD`) | light grey | **~2.4:1** | ❌ | ❌ |

**Finding:** `--color--text-tertiary` (used for captions, footnotes, muted copy per `CLAUDE.md`) fails even **AA** on white. If it's used for any actual text (not decorative), this is a hard AA failure on every light-theme page.

**Fix options:**
- Darken `--swatch--neutral-400` to e.g. `color-mix(in srgb, neutral-900, white 45%)` (≈ #74787F, ~3.5:1 — still AA fail for normal text, AAA fail). To hit AAA 7:1 you need around `neutral-500` darkness or darker.
- Reserve text-tertiary for ≥ 18 pt large text only (then 3:1 AA suffices) and use text-secondary for all body-size muted copy.
- Tighten `--color--text-secondary` to neutral-700 (~`#353A48`) so it comfortably clears AAA 7:1 on white (≈ 11:1).

### 2.2 Dark themes (`data-theme="dark"`, base `#1d2331`)

White-on-navy is the high-contrast direction, but opacity-modulated whites lose ground fast.

| Token | Effective colour on `#1d2331` | Contrast | AAA 7:1 | AA 4.5:1 |
|---|---|---|---|---|
| `--color--text-primary` (white) | `#ffffff` | **~16.3:1** | ✅ | ✅ |
| `--color--text-secondary` (white @ 70%) | ≈ `#BCBEC2` | **~8.8:1** | ✅ | ✅ |
| `--color--text-tertiary` (white @ 50%) | ≈ `#8E9198` | **~4.9:1** | ❌ | ✅ |

**Finding:** dark-theme `--color--text-tertiary` is AAA-fail, AA-pass. Same fix path as light: restrict to large text, or push the opacity to 60-65 % (which would land around 6.5-7.2:1).

### 2.3 Brand-tinted themes (`brand-purple`, `brand-blue` etc.) — high risk

These themes use `color-mix(in srgb, [brand-500] X%, neutral-900)` for `--color--text-primary` over a pale tint background. Rough check:

| Theme | text-primary (approx) | page-bg (approx) | Contrast | AAA |
|---|---|---|---|---|
| `brand-blue` | `~#1a3d70` (mix blue-500 80% with neutral-900) | `~#f1f8fe` | ~10.5:1 | ✅ |
| `brand-orange` | `~#8b4224` (mix orange-500 70% with neutral-900) | `~#fff3eb` | ~5.5:1 | ❌ |
| `brand-green` | `~#2d6047` (mix green-500 60% with neutral-900) | `~#f2fdf7` | ~7.2:1 | ✅ borderline |
| `brand-yellow-deep` | `#1d2331` on `#fec601` | yellow page-bg | ~10.2:1 | ✅ |

**Finding:** `brand-orange` is a likely AAA fail for primary text. The orange-tinted dark colour against a peach background reads warm but doesn't hit 7:1. Consider darkening the mix ratio (`orange-500 50%, neutral-900 50%` would deepen significantly).

### 2.4 Interactive CTA contrast

| Variant | Background | Text | Contrast | AA | AAA |
|---|---|---|---|---|---|
| Default yellow CTA | `#fec601` | `#1d2331` (dark text) | ~10.2:1 | ✅ | ✅ |
| Orange CTA (`brand-orange`) | `#f15f23` | `#ffffff` | **~3.25:1** | ❌ | ❌ |
| Blue CTA (`brand-blue`) | `#21a4f4` | `#ffffff` | **~2.7:1** | ❌ | ❌ |
| Green CTA (`brand-green`) | `~#62bc7a` (green-600) | `#ffffff` | ~2.5:1 | ❌ | ❌ |
| Purple CTA (`brand-purple-deep` / others) | `#472d6a` | `#ffffff` | ~10.4:1 | ✅ | ✅ |

**Finding:** the orange, blue, and green CTAs with white labels **fail AA** for normal text. This is a real problem — these CTAs appear on real pages. The yellow + purple combinations are fine.

**Fix:** for orange/blue/green-themed CTAs, switch `--color--interactive-cta-text` to a dark value (the same `#1d2331` used on the yellow CTA), or darken the CTA background substantially. Easiest: white text on these saturated mid-tones rarely works at AA — flip to dark text or use a darker background variant.

> **Recommended verification:** run an automated contrast scan (axe or pa11y) per theme page once these adjustments land, so we get measured values rather than estimates.

---

## 3. Per-page findings

All seven pages share the same structural template (page wraps content in `<main>`, single `<h1>`, semantic section/heading hierarchy, consistent footer + nav). Findings below are page-specific only.

### 3.1 Home — `src/app/(site)/page.tsx`

Components: `HeroCentred`, `LogoMarquee`, `IntroBlock`, `FeatureSlider`, `PricingShowcase`.

- ✅ Wraps content in `<main>`, single `<h1>`, proper heading order.
- ❌ **1.1.1** — `FeatureSlider.tsx:107` `alt={item.imageAlt ?? ''}` — falls back to empty string. Decorative-empty is wrong if the image conveys meaning; fall back to `item.title`.
- ❌ **2.2.2** — both `LogoMarquee` and `FeatureSlider` auto-animate (covered in §1.3).
- ❌ **4.1.2** — `FeatureSlider` prev/next buttons (`FeatureSlider.tsx:151-152`) say "Prev"/"Next" — pass for screen readers but better with `aria-label="Previous slide"` / `aria-label="Next slide"`.

### 3.2 About — `src/app/(site)/about/page.tsx`

Components: `HeroSplit`, `IntroBlock`, `ClientsBlock`, `TeamGrid`.

- ✅ Wraps content in `<main>`, single `<h1>`.
- ✅ `TeamGrid.tsx:130-134` — `alt={m.headshotAlt ?? m.name}` (good fallback to person's name).
- ✅ `HeroSplit.tsx:154` — pills list has `aria-label="Key dimensions"`.

### 3.3 Contact — `src/app/(site)/contact/page.tsx`

Components: `ContactHero`, `ContactMethods`, `ContactForm`, `FAQSection`.

- ✅ Wraps content in `<main>` (line 45).
- ✅ **ContactForm is excellent** — every input has `<label htmlFor>` (line 247), `autoComplete` attrs on all fields (`given-name`, `family-name`, `email`, `organization`), `aria-invalid` and `aria-describedby` on errored fields, error messages provide guidance (lines 29-34), success uses `role="status" aria-live="polite"` (line 97), form-level error uses `role="alert"` (line 187), `inputMode="email"` on email field (line 161). Genuine reference implementation.
- ✅ `ContactMethods.tsx` — `<ul>` list, decorative SVGs `aria-hidden="true"`, aside region labelled.
- ✅ `FAQSection.tsx` — proper button + `aria-expanded` + `aria-controls` + `role="region"` + `aria-labelledby` accordion pattern.
- Minor — fallback heading on hero is generic "Get in touch" — fine.

### 3.4 How It Works — `src/app/(site)/how-it-works/page.tsx`

Components: `HeroSplit`, `IntroBlock`, `StickyTabs`, `FeatureSlider`.

- ⚠ **4.1.2 / naming** — `StickyTabs.tsx` is named like an ARIA tab widget but renders only sequential `<section>` blocks with `<h3>` titles and no `role="tab"`/`role="tabpanel"`/`aria-selected`/keyboard nav. If the intent is **interactive tabs**, this fails 2.1.1 and 4.1.2. If the intent is **scroll-driven sections with sticky headers**, the current markup is acceptable but rename the component to `StickySections` to remove the false promise. Confirm intent before changing markup.
- ❌ **2.2.2** — page uses `FeatureSlider` (same finding as Home).

### 3.5 Pricing — `src/app/(site)/pricing/page.tsx`

Components: `HeroCentred`, `TierCardsSection`, `ComparisonTable`, `BespokeStrip`, `FAQSection`.

- ✅ `ComparisonTable.tsx` uses ARIA table roles correctly (`role="table"`, `role="rowgroup"`, `role="columnheader"`, `role="rowheader"`, `role="cell"`).
- ✅ Expand/collapse button has `aria-expanded` (line 286) and accessible labels.
- ✅ Include/exclude indicators have `aria-label="Included"` / `aria-label="Not included"` (lines 235, 309).
- Minor — a true `<table>` element with `<th scope>` would be more robust than ARIA roles on divs (it lets browsers/AT use native table-navigation semantics). Not a violation, but a quality improvement.
- ⚠ Verify **2.5.5 Target Size (AAA)** for the billing-frequency toggle in `TierCardsSection.tsx:49` and any small icon buttons.

### 3.6 The Science — `src/app/(site)/resources/science/page.tsx`

Components: `HeroSplit`, `IntroBlock`, `ChecklistSection`, `BespokeStrip`, `StickySteps`, `DimensionsSection`.

- ❌ **1.1.1** — `StickySteps.tsx:124` `alt={step.imageAlt ?? ''}` — same empty fallback issue. Fall back to `step.headline`.
- ❌ **1.1.1** — `DimensionsSection.tsx:119` `alt={imageAlt ?? ''}` — same issue.
- ❌ **2.3.3** — `StickySteps` is a scroll-driven motion section; verify its existing reduced-motion handling (`StickySteps.css:204`) covers all visual motion, not just CSS transitions.

### 3.7 Compliance — `src/app/(site)/resources/compliance/page.tsx`

Components: `HeroCentred`, `IntroBlock`, `StickySteps`, `SecuritySection`.

- ✅ `SecuritySection.tsx:91-96` — security badges image has fallback `alt={badgesImageAlt ?? 'Security accreditation badges'}` (meaningful default).
- ✅ Credentials list is semantic `<ul>` with h3 + p per item.
- ❌ Same `StickySteps` alt issue inherited from §3.6.
- Note: the page's hero copy claims **"ISO 27001, ISO 9001, Cyber Essentials Plus, WCAG 2.2"** (line 23). Once this audit's fixes land, that claim is defensible — until then it isn't. Worth holding the WCAG 2.2 claim in fallback copy and CMS until at least AA passes a tooling scan.

---

## 4. Shared component findings (apply across pages)

### MegaNav — `src/components/MegaNav/MegaNav.tsx`

- ✅ Proper `<nav>` element (line 122).
- ✅ Dropdown toggles use `<button>` with `aria-expanded="false"` and `aria-haspopup="true"` (lines 141-160).
- ✅ Dropdown panels use `role="region"` + `aria-label` (lines 249, 277).
- ✅ Comprehensive keyboard handling in `megaNavAnimations.ts:296-345` — arrow keys, Tab wrap, Escape closes and returns focus to toggle.
- ❌ **1.3.1 best practice** — `<nav>` element has no `aria-label` (or `aria-labelledby`). Add `aria-label="Primary navigation"` so AT users get a clear landmark name (the footer nav already does this correctly).
- ⚠ **2.4.11 Focus Not Obscured (AA, 2.2)** — sticky nav (`megaNavAnimations.ts:550`) may cover an element when keyboard focus moves up past the nav offset. Worth runtime testing.

### NavBasket — `src/components/MegaNav/NavBasket.tsx`

- ✅ Toggle: dynamic `aria-label` with count (line 159).
- ✅ Drawer: `role="dialog"` + `aria-modal="true"` + `aria-label` (lines 174-176).
- ✅ Close button: `aria-label="Close basket"` (line 191).
- ✅ Escape key closes drawer (lines 65-72).
- ✅ Frequency toggle: `role="group"` + `aria-label="Billing frequency"` (lines 220-237).
- ⚠ **2.4.3 / 2.1.2** — on drawer open, initial focus is not explicitly moved to the close button or first focusable element. The vanilla pattern is to focus the close button on open and restore focus to the trigger on close. Currently `autoFocus` only on a confirm sub-state (line 316).
- ⚠ **2.5.5 Target Size (AAA)** — role-removal SVG button (line 277, 12×12 viewBox) — confirm padded tap target ≥ 44×44 CSS px.

### Footer — `src/components/Footer/Footer.tsx`

- ✅ `<footer>` + `<nav aria-label="Footer navigation">`.
- ✅ Social `<ul aria-label="Social media">`, each link with `aria-label`.
- ✅ Cookie preferences button delegates to vanilla-cookieconsent via `data-cc`.
- ⚠ Contact section labels (lines 194, 209, 224) are visual prominence only — could be `<h3>` for semantic heading hierarchy in the footer. Low priority.

### CookieConsent — `src/components/CookieConsent/CookieConsent.tsx`

- ✅ Library handles modal focus trap and ARIA.
- ❌ **3.3.2** — button label `"Reject optional"` (line 97) is ambiguous. Standard pattern is "Reject all" or "Necessary only". Recommend renaming to **"Necessary only"** or **"Reject non-essential"** so users understand what they're choosing.
- ✅ Categories have clear titles + descriptions (lines 108-118).

### SmoothScroll (Lenis) — `src/components/SmoothScroll.tsx`

Covered fully in §1.2. Single biggest individual fix in motion handling — Lenis affects scroll on every page.

### FooterFan — `src/components/Footer/FooterFan.tsx`

- ✅ Decorative SVG `aria-hidden="true"` (line 84).
- ❌ **2.3.3 AAA** — GSAP rotation/scale animations unconditional (lines 36-75).

---

## 5. Recommended fix order

This is a suggested sequencing — small, low-risk batches first, then the heavier theme work.

**Batch 1 — quick wins (1 PR, half a day):**
- Add skip link to `ConditionalShell.tsx` + `id="main-content"` on each page's `<main>`.
- Add global `:focus-visible` baseline to `globals.css`.
- Add `aria-label="Primary navigation"` to the MegaNav `<nav>`.
- Fix the empty-string alt fallbacks in `FeatureSlider`, `StickySteps`, `DimensionsSection`.
- Rename `StickyTabs` → `StickySections` (assuming non-interactive intent) or rebuild as proper ARIA tabs.
- Rename cookie consent "Reject optional" to "Necessary only".
- Add `aria-label` to `FeatureSlider` prev/next buttons.

**Batch 2 — motion (1 PR, 1 day):**
- Global `@media (prefers-reduced-motion: reduce)` rule in `globals.css`.
- Hook-level reduced-motion checks (use `gsap.matchMedia` pattern) in `useTextReveal`, `useFadeUp`, `useScrollAnimation`, `useCountUp`, `FooterFan`, `marqueeAnimation`, `sliderAnimations`, `MediaBlock` modal.
- Lenis short-circuit in `SmoothScroll.tsx`.
- Pause control on `LogoMarquee` and `FeatureSlider` (or pause-on-hover + pause-on-focus).

**Batch 3 — contrast (1 PR, half a day, design input needed):**
- Darken `--swatch--neutral-400` and `--swatch--neutral-600` to clear AAA 7:1 on white.
- Push dark-theme `--color--text-tertiary` opacity from 50 % to ~65 %.
- Switch `--color--interactive-cta-text` to dark in orange / blue / green themes.
- Re-verify `brand-orange` text-primary mix.
- Run axe + pa11y on dev server, capture measured ratios per theme.

**Batch 4 — semantic refinements:**
- Move drawer focus to close button on open (`NavBasket`).
- Add an `<h2>` or `<caption>` to the pricing comparison table.
- Sticky-nav focus-not-obscured fix (scroll-margin-top on focused targets).

---

## 6. What this audit did NOT cover

- **Form a11y on `/get-started/*` (multi-step checkout)** — out of scope this round; deserves its own audit, especially around payment / contract / confirmation states, error recovery, and address-autofill.
- **Dynamic role pages (`/assessments/[slug]`) and legal pages (`/legal/[slug]`)** — same template across slugs, but worth one representative pass.
- **Coming-soon page** — internal-only, separate review.
- **Admin / Studio routes** — internal-only, separate review.
- **Automated tool baseline** — recommend running `@axe-core/cli` and `pa11y --standard WCAG2AAA` against each page after Batch 1 lands, to catch contrast values precisely and pick up anything this manual pass missed.
- **Screen reader spot-checks** — NVDA / VoiceOver / TalkBack manual passes are valuable after the code fixes; tools and code review are no substitute.
- **Real reading-level test for 3.1.5 AAA** — the AAA reading level requirement (lower secondary education) needs a content-team pass on body copy. Out of scope here.
- **Video captions and audio description for 1.2.4 / 1.2.5** — depends on the actual video assets in `MediaBlock`. The player component is accessible; the asset metadata (caption tracks, transcripts) needs checking per video in Sanity.

---

## 7. AAA realism note

Several AAA criteria are difficult to satisfy without design tradeoffs. The realistic position for Vero Assess:

- **Genuinely achievable:** 1.4.6 (contrast 7:1), 2.3.3 (motion from interactions), 2.4.10 (section headings), 2.4.13 (focus appearance), 3.3.5 (help), 3.3.6 (error prevention).
- **Achievable with copy work:** 3.1.5 (reading level) — requires editorial input.
- **Likely impractical:** 1.2.6 (sign language for prerecorded audio), 1.4.9 (images of text only for decoration — already true), 2.2.3 (no timing — N/A), 2.2.4 (interruptions can be postponed — N/A).

A practical claim once fixes land would be: **"WCAG 2.2 Level AA across all pages; AAA on contrast, motion, and structural criteria where practicable."** That's defensible and far more honest than a blanket AAA claim.
