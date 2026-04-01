# Design Skill — Vero Assess

# Dark SaaS Design Skill
## Premium Next.js / React Frontend — Codebase-Specific

This skill governs all frontend design decisions. It is written for this specific
codebase and its exact token system. Read it fully before writing any CSS.

---

## 0. What Was Sloppy — Never Again

| Pattern | Why it failed | The fix |
|---|---|---|
| Centred hero every time | No editorial confidence | Asymmetric grid, text-left by default |
| `box-shadow` on flat cards | Muddy, floaty on dark | Borders only; shadows for overlays only |
| `ease` on every transition | Soft, mushy, generic | Named bezier curves per interaction type |
| Aptos same weight throughout | No hierarchy drama | 800/900 display vs 400 body — exploit the full range |
| Purple gradient backgrounds | Instant AI tell | Flat surfaces + single-colour accent elements |
| Same section background repeated | Visually inert scroll | Deliberate section rhythm — each has a purpose |
| Accent colour sprayed everywhere | Loses all impact | Each accent has one job. Yellow = 1 per page max. |

---

## 1. The Colour Layering System

This is the most important section. Every accent colour operates on a strict
**3-tier opacity ladder** over the dark base.

From the reference sites: Inscribe uses 8% blue tints with full-opacity UI chrome.
Daylit uses 12–15% yellow tints with full-opacity CTAs that match. Databricks barely
tints at all — red only appears at 100% on specific elements. All three are correct
for their brands. The pattern that unifies them is the jump from low tint to full
opacity — no values in between.

### The 3-Tier Ladder

```
Tier 1 — Section background:   accent at  8–10%  over neutral-900
Tier 2 — Card / surface:        accent at 15–18%  over Tier 1
Tier 3 — Elements:              accent at  100%   — icons, labels, borders, numbers
```

Never use a mid-opacity value (30–70%) on accent colours. It reads as a mistake,
not a decision. The gap between 18% and 100% is what makes full-opacity elements pop.

### Dark Accent Themes — Add to globals.css

The existing `brand-blue`, `brand-green` etc. are light-base themes (white + tint).
These are the dark-base equivalents for dark pages:

