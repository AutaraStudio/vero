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
│   └── RevealGroup/         ← OSMO-05: JSX wrappers for scroll reveal
├── hooks/
│   ├── useContentReveal.ts  ← OSMO-05: GSAP scroll reveal hook
│   └── useDisplayCount.ts   ← OSMO-02: item counter hook
└── lib/
    └── theme.ts             ← Theme types and accent colour helpers
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

## Osmo Animation Components

Five pre-built, project-restyled components are available.
Full documentation in @docs/claude/design-skill.md (Section 13).

| ID | Component | File | Use for |
|---|---|---|---|
| OSMO-01 | StickySteps | `src/components/StickySteps/` | Scroll-driven feature sections with sticky visuals |
| OSMO-02 | useDisplayCount | `src/hooks/useDisplayCount.ts` | Dynamic item counts in UI copy |
| OSMO-03 | Tooltip | `src/components/Tooltip/` | Inline contextual help |
| OSMO-04 | DirectionalList | `src/components/DirectionalList/` | Hoverable list rows with directional tile wipe |
| OSMO-05 | useContentReveal + RevealGroup | `src/hooks/useContentReveal.ts` + `src/components/RevealGroup/` | GSAP scroll reveal |

**Use these proactively.** If a layout calls for a feature section, reach for StickySteps.
If a section has a list of items, reach for DirectionalList. Don't build from scratch
when a purpose-built component exists.

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
- Centred hero on a marketing/feature page
- Hardcoded hex values anywhere in CSS
```

---

## Sanity CMS

Content is managed in Sanity. Schema lives in `src/sanity/schemaTypes/`.
When adding new content-driven sections, define the schema field first,
then build the component to consume it.

---

## Before Starting Any Task

1. Read `@docs/claude/design-skill.md` if the task involves UI
2. Check `src/app/globals.css` for the relevant token names
3. Check if an Osmo component already covers the pattern
4. Follow the pre-build checklist in the design skill (Section 11)
