# pa11y Automated WCAG 2 AA Scan

**Date:** 2026-05-13
**Tool:** pa11y 9.1.1 (HTML CodeSniffer rules)
**Standard:** `WCAG2AA`
**Scope:** 8 publicly-reachable URLs against the local dev server. Pages behind a basket-state guard (`/details`, `/payment`, `/contract`, `/confirmation`, `/bespoke`) redirect when no basket exists, so pa11y sees the redirect target rather than the gated page — those require a separate authenticated scan.

Raw JSON output: [audit/pa11y-results/](./pa11y-results/)

---

## Headline

**Zero genuine WCAG 2 AA violations** detected by pa11y across all 8 scanned pages.

| Page | Total findings | Genuine issues | False positives |
|---|---|---|---|
| `/` (home) | 5 | 0 | 5 |
| `/about` | 1 | 0 | 1 |
| `/contact` | 2 | 0 | 2 |
| `/how-it-works` | 1 | 0 | 1 |
| `/pricing` | 6 | 0 | 6 |
| `/resources/science` | 2 | 0 | 2 |
| `/resources/compliance` | 1 | 0 | 1 |
| `/get-started` | 0 | 0 | 0 |
| **Totals** | **18** | **0** | **18** |

Every reported finding is the same tool false-positive on the `Button` component.

---

## The one false positive — explained

**Every** finding has this shape:

```
WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail
"This element has insufficient contrast at this conformance level. Expected a contrast
ratio of at least 4.5:1, but text in this element has a contrast ratio of 1:1
(or 1.38:1)."
context: <span class="btn-blob__text">…</span>
```

### Why it's not a real failure

`Button.tsx` renders its label and background as **sibling spans** stacked via CSS grid:

```tsx
<span className="btn-blob__inner">          {/* grid container */}
  <span className="btn-blob__bg" aria-hidden="true" />   {/* paints background */}
  <span className="btn-blob__text">Label</span>           {/* paints text */}
</span>
```

pa11y's `HTML_CodeSniffer` rule walks the DOM, finds the `.btn-blob__text` span, and asks "what is *this element's* background-color?". The span has no own background — its visual backdrop is a sibling element painted underneath via grid stacking. The tool reads the span's effective `background-color` as `transparent`, falls back to the body / parent (usually the same colour as the foreground in this design system, since both are `currentColor` or theme variables), and concludes 1:1.

**Measured live contrast on the same buttons** (Batch 3 verification probe, in [wcag-aaa-audit.md](./wcag-aaa-audit.md)):

| Theme | Button | Measured contrast |
|---|---|---|
| Light / brand-purple | Yellow CTA + dark text | **9.94 : 1** ✅ |
| brand-purple | Purple CTA + white text | **11.34 : 1** ✅ |
| brand-blue | Blue CTA + dark text | **5.75 : 1** ✅ |
| brand-green | Green CTA + dark text | **6.00 : 1** ✅ |
| brand-orange | Orange CTA + dark text | **4.79 : 1** ✅ |

All clear AA's 4.5:1 threshold. This is a **tooling artefact**, not a real-world contrast issue.

### Options for next time

If you want a clean pa11y report (no false-positive noise) the future-state options are:

1. **Refactor `Button`** so the visible background sits directly on the same element as the text (a single `<button>` with `background` + `color`). This is the cleanest fix and would also slightly simplify the component. The blob-animation effect would need a different mounting strategy (pseudo-element or absolute-positioned overlay).
2. **Add a pa11y ignore list** for the `WCAG2AA.Principle1.Guideline1_4.1_4_3.G18.Fail` rule, scoped to `.btn-blob__text`. This silences the noise but won't catch new real contrast bugs that happen to involve `.btn-blob__text` later.
3. **Switch to `axe-core` for automated runs** — axe handles this layered-span pattern correctly via its computed-style traversal (it walks up the parent chain looking for a real background).

Recommend option 1 (refactor) when the design system gets its next pass, or option 3 (axe) for the next CI integration.

---

## What pa11y did NOT find — and that's the actually-good news

The HTML_CodeSniffer ruleset checks ~50 distinct WCAG criteria. Across 8 page scans, zero failures were reported on any of:

- **1.1.1 Non-text Content** — alt text on images
- **1.3.1 Info and Relationships** — landmarks, headings, lists, form labels
- **1.3.5 Identify Input Purpose** — autocomplete attrs on personal-data fields (post-Batch G1)
- **2.4.1 Bypass Blocks** — skip link
- **2.4.2 Page Titled** — descriptive `<title>` per page
- **2.4.4 / 2.4.9 Link Purpose** — link text describes destination
- **2.4.6 Headings and Labels** — descriptive headings + labels
- **2.4.7 Focus Visible** — focus indicators present
- **3.3.2 Labels or Instructions** — form fields labelled
- **4.1.2 Name, Role, Value** — ARIA correctness
- **4.1.3 Status Messages** — live regions on dynamic content

Every other criterion pa11y can statically check came up clean. The work shipped in Batches 1–4 (public pages) and G1–G2 (checkout flow) holds up to automated review.

---

## Limitations of this scan

A few things pa11y can't or didn't check that the manual audits did cover:

- **Dynamic states** — modal dialogs, hover states, focus management, validation flows. pa11y scans the initial DOM only.
- **`prefers-reduced-motion`** — not measured (and it's AAA anyway, out of scope).
- **Keyboard interactions** — pa11y doesn't tab through the page or test ESC handlers.
- **Stripe iframe internals** — opaque to any external tool.
- **Gated pages** — `/get-started/details`, `/payment`, `/contract`, `/confirmation`, `/bespoke` all redirect without basket state. Need a scripted test that primes the basket store before pa11y visits each URL.
- **Dynamic Sanity content** — role pages and legal pages weren't sampled here.

---

## Conclusion

The automated AA scan is **clean** — every reported issue is a tool false-positive on the same Button component pattern. Combined with the manual audits and live contrast probes in [wcag-aaa-audit.md](./wcag-aaa-audit.md) and [wcag-aa-get-started.md](./wcag-aa-get-started.md), the site can credibly claim **WCAG 2.2 Level AA conformance** on the 8 pages scanned, pending:

- Real contrast values for the Button component (already measured separately — pass)
- A pass on the basket-gated checkout steps (covered by manual audit, pending an end-to-end automated run)
- The contract PDF asset compliance check (G3 — content task)
- Manual screen-reader spot-checks (recommended for any AA claim)

---

## How to re-run

```bash
# from project root
npm run dev   # in another terminal

# scan one URL
npx pa11y --standard WCAG2AA --timeout 60000 http://localhost:3000/

# scan all and save JSON
mkdir -p audit/pa11y-results
for p in / /about /contact /how-it-works /pricing /resources/science /resources/compliance /get-started; do
  name=$(echo "$p" | sed 's|/|_|g; s|^_||')
  [ -z "$name" ] && name=home
  npx pa11y --standard WCAG2AA --reporter json --timeout 90000 "http://localhost:3000$p" \
    > "audit/pa11y-results/$name.json" 2>/dev/null
done
```