```css
/* ── DARK ACCENT: PURPLE ─────────────────────────────── */
[data-theme="dark-purple"] {
  --color--page-bg:         color-mix(in srgb, var(--swatch--purple-500) 10%, var(--swatch--neutral-900));
  --color--page-bg-subtle:  color-mix(in srgb, var(--swatch--purple-500) 6%,  var(--swatch--neutral-900));
  --color--surface-raised:  color-mix(in srgb, var(--swatch--purple-500) 18%, var(--swatch--neutral-900));
  --color--surface-sunken:  color-mix(in srgb, var(--swatch--purple-500) 6%,  var(--swatch--neutral-900));
  --color--border-default:  color-mix(in srgb, var(--swatch--purple-500) 22%, transparent);
  --color--border-subtle:   color-mix(in srgb, var(--swatch--purple-500) 12%, transparent);
  --color--border-strong:   color-mix(in srgb, var(--swatch--purple-500) 35%, transparent);
  --color--text-primary:    var(--swatch--neutral-0);
  --color--text-secondary:  var(--swatch--neutral-0-o70);
  --color--text-tertiary:   var(--swatch--neutral-0-o50);
  --color--text-brand:      var(--swatch--purple-300);
}

/* ── DARK ACCENT: BLUE ───────────────────────────────── */
[data-theme="dark-blue"] {
  --color--page-bg:         color-mix(in srgb, var(--swatch--blue-500) 10%, var(--swatch--neutral-900));
  --color--page-bg-subtle:  color-mix(in srgb, var(--swatch--blue-500) 6%,  var(--swatch--neutral-900));
  --color--surface-raised:  color-mix(in srgb, var(--swatch--blue-500) 16%, var(--swatch--neutral-900));
  --color--surface-sunken:  color-mix(in srgb, var(--swatch--blue-500) 6%,  var(--swatch--neutral-900));
  --color--border-default:  color-mix(in srgb, var(--swatch--blue-500) 22%, transparent);
  --color--border-subtle:   color-mix(in srgb, var(--swatch--blue-500) 12%, transparent);
  --color--border-strong:   color-mix(in srgb, var(--swatch--blue-500) 35%, transparent);
  --color--text-primary:    var(--swatch--neutral-0);
  --color--text-secondary:  var(--swatch--neutral-0-o70);
  --color--text-tertiary:   var(--swatch--neutral-0-o50);
  --color--text-brand:      var(--swatch--blue-300);
}

/* ── DARK ACCENT: GREEN ──────────────────────────────── */
[data-theme="dark-green"] {
  --color--page-bg:         color-mix(in srgb, var(--swatch--green-500) 10%, var(--swatch--neutral-900));
  --color--page-bg-subtle:  color-mix(in srgb, var(--swatch--green-500) 6%,  var(--swatch--neutral-900));
  --color--surface-raised:  color-mix(in srgb, var(--swatch--green-500) 16%, var(--swatch--neutral-900));
  --color--surface-sunken:  color-mix(in srgb, var(--swatch--green-500) 6%,  var(--swatch--neutral-900));
  --color--border-default:  color-mix(in srgb, var(--swatch--green-500) 22%, transparent);
  --color--border-subtle:   color-mix(in srgb, var(--swatch--green-500) 12%, transparent);
  --color--border-strong:   color-mix(in srgb, var(--swatch--green-500) 35%, transparent);
  --color--text-primary:    var(--swatch--neutral-0);
  --color--text-secondary:  var(--swatch--neutral-0-o70);
  --color--text-brand:      var(--swatch--green-300);
}

/* ── DARK ACCENT: ORANGE ─────────────────────────────── */
[data-theme="dark-orange"] {
  --color--page-bg:         color-mix(in srgb, var(--swatch--orange-500) 9%, var(--swatch--neutral-900));
  --color--page-bg-subtle:  color-mix(in srgb, var(--swatch--orange-500) 5%, var(--swatch--neutral-900));
  --color--surface-raised:  color-mix(in srgb, var(--swatch--orange-500) 15%, var(--swatch--neutral-900));
  --color--surface-sunken:  color-mix(in srgb, var(--swatch--orange-500) 5%, var(--swatch--neutral-900));
  --color--border-default:  color-mix(in srgb, var(--swatch--orange-500) 22%, transparent);
  --color--border-subtle:   color-mix(in srgb, var(--swatch--orange-500) 12%, transparent);
  --color--border-strong:   color-mix(in srgb, var(--swatch--orange-500) 35%, transparent);
  --color--text-primary:    var(--swatch--neutral-0);
  --color--text-secondary:  var(--swatch--neutral-0-o70);
  --color--text-brand:      var(--swatch--orange-300);
}

/* ── DARK ACCENT: YELLOW ─────────────────────────────── */
/* Yellow is the most visually aggressive. Max 1 section per page. */
[data-theme="dark-yellow"] {
  --color--page-bg:         color-mix(in srgb, var(--swatch--yellow-500) 8%, var(--swatch--neutral-900));
  --color--page-bg-subtle:  color-mix(in srgb, var(--swatch--yellow-500) 4%, var(--swatch--neutral-900));
  --color--surface-raised:  color-mix(in srgb, var(--swatch--yellow-500) 14%, var(--swatch--neutral-900));
  --color--surface-sunken:  color-mix(in srgb, var(--swatch--yellow-500) 4%, var(--swatch--neutral-900));
  --color--border-default:  color-mix(in srgb, var(--swatch--yellow-500) 20%, transparent);
  --color--border-subtle:   color-mix(in srgb, var(--swatch--yellow-500) 10%, transparent);
  --color--border-strong:   color-mix(in srgb, var(--swatch--yellow-500) 30%, transparent);
  --color--text-primary:    var(--swatch--neutral-0);
  --color--text-secondary:  var(--swatch--neutral-0-o70);
  --color--text-brand:      var(--swatch--yellow-400);
}
```

### Full-Opacity Elements (Tier 3) — Always 100%

Within any tinted section, these always use the swatch at full opacity:

- **Eyebrow / section labels** — `color: var(--swatch--[colour]-500)`
- **Icon fills and strokes**
- **Stat / metric numbers**
- **Card top-border accent** — `border-top: 2px solid var(--swatch--[colour]-500)`
- **Active pill / tag backgrounds**
- **CTA button backgrounds** (matching accent)

