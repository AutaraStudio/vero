# CLAUDE.md — Project Instructions

This file is read automatically by Claude Code at the start of every session.
Follow everything here before writing any code, CSS, or components.

---

## Project Overview

**Product:** Vero Assess — B2B SaaS platform for skills-based hiring assessments.
**Stack:** Next.js (App Router), React, TypeScript, Tailwind (utility only), CSS Modules, Sanity CMS.
**Styling:** Custom CSS with a token system in `src/app/globals.css`. Do NOT use arbitrary Tailwind values. Do NOT hardcode hex values.

---

## Critical: Read the Design Skill Before Any UI Work

Before writing any CSS, component, or layout — read the design skill:

@docs/claude/design-skill.md

This is non-negotiable. It contains the Theme Cascade pattern, colour layering,
section rhythm, typography, spacing, card rules, motion & easing curves, and the
full Osmo animation library.

---

## ★ The Theme Cascade Rule — Read This Before Writing Any Colour

> **Set `data-theme` once on the wrapper element. Every child uses semantic tokens.
> The theme does the work. Never override colours manually inside a themed wrapper.**

### The mental model

`data-theme` on any element redefines every `--color--*` token for that element
and all its descendants. Every component uses only semantic tokens
(`var(--color--text-primary)`, `var(--color--surface-raised)`, etc.) — it never
needs to know which theme is active. Change `data-theme` and everything adapts
automatically.

```
<section data-theme="brand-orange">     ← ONE attribute
  <h2>         color: var(--color--text-primary)          → dark orange
  <div.card>   background: var(--color--surface-raised)   → white
               border: var(--color--border-default)       → orange-20%
  <button>     background: var(--color--interactive-cta)  → orange-500
</section>

Change to data-theme="dark-blue":
  <h2>         color: var(--color--text-primary)          → white
  <div.card>   background: var(--color--surface-raised)   → blue-tinted dark
               border: var(--color--border-default)       → white-15%
  <button>     background: var(--color--interactive-cta)  → purple-500
```

Same JSX. Same CSS. Different `data-theme`. Correct result every time.

### What this means in practice

**Sections** must have `data-theme` on their wrapper element. The default theme for
all section components is `brand-purple`, applied via a `theme` prop. Never
hardcode `data-theme="dark"` as a section default. `dark` may only be used when
explicitly passed as a prop override by the page.

**Cards, panels, CTA boxes, pricing cards** must have `background: var(--color--surface-raised)`.
This resolves to the correct surface colour for whatever theme the card lives inside.

**Text** always uses `var(--color--text-primary)` / `var(--color--text-secondary)` /
`var(--color--text-tertiary)`. Never a swatch. Never a hex value.

**Borders** always use `var(--color--border-default)` / `var(--color--border-subtle)` /
`var(--color--border-strong)`. Never a raw opacity or colour.

**Buttons** always use `var(--color--interactive-*)` tokens for background, hover,
and text. The right button colour for the section's theme is set automatically.

**The only exception** is Tier 3 accent elements — icons, eyebrow label text,
stat numbers, and card accent top-borders. These use swatch tokens directly
(`var(--swatch--[colour]-500)`) because they intentionally sit at 100% opacity.

**Default theme is `brand-purple` — applied via props, never hardcoded.**
Every section component must accept a `theme` prop typed as `ThemeVariant`
with a default value of `'brand-purple'`. Pages override this prop when a
different theme is required. Never default to `'dark'` inside a component.

```tsx
// ✅ Correct — theme is a prop, brand-purple is the default
interface MySectionProps {
  theme?: ThemeVariant;
}
export default function MySection({ theme = 'brand-purple' }: MySectionProps) {
  return <section data-theme={theme}>...</section>;
}

// ✅ Correct — page overrides the default
<MySection theme="dark-blue" />

// ❌ Wrong — dark hardcoded inside the component
export default function MySection() {
  return <section data-theme="dark">...</section>;
}

// ❌ Wrong — theme prop exists but defaults to dark
export default function MySection({ theme = 'dark' }: MySectionProps) { ... }
```

---

## Token System — Source of Truth

All colours are CSS custom properties in `src/app/globals.css`. Full reference:

```css
/* ── SECTION / PAGE ──────────────────────────────────────────── */
/* Themed:   <section data-theme="[theme]">                       */
/* Unthemed: background-color: var(--color--page-bg)  (explicit!) */

/* ── SURFACES ────────────────────────────────────────────────── */
var(--color--surface-raised)       /* cards, panels, CTA boxes, pricing cards */
var(--color--surface-sunken)       /* inset / recessed surfaces */
var(--color--surface-overlay)      /* modal and drawer backdrops */

/* ── TEXT ────────────────────────────────────────────────────── */
var(--color--text-primary)         /* headings, h1–h6 */
var(--color--text-secondary)       /* body copy, paragraphs */
var(--color--text-tertiary)        /* captions, muted, footnotes */
var(--color--text-brand)           /* brand labels, overlines */
var(--color--text-inverse)         /* text on inverse backgrounds */

/* ── BORDERS ─────────────────────────────────────────────────── */
var(--color--border-default)       /* standard card / section border */
var(--color--border-subtle)        /* dividers, quiet separators */
var(--color--border-strong)        /* emphasis outlines */

/* ── BUTTONS — PRIMARY ───────────────────────────────────────── */
var(--color--interactive-primary)           /* background */
var(--color--interactive-primary-hover)     /* background :hover */
var(--color--interactive-primary-text)      /* label colour */

/* ── BUTTONS — SECONDARY / GHOST ────────────────────────────── */
var(--color--interactive-secondary-border)   /* border */
var(--color--interactive-secondary-text)     /* label colour */
var(--color--interactive-secondary-hover-bg) /* background :hover */

/* ── BUTTONS — CTA (max 1 per page) ─────────────────────────── */
var(--color--interactive-cta)               /* background */
var(--color--interactive-cta-hover)         /* background :hover */
var(--color--interactive-cta-text)          /* label colour */

/* ── SHADOWS — OVERLAYS & MODALS ONLY ───────────────────────── */
var(--shadow--overlay)            /* never on flat content cards */
var(--shadow--overlay-lg)

/* ── RADIUS ──────────────────────────────────────────────────── */
var(--radius--sm)     /* 0.125rem */
var(--radius--md)     /* 0.25rem  */
var(--radius--lg)     /* 0.375rem */
var(--radius--xl)     /* 0.5rem — hard max for any surface */
var(--radius--full)   /* 9999px — pills: badges, labels, tags */

/* ── TRANSITIONS (hover states only — never section animations) */
var(--transition--default)
var(--transition--slow)
var(--transition--spring)
```

### Swatch tokens — Tier 3 accent elements only

`var(--swatch--*)` tokens are only permitted for: icons, eyebrow label text,
stat numbers, and card accent top-borders. These are intentional 100% opacity
punctuation marks — not body content. Never use a swatch for a background,
body text, or button.

```css
/* ✅ Correct — Tier 3 swatch use */
.feature-card__icon   { color: var(--swatch--blue-500); }
.feature-card         { border-top: 2px solid var(--swatch--blue-500); }
.stat__number         { color: var(--swatch--blue-400); }

/* ❌ Wrong — swatch on background, body text, or button */
.my-section           { background: var(--swatch--purple-500); }
.my-paragraph         { color: var(--swatch--neutral-400); }
.my-button            { background: var(--swatch--orange-500); }
```

---

## Section Theming

Apply via `data-theme` on the section wrapper. All children inherit automatically.

```
brand-purple        DEFAULT — light purple tint, used when no override is specified
dark                Explicit dark — must be passed as a prop, never a component default
dark-purple         10% purple tint — primary feature, trust, brand identity
dark-blue           10% blue tint — data, intelligence, analytics
dark-green          10% green tint — outcomes, success, growth
dark-orange          9% orange tint — risk, urgency, action
dark-yellow          8% yellow tint — CTA spotlight (max 1 per page)
brand-purple-deep   Full purple — single peak CTA banner, max once per page
brand-[colour]      Light tint over white — for panels, modals, isolated cards
brand-[colour]-deep Full colour bg — peak emphasis moments only
```

### Rhythm rules
- Never two tinted sections back-to-back — always `dark` between them
- `brand-purple-deep` once per page maximum
- Yellow theme once per page maximum

---

## Hard Rules — Never Do These

```css
/* ❌ NEVER */
background: linear-gradient(...);             /* no gradients */
box-shadow on flat cards;                     /* borders only */
border-radius > var(--radius--xl);            /* max 0.5rem */
transition: all ...;                          /* specific properties only */
transition: ... ease;                         /* named Vero curves only */
color: rgba(var(--accent), 0.4);              /* mid-opacity accent = mistake */

/* ❌ NEVER — any raw colour value */
color: #...;
background: #... / rgb(...) / rgba(...) / hsl(...);
border-color: #...;
fill: #...;  stroke: #...;                    /* SVG — use currentColor or var() */
style={{ color: '...', background: '...' }}   /* TSX inline styles */

/* ❌ NEVER — targeting a theme to colour a child */
[data-theme="brand-orange"] .child { color: var(--swatch--orange-700); }
/* Use var(--color--text-primary) and let the theme resolve it */
```

```
❌ NEVER in page structure
- Two tinted sections back-to-back
- brand-purple-deep more than once per page
- Yellow theme more than once per page
- Centred hero on a feature or category page
- A heading (h1–h4) without useTextReveal
- A section without data-theme bound to a theme prop
- A component with theme defaulting to 'dark' — default must always be 'brand-purple'
- A hardcoded data-theme="dark" inside a component — dark must come from a page prop
- A card / panel / CTA box without background: var(--color--surface-raised)
- A button without var(--color--interactive-*) tokens for all states
- Any text without var(--color--text-*) tokens
- Any border without var(--color--border-*) tokens
```

---

## Before Starting Any Task

