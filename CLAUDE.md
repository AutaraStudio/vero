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
- The colour system (5 brand colours × 2 variants = 10 themes)
- The 3-tier opacity ladder
- Section rhythm rules
- Hero layout decision table (centred vs split vs statement)
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
├── components/
│   ├── DirectionalList/     ← OSMO-04: directional tile wipe list rows
│   ├── FeatureSlider/       ← GSAP-driven horizontal card slider
│   ├── Footer/              ← Site footer with CTA banner (data-theme="brand-purple-deep")
│   ├── MegaNav/             ← Site navigation with dropdown panels
│   ├── PageTransition/      ← Page-level enter/exit transitions
│   ├── Pricing/             ← Pricing tier display component
│   ├── RevealGroup/         ← OSMO-05: JSX wrappers for scroll reveal
│   ├── StepsSection/        ← "How it works" section — wraps StickyTabs
│   ├── StickySteps/         ← OSMO-01: scroll-driven feature section
│   ├── StickyTabs/          ← Sticky tab group with themed panels
│   ├── Tooltip/             ← OSMO-03: CSS-only hover tooltip
│   ├── ui/                  ← Primitive UI components (Button, etc.)
│   ├── Hero.tsx / Hero.css  ← Shared hero section component
│   └── SmoothScroll.tsx     ← Lenis smooth scroll wrapper
├── hooks/
│   ├── useContentReveal.ts  ← OSMO-05: GSAP scroll reveal hook
│   ├── useDisplayCount.ts   ← OSMO-02: item counter hook
│   ├── useFadeUp.ts         ← GSAP fade-up animation hook
│   └── useTextReveal.ts     ← GSAP text reveal animation hook
└── lib/
    └── theme.ts             ← Theme types and accent colour helpers
```

---

## Component Reference

### Osmo Animation Components
Full documentation in @docs/claude/design-skill.md (Section 13).

| ID | Component | File | Use for |
|---|---|---|---|
| OSMO-01 | StickySteps | `src/components/StickySteps/` | Scroll-driven feature sections with sticky visuals |
| OSMO-02 | useDisplayCount | `src/hooks/useDisplayCount.ts` | Dynamic item counts in UI copy |
| OSMO-03 | Tooltip | `src/components/Tooltip/` | Inline contextual help |
| OSMO-04 | DirectionalList | `src/components/DirectionalList/` | Hoverable list rows with directional tile wipe |
| OSMO-05 | useContentReveal + RevealGroup | `src/hooks/useContentReveal.ts` + `src/components/RevealGroup/` | GSAP scroll reveal |

### Project Components

| Component | Use for |
|---|---|
| `Hero` | Shared hero section — centred layout with floating dimension tags |
| `MegaNav` | Site navigation — includes Assessments, Solutions, Company dropdowns |
| `Footer` | Site footer — always `data-theme="brand-purple-deep"`, includes CTA banner |
| `StickyTabs` | Sticky tab group where each tab is a full themed section — used inside StepsSection |
| `StepsSection` | "How it works" section — wraps StickyTabs with 3 steps (choose → assess → hire) |
| `FeatureSlider` | GSAP horizontal card slider — active card highlights in purple |
| `Pricing` | Pricing tier cards |
| `PageTransition` | Page-level enter/exit animation wrapper |
| `SmoothScroll` | Lenis smooth scroll wrapper — wraps all page content via ConditionalShell |
| `ui/Button` | Primary button primitive — variants: primary, secondary, cta |

**Use existing components proactively.** Check this list before building anything from scratch.
- Feature scroll section → `StickySteps` or `FeatureSlider`
- Step-by-step flow → `StepsSection` (wraps `StickyTabs`)
- Scannable list of items → `DirectionalList`
- Inline help → `Tooltip`

---

## Component Creation Standards

**Every new feature, animation, slider, or interactive pattern must be built as a reusable component.** No exceptions — not even for one-off page sections.

### Rules

**Always a folder, never a single file.**
Each component lives in its own folder under `src/components/`:
```
src/components/MyComponent/
├── MyComponent.tsx   ← component logic and JSX
├── MyComponent.css   ← component-scoped styles only
└── index.ts          ← re-export: export { default } from './MyComponent'
```

**Props over hardcoding.**
Any value that varies between uses — copy, theme, accent colour, item count, image src — must be a prop with a sensible default. Never hardcode page-specific content inside a component.

**Themed via `data-theme` and `accentSwatch`.**
Components must not hardcode brand colours. Accept a `theme` prop (maps to `data-theme`) and an `accentSwatch` prop (maps to the relevant `--swatch--*` token) so they work across all section colours.

**CSS uses tokens only.**
All colours, spacing, radius, and shadow values must reference CSS custom properties from `globals.css`. No hardcoded hex values, no arbitrary values.

**Animations are self-contained.**
If a component uses GSAP, a scroll listener, or any animation logic, that logic lives inside the component (or a dedicated hook in `src/hooks/`). It must clean up after itself on unmount.

**Export a TypeScript interface.**
Every component that accepts non-trivial props must export its props interface from `index.ts` so consumers can type-check without importing the implementation.

### New component checklist

- [ ] Does a component already exist that covers this pattern? (Check Component Reference above)
- [ ] Is it in its own folder with `.tsx`, `.css`, and `index.ts`?
- [ ] Are all variable values props with defaults?
- [ ] Does it accept `theme` and `accentSwatch` props if it has a coloured accent?
- [ ] Does it use only CSS token values — no hardcoded hex?
- [ ] Is animation logic in a hook or cleaned up on unmount?
- [ ] Is the props interface exported from `index.ts`?
- [ ] Is it added to the Component Reference table in this file?

### Naming conventions

```
PascalCase folders and files:   FeatureSlider/, StickySteps/
camelCase hooks:                useContentReveal.ts, useFadeUp.ts
kebab-case CSS class names:     .feature-slider__item, .sticky-steps__text
```

---

## Token System — Source of Truth

All colours, spacing, radius, and shadows are CSS custom properties.
They are defined in `src/app/globals.css`. Always reference semantic tokens in components.
Only reference swatch tokens directly for Tier 3 (full-opacity) accent elements.

**Quick reference:**
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
var(--color--interactive-primary)    /* purple */
var(--color--interactive-cta)        /* yellow — max 1 per page */
```