The contrast between an 8% background and a 100% icon is what makes a
section feel designed rather than decorated.

---

## 2. Section Rhythm — The Page Architecture

Based on the 5 reference sites, here is the proven rhythm for a typical page.
Never deviate without a reason.

```
1. Hero              → data-theme="dark"              (base dark — establish identity)
2. Social proof      → no theme / border-only          (logos, trust signals — keep quiet)
3. Feature A         → data-theme="dark-purple"        (primary brand — biggest feature)
4. Feature B         → data-theme="dark"               (back to base — let it breathe)
5. Feature C         → data-theme="dark-blue"          (second accent — new energy)
6. Stats / Numbers   → data-theme="dark" (plain)       (earned dark moment — credibility)
7. Feature D         → data-theme="dark-green"         (third accent — positive outcome)
8. Testimonials      → no theme / subtle border        (quiet — let customer speak)
9. CTA Banner        → data-theme="brand-purple-deep"  (peak emphasis — the close)
10. Footer           → data-theme="dark"               (return to base)
```

### Rhythm Rules
- **Never place two tinted sections back-to-back** — always a plain `dark` section between
- **`brand-purple-deep`** is reserved for the single peak-emphasis CTA — once per page
- **Yellow** if used, replaces one accent slot — never the footer CTA
- **Orange** works best for a mid-page urgency moment (risk, alert, fraud features)
- The plain dark stats section is earned — it lands harder after a tinted section

### Which Accent Goes Where
```
Purple   → trust, brand identity, primary feature
Blue     → data, intelligence, analytics features
Green    → outcomes, success, growth, hiring features
Orange   → risk, urgency, action, detection features
Yellow   → CTA spotlight only — max 1 per page
```

---

## 3. Applying the Tiers Inside a Section

### Card Pattern (inside tinted section)
```css
/* Section = Tier 1 (8–10% bg) via data-theme                    */
/* Card   = Tier 2 (15–18% surface) via --color--surface-raised   */
/* Icon   = Tier 3 (100%) via swatch directly                     */

.feature-card {
  background: var(--color--surface-raised);       /* Tier 2 — auto from theme */
  border: 1px solid var(--color--border-default); /* ~22% opacity */
  border-top: 2px solid var(--swatch--blue-500);  /* Tier 3 — 100% */
  padding: 1.5rem;
  border-radius: var(--radius--md);
}
.feature-card__icon { color: var(--swatch--blue-500); }   /* Tier 3 */
.feature-card__label {
  color: var(--swatch--blue-400);
  font-size: var(--font--label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

### Eyebrow Label (in tinted sections — use swatch, not semantic token)
```tsx
<span
  className="section-label"
  style={{ color: 'var(--swatch--blue-500)' }}
>
  Feature name
</span>
```

### Stat Block (in tinted sections)
```css
.stat__number {
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 800;
  line-height: 1;
  color: var(--swatch--[colour]-400);   /* full opacity, slightly lighter */
  font-variant-numeric: tabular-nums;
}
.stat__label {
  font-size: var(--font--label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color--text-secondary);
}
```

---

## 4. Brand Tokens — Source of Truth

**Never hardcode hex values.** Always use tokens from `src/app/globals.css`.

```
neutral-900   #1d2331   Dark base canvas
neutral-800   #2a3347   Elevated dark surface
purple-500    #472d6a   Primary brand / purple accent
yellow-500    #fec601   CTA spotlight — max 1 per page
green-500               Success / outcomes accent
orange-500    #f15f23   Risk / urgency accent
blue-500      #21a4f4   Data / intelligence accent
```

### Theme Quick Reference

| Theme | Use for |
|---|---|
| `dark` | Default — hero, neutral, stats, footer |
| `dark-purple` | Primary feature section |
| `dark-blue` | Data / intelligence features |
| `dark-green` | Outcomes, success, growth |
| `dark-orange` | Risk, urgency, action |
| `dark-yellow` | Max 1 use — CTA moment only |
| `brand-purple-deep` | Single peak CTA banner per page |

---

## 5. Typography

### Font: Aptos Only
All weights loaded (300–900). Exploit the full range.
Do NOT introduce external fonts.

```
Display hero:   800–900   clamp(3rem, 7vw, 6rem)     line-height 1.05
H1:             700       clamp(2.5rem, 5vw, 3.75rem) line-height 1.08
H2:             700       clamp(1.75rem, 3.5vw, 2.75rem)
H3:             600       1.75rem
Body:           400       1rem                         line-height 1.65
Labels/Caps:    600       0.75rem                      letter-spacing 0.08em
```

### Typography Rules
- All large text: `letter-spacing: -0.02em`
- Body copy max: `60ch`
- Hero intro max: `40ch`
- Avoid centred body copy longer than 2 lines
- Stat numbers: `font-variant-numeric: tabular-nums`

---

## 6. Layout

### Hero — Asymmetric Split (default)
```css
.hero__header-inner {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 5rem;
  align-items: center;
  text-align: left;
}
/* Centred ONLY for assessment / form-entry pages */
```

### Feature Section Variants
```css
/* A — standard: text left, visual right */
grid-template-columns: 1fr 1.3fr;

