# Dark SaaS Design Skill
## Premium Next.js / React Frontend — Codebase-Specific

This skill governs all frontend design decisions. It is written for this specific
codebase and its exact token system. Read it fully before writing any CSS.

---

## 0. What Was Sloppy — Never Again

| Pattern | Why it failed | The fix |
|---|---|---|
| Same layout every section | No visual rhythm | Choose layout based on content — centred, split, or asymmetric |
| `box-shadow` on flat cards | Muddy, floaty on dark | Borders only; shadows for overlays only |
| `ease` on every transition | Soft, mushy, generic | Named bezier curves per interaction type |
| Aptos same weight throughout | No hierarchy drama | 800/900 display vs 400 body — exploit the full range |
| Purple gradient backgrounds | Instant AI tell | Flat surfaces + single-colour accent elements |
| Same section background repeated | Visually inert scroll | Deliberate section rhythm — each has a purpose |
| Accent colour sprayed everywhere | Loses all impact | Each accent has one job. Yellow = 1 per page max. |
| Hardcoded hex / rgb() anywhere | Theme breaks instantly | Every colour through a CSS custom property, always |
| Colouring child elements manually | Breaks on theme change | Let the theme cascade do it — semantic tokens only |
| Card with no surface token | Floats or disappears | `var(--color--surface-raised)` always, no exceptions |
| Button hover with raw colour | Breaks in other themes | All states use `var(--color--interactive-*-hover)` |

---

## ★ 1. The Theme Cascade — The Primary Mental Model

> **Set `data-theme` once on the wrapper. Every child uses semantic tokens.
> The right colour for every element falls out automatically.
> Never override colours manually inside a themed wrapper.**

This is the entire system. Everything else in this file is detail.

### How it works

`data-theme` on any element redefines every `--color--*` custom property scoped
to that element and all its descendants. Every child uses only semantic tokens
(`var(--color--text-primary)`, `var(--color--surface-raised)`, etc.) — it never
needs to know which theme is active. Change `data-theme` and everything adapts.

```
┌──────────────────────────────────────────────────────────────────┐
│  <section data-theme="brand-orange">                             │
│    ↳ ALL --color--* tokens are redefined for every child here    │
│                                                                  │
│    --color--page-bg         = warm peach (orange 7% over white)  │
│    --color--text-primary    = dark orange                        │
│    --color--surface-raised  = pure white                         │
│    --color--border-default  = orange at 20% opacity              │
│    --color--interactive-cta = orange-500                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  <h2> color: var(--color--text-primary)                 │  →  dark orange
│  │                                                         │     │
│  │  <div class="card">                                     │     │
│  │    background: var(--color--surface-raised)             │  →  white
│  │    border: 1px solid var(--color--border-default)       │  →  orange-20%
│  │  </div>                                                 │     │
│  │                                                         │     │
│  │  <button class="btn--cta">                              │     │
│  │    background: var(--color--interactive-cta)            │  →  orange-500
│  │    color:      var(--color--interactive-cta-text)       │  →  white
│  │  </button>                                              │     │
│  └─────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### Same component, every theme — zero CSS changes

The exact same JSX and CSS produces a fully correct, different result in every theme:

| Token | `brand-orange` | `dark-blue` | `brand-purple-deep` | `dark` |
|---|---|---|---|---|
| `--color--page-bg` | warm peach | dark navy-blue | full purple | dark navy |
| `--color--text-primary` | dark orange | white | white | white |
| `--color--surface-raised` | pure white | blue 18% over dark | purple 16% tint | neutral 16% over dark |
| `--color--border-default` | orange 20% | white 15% | white 15% | white 15% |
| `--color--interactive-cta` | orange-500 | purple-500 | yellow-500 | yellow-500 |

**Same JSX. Same CSS. Different `data-theme`. Correct result every time.**

### The rule that follows

Never write CSS that targets a specific theme to colour a child element.
The moment you write `[data-theme="brand-orange"] .my-text { color: var(--swatch--orange-700); }`
you have broken the system — that component will be wrong in every other theme.

```css
/* ❌ Wrong — component knows about the theme */
[data-theme="brand-orange"] .section-heading {
  color: var(--swatch--orange-700);
}

