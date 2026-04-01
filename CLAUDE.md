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

This is non-negotiable. It contains:
- The colour layering system (3-tier opacity ladder)
- Section rhythm rules
- Typography, spacing, and card rules
- Motion & easing curves
- The full Osmo animation component library

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

## Token System — Source of Truth

All colours, spacing, radius, and shadows are CSS custom properties defined in
`src/app/globals.css`. Always reference semantic tokens in components.
Only reference swatch tokens directly for Tier 3 (full-opacity) accent elements.

### Semantic token quick reference

```css
/* Backgrounds */
var(--color--page-bg)
var(--color--surface-raised)
var(--color--surface-sunken)

/* Text */
var(--color--text-primary)
var(--color--text-secondary)
var(--color--text-tertiary)

/* Borders */
var(--color--border-default)
var(--color--border-subtle)
var(--color--border-strong)

/* Interactive */
var(--color--interactive-primary)       /* purple */
var(--color--interactive-cta)           /* yellow — max 1 per page */

/* Shadows — OVERLAYS & MODALS ONLY
   Never use on flat content cards. Flat cards use borders only. */
var(--shadow--overlay)
var(--shadow--overlay-lg)

/* Radius — max var(--radius--xl) = 0.5rem on any surface */
var(--radius--sm)    /* 0.125rem */
var(--radius--md)    /* 0.25rem  */
var(--radius--lg)    /* 0.375rem */
var(--radius--xl)    /* 0.5rem — hard max for any surface */
var(--radius--full)  /* 9999px — pills only: badges, labels, tags */

/* Transitions — hover states on interactive elements only
   Never use for section animations — use GSAP instead */
var(--transition--default)
var(--transition--slow)
var(--transition--spring)
```

### Section theming — apply via `data-theme` on the section wrapper

```
dark               Default dark background — hero, stats, footer
dark-purple        10% purple tint — primary feature, trust, brand identity
dark-blue          10% blue tint — data, intelligence, analytics
dark-green         10% green tint — outcomes, success, growth
dark-orange         9% orange tint — risk, urgency, action
dark-yellow         8% yellow tint — CTA spotlight (max 1 per page)
brand-purple-deep  Full purple — single peak CTA banner only, once per page
```

### brand-* themes — RESTRICTED USE

`brand-purple`, `brand-blue`, `brand-green`, `brand-orange`, `brand-yellow` are
**light-base themes** (white + tint). They are for isolated UI elements such as
light-mode modals, drawers, or standalone UI cards.
**Never use as a section background on the main dark site.**

---

## Colour Layering — The 3-Tier Opacity Ladder

Every accent colour operates on a strict three-tier system over the dark base.
Never use a mid-opacity value (30–70%) on accent colours.

```
Tier 1 — Section background:  accent at  8–10%  via data-theme
Tier 2 — Card / surface:       accent at 15–18%  via --color--surface-raised
Tier 3 — Elements:             accent at  100%   icons, labels, borders, numbers
```

The jump from 18% → 100% is what makes elements pop. Mid-opacity values read as
a mistake, not a decision.

---

## Animation System

### Custom Eases — registered in `src/lib/gsap.ts`

| Name | Curve | Use for |
|---|---|---|
| `vero.out` | `M0,0 C0.16,1 0.3,1 1,1` | Default — headings, cards, most reveals |
| `vero.inOut` | `M0,0 C0.37,0 0.63,1 1,1` | Page transitions, modal open/close |
| `vero.spring` | `M0,0 C0.34,1.56 0.64,1 1,1` | Playful — badges, icons, play buttons |

Never use `ease`, `ease-in-out`, `linear`, or `power1` — always use a named Vero
ease or an explicit GSAP named ease (`power2.out`, `power3.out`, etc.) with intention.

---

### Heading Animation — `useTextReveal` — NON-NEGOTIABLE

**Every heading (`h1`–`h4`) in every component must use `useTextReveal`.**
No exceptions. This is the project's primary typographic signature.

```tsx
import { useTextReveal } from '@/hooks/useTextReveal';

// Hero headings — animate on load, no scroll trigger
const titleRef = useTextReveal({ scroll: false, delay: 0.3 });

// All other section headings — scroll-triggered
const headingRef = useTextReveal({ delay: 0.05 });

// Custom scroll start position
const headingRef = useTextReveal({ start: 'top 80%', delay: 0 });
```

**How it works:**
Auto-detects split type from text length via `src/lib/splitText.ts`:
- Under 20 chars → split by **chars** (stagger 0.025s)
- 20–80 chars → split by **words** (stagger 0.055s)
- Over 80 chars → split by **lines** (stagger 0.1s)

Animation: blur 8px→0, opacity 0→1, y 12px→0, ease `vero.out`, duration 0.7s.