/* B — bleed: visual touches section edge */
grid-template-columns: 1fr 1fr; gap: 0;

/* C — text-dominant */
grid-template-columns: 1.4fr 1fr;
```

### Stats Row (never in cards)
```css
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  border-top: 1px solid var(--color--border-default);
}
.stats-row__item {
  padding: 2.5rem 2rem;
  border-right: 1px solid var(--color--border-default);
}
.stats-row__item:last-child { border-right: none; }
```

---

## 7. Card Design

### Tier 1 — Flat bordered (default in plain dark sections)
```css
background: var(--color--surface-raised);
border: 1px solid var(--color--border-default);
border-radius: var(--radius--md);  /* 0.25rem — never softer */
padding: 1.5rem;
/* NO box-shadow */
```

### Tier 2 — Accent top-border (in tinted sections)
```css
background: var(--color--surface-raised);
border: 1px solid var(--color--border-default);
border-top: 2px solid var(--swatch--[colour]-500);
```

### Tier 3 — Elevated (modals, dropdowns, tooltips ONLY)
```css
border: 1px solid var(--color--border-strong);
box-shadow: var(--shadow--card);  /* shadows ONLY here */
```

### Card Hover (all tiers)
```css
.card { transition: border-color 180ms cubic-bezier(0.16, 1, 0.3, 1); }
.card:hover { border-color: var(--color--border-strong); }
/* No lift, no shadow change — just the border brightens */
```

---

## 8. Motion — Snappy & Precise

### Add to globals.css
```css
:root {
  --ease-entry:  cubic-bezier(0.16, 1, 0.3, 1);
  --ease-exit:   cubic-bezier(0.4, 0, 1, 1);
  --ease-micro:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-state:  cubic-bezier(0.87, 0, 0.13, 1);
}
```

### Duration Map
```
Hover / button feedback:  150–200ms  --ease-micro
Tab / state change:       250–350ms  --ease-state
Scroll reveal:            500–650ms  --ease-entry
Dismiss / exit:           180–250ms  --ease-exit
```

### Scroll Reveal
```css
[data-reveal] {
  opacity: 0;
  transform: translateY(1.25rem);
  transition: opacity 600ms var(--ease-entry), transform 600ms var(--ease-entry);
}
[data-reveal].is-visible { opacity: 1; transform: none; }

[data-reveal-stagger] > * { opacity: 0; transform: translateY(0.75rem);
  transition: opacity 500ms var(--ease-entry), transform 500ms var(--ease-entry); }
[data-reveal-stagger].is-visible > *:nth-child(1) { opacity:1; transform:none; transition-delay:   0ms; }
[data-reveal-stagger].is-visible > *:nth-child(2) { opacity:1; transform:none; transition-delay:  70ms; }
[data-reveal-stagger].is-visible > *:nth-child(3) { opacity:1; transform:none; transition-delay: 140ms; }
[data-reveal-stagger].is-visible > *:nth-child(4) { opacity:1; transform:none; transition-delay: 210ms; }