/* ✅ Correct — component is theme-agnostic */
.section-heading {
  color: var(--color--text-primary);
  /* The theme decides what this resolves to */
}
```

**The only exception:** Tier 3 decorative accent elements (icons, eyebrow labels,
stat numbers, accent top-borders) use swatch tokens directly. These are intentional
100% opacity punctuation marks and are deliberately fixed to the section accent.
Everything else uses semantic tokens only.

### Component Theme Props — The Standard Pattern

Every section component accepts a `theme` prop. The default is always `brand-purple`.
Pages compose sections and pass theme overrides where the rhythm requires it.

```tsx
// ── Component definition ──────────────────────────────────────
import type { ThemeVariant } from '@/lib/theme';

interface FeatureSectionProps {
  heading: string;
  theme?: ThemeVariant;          // always optional, always has a default
}

export default function FeatureSection({ heading, theme = 'brand-purple' }: FeatureSectionProps) {
  return (
    <section data-theme={theme}>
      <h2>{heading}</h2>
    </section>
  );
}

// ── Page usage — override where needed ───────────────────────
<FeatureSection heading="Our platform" />                    // brand-purple (default)
<FeatureSection heading="See the data" theme="dark-blue" />  // explicit override
<FeatureSection heading="Footer area" theme="dark" />        // explicit dark
```

**Rules:**
- `theme` prop is always `ThemeVariant` (from `@/lib/theme`)
- Default is always `'brand-purple'` — never `'dark'`, never omitted
- `data-theme={theme}` goes on the outermost wrapper element
- Pages are the only place where non-default themes are set

---

## 2. Complete Element → Token Reference

This is the lookup table. Use it before writing any colour value.

```css
/* ══ SECTION / PAGE ══════════════════════════════════════════════ */

/* Themed section */
<section data-theme="[theme]">
  /* background-color: var(--color--page-bg) is set automatically by the theme */

/* Plain section without an accent theme */
.my-section {
  background-color: var(--color--page-bg);  /* MUST be explicit — never implicit */
}

/* ══ SURFACES (elements raised above the section background) ═════ */

card, panel, pricing card,
CTA box, testimonial block   →  background: var(--color--surface-raised)
inset / recessed surface      →  background: var(--color--surface-sunken)
modal / drawer backdrop       →  background: var(--color--surface-overlay)

/* ══ TEXT ════════════════════════════════════════════════════════ */

heading (h1–h6)               →  color: var(--color--text-primary)
body copy, paragraphs         →  color: var(--color--text-secondary)
caption, footnote, muted      →  color: var(--color--text-tertiary)
brand overline, label text    →  color: var(--color--text-brand)
inverse text (on dark bg)     →  color: var(--color--text-inverse)

/* Tier 3 exception — eyebrow label text and stat numbers only */
eyebrow label text            →  color: var(--swatch--[colour]-500)
stat number                   →  color: var(--swatch--[colour]-400)

/* ══ BORDERS ═════════════════════════════════════════════════════ */

standard card / section       →  border: 1px solid var(--color--border-default)
subtle divider / separator    →  border: 1px solid var(--color--border-subtle)
strong emphasis border        →  border: 1px solid var(--color--border-strong)

/* Tier 3 exception — accent top border on cards only */
card accent top-border        →  border-top: 2px solid var(--swatch--[colour]-500)

/* ══ BUTTONS — PRIMARY ═══════════════════════════════════════════ */

background (rest)             →  var(--color--interactive-primary)
background (hover)            →  var(--color--interactive-primary-hover)
label text                    →  var(--color--interactive-primary-text)

/* ══ BUTTONS — SECONDARY / GHOST ════════════════════════════════ */

border                        →  var(--color--interactive-secondary-border)
label text                    →  var(--color--interactive-secondary-text)
background (hover)            →  var(--color--interactive-secondary-hover-bg)

/* ══ BUTTONS — CTA (max 1 per page) ════════════════════════════ */

background (rest)             →  var(--color--interactive-cta)
background (hover)            →  var(--color--interactive-cta-hover)
label text                    →  var(--color--interactive-cta-text)

/* ══ ICONS ═══════════════════════════════════════════════════════ */

icon in body content          →  color: var(--color--text-secondary)   (inherits)
icon as Tier 3 accent         →  color: var(--swatch--[colour]-500)     (swatch OK)
SVG fill / stroke             →  fill: currentColor  OR  var(--color--*)
                                 NEVER a hardcoded hex or rgb()

/* ══ INTERACTIVE STATES ══════════════════════════════════════════ */