Always add `data-animate=""` to the heading element. The hook sets
`visibility: visible` on run — elements start hidden via global CSS.

**Standard section header pattern:**
```tsx
const labelRef   = useFadeUp({ delay: 0,   duration: 0.5, y: 16 });
const headingRef = useTextReveal({ delay: 0.1 });
const introRef   = useFadeUp({ delay: 0.2, duration: 0.6, y: 16 });

<span ref={labelRef}   data-animate="" className="section-label">...</span>
<h2   ref={headingRef} data-animate="" className="section-heading">...</h2>
<p    ref={introRef}   data-animate="" className="section-intro">...</p>
```

---

### Body Copy, Labels & CTAs — `useFadeUp`

Use `useFadeUp` for everything that is NOT a heading: section labels, intro
copy, body paragraphs, CTAs, cards, visuals, images.

```tsx
import { useFadeUp } from '@/hooks/useFadeUp';

const labelRef  = useFadeUp({ delay: 0,    duration: 0.5, y: 16 });
const introRef  = useFadeUp({ delay: 0.2,  duration: 0.6, y: 16 });
const ctaRef    = useFadeUp({ delay: 0.35, duration: 0.5, y: 16 });
const visualRef = useFadeUp({ delay: 0.1,  duration: 0.8, y: 32 });

// Stagger child elements via selector
const gridRef   = useFadeUp({ selector: '.card', stagger: 0.08, y: 24 });
```

---

## Osmo Animation Components

Five pre-built, project-restyled components are available.
Full documentation in @docs/claude/design-skill.md (Section 13).
Use these proactively — don't build from scratch when a purpose-built component exists.

| ID | Component | File | Use for |
|---|---|---|---|
| OSMO-01 | StickySteps | `src/components/StickySteps/` | Scroll-driven feature sections with sticky visuals |
| OSMO-02 | useDisplayCount | `src/hooks/useDisplayCount.ts` | Dynamic item counts in UI copy |
| OSMO-03 | Tooltip | `src/components/Tooltip/` | Inline contextual help |
| OSMO-04 | DirectionalList | `src/components/DirectionalList/` | Hoverable list rows with directional tile wipe |
| OSMO-05 | useContentReveal + RevealGroup | `src/hooks/useContentReveal.ts` + `src/components/RevealGroup/` | GSAP scroll reveal |

---

## Adapting External HTML Components

When recreating components from external sources (Untitled UI, etc.), treat
the external HTML as a **structural skeleton only** — never as a style reference.

### Adaptation Rules

1. **Tokens only.** Every colour, spacing, radius, and shadow must come from
   `src/app/globals.css`. Never carry over hardcoded hex values, Tailwind
   arbitrary values, or raw pixel values from the source HTML.

2. **Strip conflicting defaults.** External components commonly use:
   - `border-radius: 0.75rem+` → cap at `var(--radius--xl)` (0.5rem max)
   - `box-shadow` on cards → remove entirely; borders only
   - Gradient backgrounds → hard ban; use `data-theme` instead
   - `transition: all / ease / ease-in-out` → replace with named Vero eases

3. **Apply the 3-tier opacity ladder.** Map every visual element to a tier:
   - Section background → Tier 1 (8–10% tint via `data-theme`)
   - Cards / surfaces → Tier 2 (`var(--color--surface-raised)`)
   - Icons, labels, borders, numbers → Tier 3 (100% swatch)

4. **Apply heading animations.** Every `h1`–`h4` must use `useTextReveal`.
   Every other reveal uses `useFadeUp`. No static headings. No CSS-only reveals.

5. **Document the source.** Add a comment at the top of every adapted file:
   ```tsx
   // Adapted from: Untitled UI — [Component Name]
   // Vero Assess pattern: [e.g. "HeroCentred"]
   ```

6. **Scroll reveal on everything.** For hero components use `scroll: false`
   with staggered delays so elements animate on load. All other sections
   use scroll-triggered reveals.

### Prompt Template — Adapting External HTML

Use this prompt each time you hand external HTML to Claude:

> I'm giving you HTML from an external source (Untitled UI / other). Recreate
> this as a React + TypeScript component for Vero Assess following all rules in
> `CLAUDE.md` and `docs/claude/design-skill.md`. Specifically:
>
> - Replace all hardcoded colours, spacing, and radii with our CSS token system
> - Strip all `box-shadow` from flat surfaces — borders only
> - Map their Tailwind classes to our semantic tokens — never carry values across directly
> - Apply the correct `data-theme` to the section wrapper
> - All accent elements must sit on the 3-tier opacity ladder (8% / 18% / 100%)
> - Border radius max `var(--radius--xl)` (0.5rem) — strip any `rounded-xl`, `rounded-2xl` etc.
> - No gradient backgrounds
> - Use named Vero eases only — never `ease`, `ease-in-out`, or `linear`
> - Every `h1`–`h4` must use `useTextReveal` — no exceptions
> - Every other animated element uses `useFadeUp`
> - Any decorative stripe/grid patterns must use our swatch tokens at the correct tier
> - If the component includes a video, implement the full GSAP video modal (see Video Modal Pattern)
> - Add a source comment at the top of the file
>
> Here is the HTML to adapt: [PASTE HTML]