@media (prefers-reduced-motion: reduce) {
  [data-reveal], [data-reveal-stagger] > * { opacity:1; transform:none; transition:none; }
}
```

---

## 9. Component Rules

### Navbar
```css
.navbar--scrolled {
  background: color-mix(in srgb, var(--color--page-bg) 85%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color--border-subtle);
  /* No heavy shadow */
  transition: all 200ms ease;
}
```

### Eyebrow Labels (brand signature — keep)
```css
.section-label {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color--border-default);
  background: var(--color--surface-raised);
  font-size: var(--font--label);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: var(--radius--full);
}
/* In tinted sections: override text colour to section accent at 100% */
```

### The Bordered Section (keep — use deliberately)
```html
<!-- Only for: primary CTA banner, featured product moment -->
<!-- Never on standard feature or testimonial sections -->
<div class="bordered-section" data-theme="brand-purple-deep">...</div>
```

---

## 10. Hard Bans

```css
/* ❌ NEVER */
background: linear-gradient(...);                /* any gradient background */
box-shadow: ... ;                                /* on flat content cards */
border-radius: 0.75rem;                          /* keep sharp: max 0.5rem */
transition: all 0.3s ease;                       /* use named curves */
color: rgba(var(--accent), 0.4);                 /* mid-opacity accent = design mistake */
```

```
// ❌ NEVER in page structure
Two tinted accent sections back-to-back (no plain dark section between)
brand-purple-deep on more than 1 section per page
Yellow theme used as a background more than once
Centred hero on a marketing/feature page
```

---

## 11. Pre-Build Checklist

- [ ] What `data-theme` does this section use? Is it different from the one before it?
- [ ] Which tier is each element on? (8% bg / 18% surface / 100% element)
- [ ] Is the layout asymmetric, or is there a reason it's centred?
- [ ] Does the headline use `clamp()` and `letter-spacing: -0.02em`?
- [ ] Are card shadows removed?
- [ ] Does the eyebrow label colour use the section accent at 100%?
- [ ] Are `data-reveal` / `data-reveal-stagger` attributes added?
- [ ] Is the easing curve named — not `ease` or `linear`?
- [ ] Does the section before and after have a different background?
- [ ] Is `brand-purple-deep` used more than once on this page?

---

## 12. The Litmus Test

> **"Is every accent element at 8%, 18%, or 100% — nothing in between?"**

> **"Would a designer at Linear, Vercel, or Databricks ship this?"**

If no to either — find the single weakest element and fix only that.
One precise fix beats a full redesign every time.

---

## 13. Osmo Animation Library

Pre-built, project-restyled components adapted from the Osmo platform.
Each has been converted to React + TypeScript with all visual values remapped
to the project token system. Use them proactively — don't wait to be asked.

When a layout calls for one of these patterns, reach for the right component directly.

---

### OSMO-01 — StickySteps

**Files:** `src/components/StickySteps/StickySteps.tsx` + `StickySteps.css`

**What it does:**
Scroll-driven feature section. Text blocks stack vertically on the left and
become "active" as they cross the viewport centre. The right-side visual
(image or custom React node) fades in/out in sync. On mobile it stacks
vertically with all scroll logic disabled.

**GSAP / dependencies:** None — vanilla scroll listener only.

**When to use:**
- 3–5 sequential product features that each need a dedicated visual
- "How it works" step-by-step flows
- Any feature section where listing all content at once would overwhelm
- Replaces generic alternating left/right feature rows

**When NOT to use:**
- Fewer than 3 steps (use a simple split layout instead)
- Content that isn't sequential or doesn't have distinct visuals per step

**Usage:**
```tsx
import { StickySteps } from '@/components/StickySteps/StickySteps';

const steps = [
  {
    eyebrow: 'Step 01',
    headline: 'Ingest your data',
    body: 'Connect any data source in minutes. We handle the schema.',
    imageSrc: '/images/feature-ingest.png',
    imageAlt: 'Data ingestion interface',
  },
  {
    eyebrow: 'Step 02',
    headline: 'Run assessments',
    body: 'AI-powered scoring across every dimension that matters.',
    imageSrc: '/images/feature-assess.png',
    imageAlt: 'Assessment dashboard',
  },
  {
    eyebrow: 'Step 03',
    headline: 'Act on results',
    body: 'Export, share, and integrate findings into your workflow.',
    imageSrc: '/images/feature-results.png',
    imageAlt: 'Results export screen',
  },
];

// Dark-blue theme
<StickySteps
  steps={steps}
  theme="dark-blue"
  accentSwatch="var(--swatch--blue-500)"