focus ring                    →  outline: 2px solid var(--color--interactive-primary)
```

---

## 3. Worked Example — Brand Orange Section (from the screenshot)

The section in the screenshot uses `data-theme="brand-orange"`. Here is the
correct implementation — every element uses semantic tokens only.

```tsx
<section data-theme="brand-orange">
  {/*
    Tokens resolved inside this wrapper:
    --color--page-bg         = warm peach  (orange 7% over white)
    --color--text-primary    = dark orange
    --color--text-secondary  = muted orange-tinted grey
    --color--surface-raised  = pure white
    --color--border-default  = orange at 20% opacity
    --color--interactive-cta = orange-500
    --color--interactive-cta-text = white
  */}

  <h2 className="section-heading">
    {/* color: var(--color--text-primary) → resolves to dark orange */}
    Siloed assessment data gives you fragments,
    not the full picture of candidate potential.
  </h2>

  <span className="section-label">
    {/* background: var(--color--surface-raised) → white pill
        border: var(--color--border-default)     → orange-20% border
        color: var(--color--text-secondary)      → muted orange text  */}
    With Vero Assess you can
  </span>

  <div className="feature-card">
    {/* background: var(--color--surface-raised) → white card
        border: 1px solid var(--color--border-default) → orange-20% */}

    <CheckIcon style={{ color: 'var(--swatch--orange-500)' }} />
    {/* ↑ Tier 3 accent icon — swatch token is correct here */}

    <p className="text-body--lg">
      {/* color: var(--color--text-secondary) → muted orange-tinted */}
      Make data-backed hiring decisions with confidence
    </p>
  </div>

  <button className="btn--cta">
    {/* background: var(--color--interactive-cta)      → orange-500
        color:      var(--color--interactive-cta-text) → white     */}
    Get started free
  </button>
</section>
```

**Now change `data-theme="brand-orange"` to `data-theme="dark-blue"` — the same JSX
and CSS produces white text, a blue-tinted card, a blue border, and a purple CTA.
No CSS changes whatsoever. The theme cascade does all the work.**

---

## 4. Colour System — 5 Colours, Multiple Variants Each

```
Purple:  --swatch--purple-500  #472d6a
Yellow:  --swatch--yellow-500  #fec601
Green:   --swatch--green-500   #6fd08b
Orange:  --swatch--orange-500  #f15f23
Blue:    --swatch--blue-500    #21a4f4
```

**No colour mixing.** A green section is green. An orange section is orange.
Never mix brand colours. Never add a second accent to a section.

### What each theme variant resolves to

```
brand-[colour]         Light tint over white — for panels, modals, isolated cards
                       surface-raised = white (clean lift on tinted bg)
                       text-primary   = dark shade of the colour
                       interactive-cta = the brand colour at 500

dark-[colour]          Colour tint over dark navy — for main site sections
                       surface-raised = colour at 18% over dark (tinted dark card)
                       text-primary   = white
                       interactive-cta = varies (see theme file)

brand-[colour]-deep    Colour at 100% as the bg — peak emphasis moments only
                       surface-raised = colour + 16% white (lighter card on bold)
                       text-primary   = white (or dark for yellow)
                       interactive-cta = contrasting colour (yellow or purple)