**Section theming** — apply via `data-theme` on the section wrapper:
```
dark              default dark background
dark-purple       10% purple tint over dark base
dark-blue         10% blue tint
dark-green        10% green tint
dark-orange       9% orange tint
dark-yellow       8% yellow tint (max 1 per page)
brand-purple-deep full purple — peak CTA only, once per page
```

---

## Hard Rules — Never Do These

```css
/* NEVER */
background: linear-gradient(...);       /* no gradient backgrounds */
box-shadow: ...;                         /* no shadows on flat cards */
border-radius: 0.75rem;                  /* keep corners sharp — max 0.5rem */
transition: all 0.3s ease;              /* use named easing curves */
```

```
/* NEVER in page structure */
- Two tinted sections back-to-back (always a plain dark section between)
- brand-purple-deep more than once per page
- Centred hero on a marketing/feature page that has a product visual to show
- Hardcoded hex values anywhere in CSS
- Page-specific animation or interaction logic written inline in a page file
- Editorial content strings hardcoded in a component or page file — all text comes from Sanity
```

---

## Sanity CMS

**Project ID:** `abtw5nba`
**Dataset:** `production`

Content is managed in Sanity. Schema lives in `src/sanity/schemaTypes/`.
When adding new content-driven sections, define the schema field first,
then build the component to consume it.

### Dynamic content rule — applies to every page

Every static page has a corresponding singleton Sanity document.
**All text, button labels, and button hrefs must come from Sanity — nothing hardcoded.**

When building or editing any page:
1. Check the schema table below — does a schema already exist for this page?
2. If not, create one in `src/sanity/schemaTypes/` before writing the page component
3. Add the new type to `src/sanity/schemaTypes/index.ts`
4. Fetch the singleton document in the page using the Sanity client
5. Pass all text, labels, and hrefs as props to child components
6. Seed the document with default content in `scripts/seed-sanity.ts`

### Schema types

| Type | File | Notes |
|---|---|---|
| `homePage` | `schemaTypes/homePage.ts` | Singleton — hero, USPs, how it works, pricing intro |
| `siteSettings` | `schemaTypes/siteSettings.ts` | Singleton — footer CTA, nav CTA button |
| `pricingPage` | `schemaTypes/pricingPage.ts` | Singleton — hero, bespoke CTA |
| `assessmentsPage` | `schemaTypes/assessmentsPage.ts` | Singleton — hero |
| `howItWorksPage` | `schemaTypes/howItWorksPage.ts` | Singleton — hero |
| `aboutPage` | `schemaTypes/aboutPage.ts` | Singleton — hero |
| `contactPage` | `schemaTypes/contactPage.ts` | Singleton — hero, contact details |
| `pricingTier` | `schemaTypes/pricingTier.ts` | 5 tiers: Starter, Essential, Growth, Scale, Bespoke |
| `jobCategory` | `schemaTypes/jobCategory.ts` | 10 categories — hero, features, stats, roster, bespoke CTA |
| `role` | `schemaTypes/role.ts` | 50 roles, each references a `jobCategory` |

### `jobCategory` field groups

| Group | Key fields |
|---|---|
| Hero | `heroHeadline`, `heroIntroCopy`, `heroImage` |
| Dimensions | `dimensionsSectionHeading`, `dimensionsSectionBody`, `dimensionsSectionImage` |
| In Action | `inActionSectionHeading`, `inActionSectionSubheading`, `inActionFeatures[]` ← array of `{heading, body}` |
| In Action blocks | `assessmentsBlockHeading/Body`, `portalBlockHeading/Body`, `interviewBlockHeading/Body`, `inActionSectionImage` |
| Stats | `stat1–4 Heading/Body` (4 stats: Quick / Cost effective / High volume / Flexible) |
| Role Roster | `roleRosterHeading`, `roleRosterSubheading` |
| Bespoke CTA | `bespokeSectionHeading/Body`, `bespokeCTALabel`, `bespokeSectionImage` |

### Seeding / updating content

Script: `scripts/seed-sanity.ts`
Run with: `npx ts-node scripts/seed-sanity.ts` (or whichever runner is in `package.json`)
Uses `client.createOrReplace()` for full seed, `client.patch().set().commit()` for targeted updates.

---

## Before Starting Any Task

1. Read `@docs/claude/design-skill.md` if the task involves UI
2. Check `src/app/globals.css` for the relevant token names
3. Check the Component Reference above — use existing components before building new ones
4. If building something new, follow the Component Creation Standards above
5. If the task involves a page, check the schema table — create a schema if one doesn't exist
6. Follow the pre-build checklist in the design skill (Section 11)