/>

// Dark-green theme
<StickySteps
  steps={steps}
  theme="dark-green"
  accentSwatch="var(--swatch--green-500)"
/>

// Custom visual (any React node instead of an image)
const stepsWithVisual = [
  {
    eyebrow: 'Step 01',
    headline: 'Live dashboard',
    body: 'See scores update in real time.',
    visual: <DashboardPreview />,
  },
];
```

**Theming rules:**
- Always pass a `dark-*` theme — this component lives on dark backgrounds
- `accentSwatch` should match the theme colour (e.g. `dark-blue` → `--swatch--blue-500`)
- The visual gets a 2px full-opacity accent top-border (Tier 3) automatically
- The eyebrow renders at full opacity (Tier 3) — do not reduce it
- Inactive steps dim to 30% opacity — do not change this value

**Customising the visual aspect ratio:**
The visual defaults to 4:3. Override per page if needed:
```css
.my-page .sticky-steps__visual { aspect-ratio: 16 / 10; }
```

**Page rhythm position:** slots 3, 5, or 7 (feature sections).
Never place two StickySteps instances back-to-back on the same page.

---

### OSMO-02 — useDisplayCount

**File:** `src/hooks/useDisplayCount.ts`

**What it does:**
Counts rendered items and returns the number for display anywhere in JSX.
Two exports: `useDisplayCount` for a single array, `useDisplayCounts` for
multiple named groups simultaneously. Stays in sync automatically as the
data changes — no DOM scanning, no `useEffect` needed.

**GSAP / dependencies:** None — pure React `useMemo`.

**When to use:**
- Dynamic counts that reflect real data: "12 open positions", "47 assessments"
- Stat callouts that must stay in sync with a filtered or paginated list
- Any place the Osmo original used `[data-count-display]` + `[data-count-item]`

**When NOT to use:**
- Static hardcoded numbers (just write the number directly)
- Counts that come from an API response (use the API value directly, not `.length`)

**Usage — single group:**
```tsx
import { useDisplayCount } from '@/hooks/useDisplayCount';

const count = useDisplayCount(jobs);

<p className="text-secondary">
  We have{' '}
  <strong style={{ color: 'var(--swatch--purple-500)' }}>{count}</strong>
  {' '}open positions
</p>
```

**Usage — multiple groups:**
```tsx
import { useDisplayCounts } from '@/hooks/useDisplayCount';

const counts = useDisplayCounts({ jobs, articles, integrations });

<div className="stats-row">
  <div className="stats-row__item">
    <span className="stat__number">{counts.jobs}</span>
    <span className="stat__label">Open positions</span>
  </div>
  <div className="stats-row__item">
    <span className="stat__number">{counts.integrations}</span>
    <span className="stat__label">Integrations</span>
  </div>
</div>
```

**Pairing with stat styling:**
Count outputs pair directly with the stat block pattern from Section 9:
```tsx
<span
  className="stat__number"
  style={{ color: 'var(--swatch--blue-400)' }}
>
  {counts.jobs}
</span>
```

**Note:** For animated counting (number ticks up on scroll), combine with
a GSAP `CountTo` animation — document separately when that Osmo component
is added to the library.

---

### OSMO-03 — Tooltip

**Files:** `src/components/Tooltip/Tooltip.tsx` + `Tooltip.css`

**What it does:**
CSS-only hover tooltip. Configurable position (top/bottom × center/left/right),
three icon types (info/question/alert) each with their own semantic accent colour,
and a free content slot inside the card. No JS, no GSAP, no state.

**GSAP / dependencies:** None — pure CSS `:hover` + transition.

**When to use:**
- Inline help on form labels, metric names, or jargon
- Explaining a score, dimension, or data point without cluttering the UI
- Any "?" or "ⓘ" moment next to a piece of text

**When NOT to use:**
- Content longer than 3–4 lines (use a modal or drawer)
- Touch-primary surfaces (hover doesn't fire on mobile)
- Interactive content inside (links, buttons — use Radix Popover instead)

**Icon semantics (applied automatically via CSS):**
- `info`     → blue  (`--swatch--blue-500`)   — neutral contextual info
- `question` → purple (`--swatch--purple-500`) — "what does this mean?"
- `alert`    → orange (`--swatch--orange-500`) — warning or caution

**Usage:**
```tsx
import { Tooltip, TooltipContent } from '@/components/Tooltip/Tooltip';

