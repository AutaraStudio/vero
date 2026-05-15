/**
 * One-shot: prepend `hidden: true,` to each legacy section field on every
 * page schema, and to the unused contentSection target on the three
 * sections we kept on their custom rendering (science Dimensions,
 * compliance Security, jobCategory Bespoke).
 *
 * Effect: editors only see the relevant shape per section in Studio —
 * no more both-side-by-side confusion. Underlying data is untouched.
 *
 *   node scripts/hide-legacy-section-fields.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const TARGETS = [
  // file → field names whose defineField should get hidden: true
  ['src/sanity/schemaTypes/homePage.ts', [
    'introBlockEyebrow',
    'introBlockHeading',
    'introBlockBody',
    'introBlockCtaLabel',
    'introBlockCtaHref',
    'introBlockMedia',
  ]],
  ['src/sanity/schemaTypes/aboutPage.ts', [
    'tazioEvolutionHeading',
    'tazioEvolutionBody',
    'tazioEvolutionMedia',
    'tazioEvolutionCTALabel',
    'tazioEvolutionCTAHref',
    'candidateExperiencesHeading',
    'candidateExperiencesBody',
    'candidateExperiencesMedia',
  ]],
  ['src/sanity/schemaTypes/howItWorksPage.ts', [
    'gettingStartedHeading',
    'gettingStartedBody',
    'gettingStartedMedia',
    'gettingStartedLinkLabel',
    'gettingStartedLinkHref',
    'candidateExpHeading',
    'candidateExpBody',
    'candidateExpMedia',
  ]],
  ['src/sanity/schemaTypes/sciencePage.ts', [
    'authenticHeading',
    'authenticBody',
    'insightsHeading',
    'insightsBody',
    'insightsMedia',
    // unused new field — Dimensions still uses legacy fields
    'dimensionsSectionContent',
  ]],
  ['src/sanity/schemaTypes/compliancePage.ts', [
    'aiHeading',
    'aiBody',
    'aiMedia',
    // unused new field — Security still uses legacy fields
    'securitySection',
  ]],
  ['src/sanity/schemaTypes/jobCategory.ts', [
    'dimensionsSectionHeading',
    'dimensionsSectionBody',
    'dimensionsSectionMedia',
    // unused new field — Bespoke still uses legacy fields
    'bespokeSectionContent',
  ]],
];

let total = 0;

for (const [file, fields] of TARGETS) {
  let src = readFileSync(file, 'utf8');
  let changedInFile = 0;
  for (const name of fields) {
    const needle = `      name: '${name}',`;
    /* Only act if not already hidden — keeps the script idempotent. */
    const re = new RegExp(`(\\n)(      hidden: true,\\n)?      name: '${name}',`);
    const m = src.match(re);
    if (!m) {
      console.warn(`  !! ${file}: field "${name}" not found`);
      continue;
    }
    if (m[2]) {
      // already hidden
      continue;
    }
    src = src.replace(needle, `      hidden: true,\n${needle}`);
    changedInFile += 1;
  }
  if (changedInFile > 0) {
    writeFileSync(file, src);
    console.log(`✓ ${file}: ${changedInFile} field(s) hidden`);
    total += changedInFile;
  } else {
    console.log(`-- ${file}: nothing to do`);
  }
}

console.log(`\nDone. ${total} field(s) hidden across ${TARGETS.length} schema files.`);