1. Read `@docs/claude/design-skill.md` if the task involves UI
2. Check `src/app/globals.css` for the correct token names
3. Check the Component Catalogue — does a component already cover this?
4. Check the Osmo library — does an animation component already cover this?
5. Confirm every `h1`–`h4` will use `useTextReveal`
6. Confirm every non-heading reveal will use `useFadeUp`
7. Run the pre-build checklist in the design skill (Section 13)
8. **Ask: "If I change `data-theme` on this wrapper — does every child adapt
   automatically?" If no — fix the manual overrides before finishing.**
9. **Scan the output for any hex, rgb(), rgba(), hsl(), or named colour. Zero is the target.**

---

## Project Structure

```
src/
├── app/
│   ├── globals.css          ← All CSS tokens and theme definitions — READ THIS
│   ├── utilities.css        ← Utility classes (grid, flex, spacing, etc.)
│   └── (site)/              ← Page routes
├── components/              ← Shared components
│   ├── StickySteps/         ← OSMO-01: scroll-driven feature section
│   ├── Tooltip/             ← OSMO-03: CSS-only hover tooltip
│   ├── DirectionalList/     ← OSMO-04: directional tile wipe list rows
│   ├── RevealGroup/         ← OSMO-05: JSX wrappers for scroll reveal
│   └── HeroCentred/         ← Centred hero with media (image or video modal)
├── hooks/
│   ├── useTextReveal.ts     ← GSAP SplitText reveal — ALL headings use this
│   ├── useFadeUp.ts         ← GSAP fade/translate reveal — body copy, CTAs, labels
│   ├── useContentReveal.ts  ← OSMO-05: GSAP scroll reveal hook
│   └── useDisplayCount.ts   ← OSMO-02: item counter hook
└── lib/
    ├── gsap.ts              ← GSAP plugin registration + custom Vero eases
    ├── splitText.ts         ← SplitText helpers and auto split-type detection
    └── theme.ts             ← Theme types and accent colour helpers
```

---

## Animations

```tsx
import { useFadeUp } from '@/hooks/useFadeUp';

const labelRef  = useFadeUp({ delay: 0,    duration: 0.5, y: 16 });
const introRef  = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
const ctaRef    = useFadeUp({ delay: 0.35, duration: 0.5, y: 16 });
const visualRef = useFadeUp({ delay: 0.1,  duration: 0.8, y: 32 });
const gridRef   = useFadeUp({ selector: '.card', stagger: 0.08, y: 24 });
```

---

## Osmo Animation Components

| ID | Component | File | Use for |
|---|---|---|---|
| OSMO-01 | StickySteps | `src/components/StickySteps/` | Scroll-driven feature sections with sticky visuals |
| OSMO-02 | useDisplayCount | `src/hooks/useDisplayCount.ts` | Dynamic item counts in UI copy |
| OSMO-03 | Tooltip | `src/components/Tooltip/` | Inline contextual help |
| OSMO-04 | DirectionalList | `src/components/DirectionalList/` | Hoverable list rows with directional tile wipe |
| OSMO-05 | useContentReveal + RevealGroup | `src/hooks/useContentReveal.ts` + `src/components/RevealGroup/` | GSAP scroll reveal |

---

## Adapting External HTML Components

Treat external HTML as a **structural skeleton only** — never as a style reference.

**Key rules:**
1. Every colour, spacing, radius, and shadow from `src/app/globals.css` tokens only
2. Strip: `border-radius > 0.5rem`, `box-shadow` on cards, gradient backgrounds,
   `transition: all / ease / ease-in-out`
3. Apply the correct `data-theme` to the section wrapper
4. Map every element to the 3-tier ladder (page-bg / surface-raised / swatch-100%)
5. Every `h1`–`h4` uses `useTextReveal`. Every other reveal uses `useFadeUp`.
6. Source comment at the top: `// Adapted from: Untitled UI — [Component Name]`

### Prompt template

> Recreate this as a React + TypeScript component for Vero Assess following all
> rules in `CLAUDE.md` and `docs/claude/design-skill.md`. Apply `data-theme` on the
> section wrapper. Use only semantic tokens for all text, borders, surfaces, and
> buttons — zero hardcoded colours, zero swatch tokens outside of Tier 3 accent
> elements. Every heading uses `useTextReveal`. Here is the HTML: [PASTE]

---

## Video Modal Pattern

**Open:** portal into `document.body` → set overflow hidden → lazy-set video src →
`gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })` →
`gsap.fromTo(modal, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' })`

**Close:** `gsap.to(modal, { scale: 0.95, opacity: 0, duration: 0.25, ease: 'power2.in' })` →
`gsap.to(overlay, { opacity: 0, ... })` → on complete: clear src, restore overflow, unmount

---

## Sanity CMS

Schema lives in `src/sanity/schemaTypes/`.

| Type | File | Purpose |
|---|---|---|
| `homePage` | `homePage.ts` | Singleton — hero + how it works steps |
| `jobCategory` | `jobCategory.ts` | Category pages — hero, dimensions, in-action, stats, roster, bespoke CTA |
| `role` | `role.ts` | Individual job roles — name, slug, parent category, tasks, strengths |
| `pricingTier` | `pricingTier.ts` | Pricing cards — price, limits, CTA type, bespoke fields |

When adding new content-driven sections, define the Sanity schema field first,
then build the component to consume it.