// Standard title + body
<Tooltip
  icon="info"
  y="top"
  x="center"
  content={
    <TooltipContent
      title="Dimension score"
      body="This score reflects performance across 4 assessed competencies."
    />
  }
>
  Cognitive ability
</Tooltip>

// Alert icon, bottom position
<Tooltip
  icon="alert"
  y="bottom"
  x="left"
  content={<TooltipContent body="Score below threshold. Review recommended." />}
>
  Risk score
</Tooltip>

// Custom content (no title, just a note)
<Tooltip
  icon="question"
  content={<p className="tooltip__card-text">Calculated from last 90 days of data.</p>}
>
  Trailing average
</Tooltip>
```

**Theming notes:**
- Card uses `--color--surface-raised` + `--color--border-strong` — adapts
  automatically across all `data-theme` variants, no manual overrides needed
- Box shadow is intentional here — this is an elevated overlay (Tier 3 card rule)
- Icon colours are hardcoded to semantic swatches — do not override per section

---

### OSMO-04 — DirectionalList

**Files:** `src/components/DirectionalList/DirectionalList.tsx` + `DirectionalList.css`

**What it does:**
A table-style list where a coloured accent tile wipes in from the exact
edge the cursor enters, and exits the same way it came. Creates a fluid,
directional reveal on every row hover. Fully generic — accepts any column
schema via props.

**GSAP / dependencies:** None — vanilla mouseenter/mouseleave.

**Direction modes:**
- `"y"` — top/bottom only (best default for most lists)
- `"x"` — left/right only
- `"all"` — nearest edge detected (most dynamic, good for wide rows)

**When to use:**
- Assessment or candidate result rows
- Integration / partner / tool listings
- Press mentions, awards, publications
- Any scannable list where rows link somewhere
- Replaces boring striped tables or card grids for list-type content

**When NOT to use:**
- More than ~12 items (use a paginated table instead)
- Non-clickable/non-linkable rows (the hover implies interactivity)
- Dense data tables with 5+ columns

**Usage:**
```tsx
import { DirectionalList } from '@/components/DirectionalList/DirectionalList';

// Assessment results list
const columns = [
  { label: 'Candidate',  render: 'name',   width: 'primary' },
  { label: 'Role',       render: 'role',   width: 'flex'    },
  { label: 'Score',      render: (item) => `${item.score}%`, width: 'narrow' },
  { label: 'Date',       render: 'date',   width: 'narrow'  },
];

<DirectionalList
  columns={columns}
  items={candidates}
  directionType="y"
  accentSwatch="var(--swatch--purple-500)"
  onItemClick={(item) => router.push(`/candidates/${item.id}`)}
/>

// Integration listing (with hrefs)
const integrations = [
  { id: 1, name: 'Greenhouse', category: 'ATS', href: '/integrations/greenhouse' },
  { id: 2, name: 'Workday',    category: 'HRIS', href: '/integrations/workday' },
];

const intCols = [
  { label: 'Integration', render: 'name',     width: 'primary' },
  { label: 'Category',    render: 'category', width: 'flex'    },
];

<DirectionalList
  columns={intCols}
  items={integrations}
  directionType="y"
  accentSwatch="var(--swatch--blue-500)"