```

Full token values live in `src/app/globals.css`.

---

## 5. Section Rhythm — Page Architecture

```
1. Hero              → theme prop (default: brand-purple)   (light tint — open, clear)
2. Social proof      → no theme / border-only               (logos — keep quiet)
3. Feature A         → theme prop (default: brand-purple)   (primary brand moment)
4. Feature B         → theme prop → pass "dark"             (explicit dark — breathe)
5. Feature C         → theme prop → pass "brand-blue"       (second accent)
6. Stats / Numbers   → theme prop → pass "dark"             (earned credibility)
7. Feature D         → theme prop → pass "dark-green"       (positive outcome)
8. Testimonials      → no theme / subtle border             (quiet — let customer speak)
9. CTA Banner        → theme prop → pass "brand-purple-deep" (peak emphasis — the close)
10. Footer           → theme prop → pass "dark"             (return to base)
```

### Rhythm Rules
- **Default theme is `brand-purple`** — components default to it via props; pages
  override by passing a different `theme` value
- **`dark` is never a component default** — it must always be explicitly passed as a prop
- **Never place two tinted sections back-to-back** — always a plain `dark` between
- **`brand-purple-deep`** is reserved for the single peak CTA — once per page only
- **Yellow** if used, replaces one accent slot — never the footer CTA
- **Orange** works best for a mid-page urgency/risk moment

---

## 6. The 3-Tier Opacity Ladder

Three distinct levels inside any section. The tier is set by which token you use.

```
Tier 1 — Section background:  var(--color--page-bg)          set by data-theme
Tier 2 — Card / surface:      var(--color--surface-raised)   set by token
Tier 3 — Accent elements:     var(--swatch--[colour]-500)    100% direct swatch
```

The jump from Tier 2 (~16–18%) to Tier 3 (100%) is what creates visual pop.
Never use mid-opacity (30–70%) on brand accent colours.

### What surface-raised resolves to per theme (Tier 2)

```
dark-blue:          blue-500 at 18% over dark navy   → blue-tinted dark card
brand-orange:       pure white (neutral-0)            → clean white card on peach
brand-purple-deep:  white at 16% over purple-500      → lighter purple card
dark:               white at 12% over dark navy       → subtle lifted dark card
```

---

## 7. Card, Panel & CTA Box Patterns

All surface elements follow the same pattern. The theme does the work.

```css
/* Feature card — works in every theme */
.feature-card {
  background: var(--color--surface-raised);        /* Tier 2 — theme sets the shade */
  border: 1px solid var(--color--border-default);  /* theme sets the opacity */
  border-radius: var(--radius--md);
  padding: 1.5rem;
}
/* Optional Tier 3 accent top-border */
.feature-card--accented {
  border-top: 2px solid var(--swatch--[colour]-500);
}

.feature-card__icon  { color: var(--swatch--[colour]-500); }  /* Tier 3 */
.feature-card__title { color: var(--color--text-primary); }
.feature-card__body  { color: var(--color--text-secondary); }

/* CTA box / highlight panel — same pattern */
.cta-box {
  background: var(--color--surface-raised);
  border: 1px solid var(--color--border-default);
  border-top: 2px solid var(--swatch--[colour]-500);
  border-radius: var(--radius--lg);
  padding: 2rem;
}
.cta-box__heading { color: var(--color--text-primary); }
.cta-box__body    { color: var(--color--text-secondary); }

/* Pricing card */
.pricing-card {
  background: var(--color--surface-raised);
  border: 1px solid var(--color--border-default);
  border-radius: var(--radius--lg);
}
.pricing-card--featured {
  border-color: var(--color--border-strong);
  border-top: 3px solid var(--swatch--purple-500);
}
.pricing-card__price  { color: var(--color--text-primary); }
.pricing-card__period { color: var(--color--text-tertiary); }
```

---

## 8. Button System — Full Token Reference

```css
/* PRIMARY */
.btn--primary { background: var(--color--interactive-primary); color: var(--color--interactive-primary-text); }
.btn--primary:hover { background: var(--color--interactive-primary-hover); }

/* SECONDARY / GHOST */
.btn--secondary { background: transparent; color: var(--color--interactive-secondary-text); border: 1.5px solid var(--color--interactive-secondary-border); }
.btn--secondary:hover { background: var(--color--interactive-secondary-hover-bg); }

/* CTA — max 1 per page */
.btn--cta { background: var(--color--interactive-cta); color: var(--color--interactive-cta-text); }
.btn--cta:hover { background: var(--color--interactive-cta-hover); }

/* Focus — all variants */
:focus-visible { outline: 2px solid var(--color--interactive-primary); outline-offset: 2px; }
```

---

## 9. Typography

**Font: Aptos only.** Do NOT introduce external fonts.

```
Display:  800–900  clamp(3rem, 7vw, 6rem)        line-height 1.05
H1:       700      clamp(2.5rem, 5vw, 3.75rem)   line-height 1.08
H2:       700      clamp(1.75rem, 3.5vw, 2.75rem)
H3:       600      1.75rem
Body:     400      1rem                            line-height 1.65
Labels:   600      0.75rem                         letter-spacing 0.08em
```

Rules: large text `letter-spacing: -0.02em` — body max `60ch` — stat numbers `font-variant-numeric: tabular-nums` — all text colour via `var(--color--text-*)` tokens.

---

## 10. Easing Curves

Named curves only. Never `ease`, `ease-in-out`, or `linear`.

```
power2.out    scroll reveals, page transitions
power3.out    modal / panel open
power2.in     modal / panel close
power4.inOut  page-level wipes
elastic.out   bounce feedback (sparingly)
```

CSS hover transitions only — never section animations (use GSAP):
```css
transition: background-color var(--transition--default);
transition: transform var(--transition--spring);
```

---

## 11. Component Rules

### Navbar
```css
.navbar--scrolled {
  background: color-mix(in srgb, var(--color--page-bg) 85%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color--border-subtle);
  transition: background-color 200ms var(--transition--default);
}
```

### Eyebrow Labels
```css
.section-label {
  background: var(--color--surface-raised);
  border: 1px solid var(--color--border-default);
  color: var(--color--text-secondary);
  border-radius: var(--radius--full);
  /* In tinted sections: override text to swatch Tier 3 */
}
```

### The Bordered Section
```html
<!-- Only for: primary CTA banner, featured product moment — never standard sections -->
<div class="bordered-section" data-theme="brand-purple-deep">...</div>
```

---

## 12. Hard Bans

```css
/* ❌ NEVER */
background: linear-gradient(...);
box-shadow on flat cards;
border-radius > var(--radius--xl);
transition: all 0.3s ease;
color: rgba(var(--accent), 0.4);   /* mid-opacity accent */