---

## Video Modal Pattern

Any component with a video field must implement the full GSAP modal.

**Open sequence:**
1. Portal-render the modal into `document.body`
2. Set `document.body.style.overflow = 'hidden'`
3. Set `src` on the `<video>` element (lazy — never loaded until open)
4. `gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })`
5. `gsap.fromTo(modal, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' })`

**Close sequence:**
1. `gsap.to(modal, { scale: 0.95, opacity: 0, duration: 0.25, ease: 'power2.in' })`
2. `gsap.to(overlay, { opacity: 0, duration: 0.25, ease: 'power2.in' })`
3. On complete: clear `video.src`, restore `body.overflow`, unmount portal

**Backdrop:**
```css
background: color-mix(in srgb, var(--color--page-bg) 80%, transparent);
backdrop-filter: blur(12px);
```

**Rules:**
- Escape key + backdrop click both trigger close — clicking the modal itself does not
- Play button scales 1 → 1.08 on hover with `vero.spring`
- Video is always lazy — `src` set on open, cleared on close

---

## Component Catalogue

### HeroCentred

```
File:          src/components/HeroCentred/HeroCentred.tsx
CSS:           src/components/HeroCentred/HeroCentred.css
Adapted from:  Untitled UI — Hero with media
```

**When to use:** Campaign landing pages, assessment entry pages — any page
where the goal is a single focused CTA with a product preview beneath.
**Do NOT use** on job category or feature pages — use the asymmetric hero there.

**Slots:**
- `badge` — optional announcement pill (label + link)
- `headline` — display heading, centred, `text-display--xl`, max `18ch`
- `intro` — centred body copy, max `48ch`
- `primaryCTA` / `secondaryCTA` — button pair, centred
- `media` — accepts `image` or `video`; video uses GSAP modal on click
- `stripes` — decorative skewed block using purple swatches at Tier 1/2/3

**Animation sequence (on-load, no scroll trigger):**
```
badge       useFadeUp     scroll:false  delay:0.1   y:16
headline    useTextReveal scroll:false  delay:0.3
intro       useFadeUp     scroll:false  delay:0.7   y:16
cta         useFadeUp     scroll:false  delay:0.9   y:16
media       useFadeUp     scroll:true   delay:0     y:32  ← scroll-triggered
```

**Theming:** `data-theme="dark"` on the section wrapper.

---

## Sanity CMS

Content is managed in Sanity. Schema lives in `src/sanity/schemaTypes/`.

### Schema types

| Type | File | Purpose |
|---|---|---|
| `homePage` | `homePage.ts` | Singleton — hero + how it works steps |
| `jobCategory` | `jobCategory.ts` | Category pages — hero, dimensions, in-action, stats, roster, bespoke CTA |
| `role` | `role.ts` | Individual job roles — name, slug, parent category, tasks, strengths |
| `pricingTier` | `pricingTier.ts` | Pricing cards — price, limits, CTA type, bespoke fields |

When adding new content-driven sections, define the Sanity schema field first,
then build the component to consume it.

---

## Hard Rules — Never Do These

```css
/* ❌ NEVER */
background: linear-gradient(...);            /* no gradient backgrounds */
box-shadow: ... on a flat card;              /* overlays & modals only */
border-radius > 0.5rem;                      /* max var(--radius--xl) */
transition: all ...;                         /* target specific properties only */
transition: ... ease;                        /* use named Vero curves only */
color: rgba(var(--accent), 0.4);             /* mid-opacity accent = design mistake */
var(--shadow--overlay) on a flat card;       /* overlays & modals only */
```

```
❌ NEVER in page structure
- Two tinted sections back-to-back — always a plain dark section between
- brand-purple-deep more than once per page
- brand-* light themes as section backgrounds on the dark site
- Yellow theme section more than once per page
- Centred hero on a feature or category page
- A heading (h1–h4) without useTextReveal
- A hardcoded hex value anywhere in CSS
```

---

## Before Starting Any Task

1. Read `@docs/claude/design-skill.md` if the task involves UI
2. Check `src/app/globals.css` for the relevant token names
3. Check the Component Catalogue — does a component already cover this?
4. Check the Osmo library — does an animation component already cover this?
5. Confirm every `h1`–`h4` will use `useTextReveal`
6. Confirm every non-heading reveal will use `useFadeUp`
7. Run the pre-build checklist in the design skill (Section 11)