/>
```

**Theming:**
- Pass `accentSwatch` matching the parent section's theme
  (e.g. section `dark-green` → `accentSwatch="var(--swatch--green-500)"`)
- The tile renders at 100% accent opacity (Tier 3) — intentional
- Text colour transitions to `--color--text-inverse` on hover (white over tile)
- Reduced motion: tile wipe is replaced by a simple background tint

**Column width tokens:**
- `primary` — 30% min-width, for the main identifier column
- `flex` — fills remaining space
- `auto` — shrinks to content
- `narrow` — right-aligned, for years, scores, counts

**Page rhythm position:** works in any section.
Pairs especially well inside `dark-purple` or `dark-blue` themed sections
where the accent tile colour is already established.

---

### OSMO-05 — useContentReveal + RevealGroup

**Files:**
- `src/hooks/useContentReveal.ts` — GSAP hook
- `src/components/RevealGroup/RevealGroup.tsx` — JSX wrappers

**What it does:**
The most versatile scroll reveal system in the library. Elements animate
upward and fade in as they enter the viewport, with configurable stagger
timing, entrance distance, and full support for nested groups with their
own independent stagger. This replaces the plain CSS `[data-reveal]`
system for any layout that needs GSAP-quality easing or nested sequences.

**GSAP dependencies:**
- `gsap` — `npm install gsap`
- `gsap/ScrollTrigger` — imported dynamically inside the hook (no SSR issues)

**Three components:**
- `<RevealGroup>` — wraps a set of siblings to animate in sequence
- `<RevealNested>` — nested sub-group with its own stagger/distance
- `<RevealItem>` — marks a specific child to skip or override distance

**One hook:**
- `useContentReveal()` — call once per page, wires up all groups on that page

**When to use:**
- Hero section (headline + subtext + CTA stagger in sequence)
- Feature card grids (each card staggers in)
- Stat rows (numbers reveal one by one)
- Any section where the CSS `[data-reveal]` pattern isn't expressive enough

**When NOT to use:**
- Simple single-element reveals (use CSS `[data-reveal]` instead — no GSAP overhead)
- Components that mount/unmount dynamically after page load (use GSAP context directly)

**Setup — call the hook once per page:**
```tsx
// app/(site)/page.tsx  or any layout component
'use client';
import { useContentReveal } from '@/hooks/useContentReveal';

export default function HomePage() {
  useContentReveal(); // scans DOM on mount, wires all [data-reveal-group] elements
  return <main>...</main>;
}
```

**Usage examples:**

```tsx
import { RevealGroup, RevealNested, RevealItem } from '@/components/RevealGroup/RevealGroup';

// 1. Hero — headline, subtext, CTA stagger in at 120ms intervals
<RevealGroup stagger={120} distance="1.5rem" start="top 90%">
  <h1 className="hero__title">Hire with confidence</h1>
  <p className="hero__intro">Science-backed assessments for every role.</p>
  <div className="hero__cta">
    <Button variant="primary">Get started</Button>
    <Button variant="secondary">See how it works</Button>
  </div>
</RevealGroup>

// 2. Feature card grid — cards stagger in at 80ms
<RevealGroup stagger={80} as="ul" className="grid grid--3">
  {features.map(f => (
    <li key={f.id}>
      <FeatureCard {...f} />
    </li>
  ))}
</RevealGroup>

// 3. Nested — section header reveals first, then cards stagger
<RevealGroup stagger={100}>
  <div className="section__header">       {/* reveals first */}
    <span className="section-label">Features</span>
    <h2>Everything you need</h2>
  </div>
  <RevealNested stagger={70} distance="1rem">
    {cards.map(c => <FeatureCard key={c.id} {...c} />)}
  </RevealNested>
</RevealGroup>

// 4. Skip a decorative element from the sequence
<RevealGroup stagger={100}>
  <RevealItem ignore>
    <div className="decorative-line" />  {/* skipped */}
  </RevealItem>
  <h2>Section headline</h2>
  <p>Supporting copy</p>
</RevealGroup>

// 5. Nested group where the wrapper card itself also animates
<RevealGroup stagger={100}>
  <RevealNested includeParent stagger={60}>
    {items.map(i => <Item key={i.id} {...i} />)}
  </RevealNested>
</RevealGroup>
```

**Easing change from original:**
Osmo used `power4.inOut` — remapped to `power4.out`. Entrances should
always ease out (fast start → graceful landing). In-out reads as hesitant
on entrance and is better suited to state transitions.

**Default values (project-aligned):**
- `stagger`: 100ms
- `distance`: 1.25rem (was "2em" in original — aligned to spacing scale)
- `start`: "top 80%"
- `duration`: 0.7s (was 0.8s — slightly snappier)

**CSS `[data-reveal]` vs `useContentReveal` — when to use which:**
| Situation | Use |
|---|---|
| Single element, simple fade-up | CSS `[data-reveal]` |
| Multiple siblings staggering in | `useContentReveal` |
| Cards in a grid | `useContentReveal` |
| Hero sequence (3+ elements) | `useContentReveal` |
| Nested groups with different timings | `useContentReveal` |