/* ❌ NEVER — raw colour values of any kind */
color: #472d6a;
background-color: rgba(71, 45, 106, 0.1);
border-color: rgb(200, 200, 200);
background: white; color: black;
fill: #fff; stroke: #000;
style={{ color: '#fff', background: 'rgba(...)' }}

/* ❌ NEVER — theme-targeting overrides */
[data-theme="brand-orange"] .any-child { color: var(--swatch--orange-700); }
/* Use var(--color--text-primary) and let the theme resolve it */
```

```
❌ NEVER in page structure
Two tinted sections back-to-back
brand-purple-deep more than once per page
Yellow theme used more than once
Centred hero on a feature or category page
A surface element (card, panel, CTA) without an explicit background token
A section without data-theme bound to a theme prop
A component with theme defaulting to 'dark' — default must always be 'brand-purple'
A hardcoded data-theme="dark" inside a component — dark must come from a page prop
```

---

## 13. Pre-Build Checklist

### Theme cascade
- [ ] Does the section wrapper have `data-theme={theme}` bound to a prop?
- [ ] Does the `theme` prop default to `'brand-purple'` (not `'dark'`)?
- [ ] If the page needs a dark section, is `theme="dark"` passed explicitly from the page?
- [ ] Would the component look correct if I changed `data-theme` to any other theme?
- [ ] Are all headings using `var(--color--text-primary)`?
- [ ] Is all body copy using `var(--color--text-secondary)`?
- [ ] Do all cards / panels / CTA boxes have `background: var(--color--surface-raised)`?
- [ ] Do all borders use `var(--color--border-*)` tokens?
- [ ] Do all buttons use `var(--color--interactive-*)` for bg, text, and hover?
- [ ] Are there zero hex, rgb(), rgba(), hsl(), or named CSS colours anywhere?
- [ ] Are swatches only used for Tier 3 (icons, eyebrows, stat numbers, accent borders)?

### Design quality
- [ ] Is this theme different from the section immediately before and after it?
- [ ] Is `brand-purple-deep` used more than once on this page?
- [ ] Does every `h1–h4` use `useTextReveal`? Every other reveal use `useFadeUp`?
- [ ] Are card shadows removed (borders only on flat surfaces)?
- [ ] Is the easing curve named — not `ease` or `linear`?

---

## 14. The Litmus Tests

> **"If I change `data-theme` on this wrapper to any other theme — does every child
> automatically adapt with zero CSS changes?"**
> If no — there are manual colour overrides that must be removed.

> **"Is every accent element at page-bg / surface-raised / 100% swatch — nothing between?"**

> **"Are there zero hex, rgb(), or rgba() values in this file?"**

> **"Would a designer at Linear, Vercel, or Databricks ship this?"**

---

## 15. Osmo Animation Library

| ID | Component | File | Use for |
|---|---|---|---|
| OSMO-01 | StickySteps | `src/components/StickySteps/` | Scroll-driven feature sections |
| OSMO-02 | useDisplayCount | `src/hooks/useDisplayCount.ts` | Dynamic item counts in UI copy |
| OSMO-03 | Tooltip | `src/components/Tooltip/` | Inline contextual help |
| OSMO-04 | DirectionalList | `src/components/DirectionalList/` | Hoverable list rows with wipe |
| OSMO-05 | useContentReveal + RevealGroup | `src/hooks/useContentReveal.ts` | GSAP scroll reveal |