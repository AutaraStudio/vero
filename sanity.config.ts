'use client'

/**
 * Sanity Studio configuration. Studio is mounted at /admin/studio
 * via src/app/admin/studio/[[...tool]]/page.tsx.
 */

import {visionTool} from '@sanity/vision'
import {buildLegacyTheme, defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import PromoteAction from './src/sanity/actions/promoteAction'
import {backupsTool} from './src/sanity/tools/backupsTool'

/* ── Studio theme ─────────────────────────────────────────────
   Light Studio with Vero purple as the brand accent. buildLegacyTheme
   derives dark/light mode from the surface colours — keeping
   component-bg + gray-base near white forces light mode throughout. */
const veroStudioTheme = buildLegacyTheme({
  '--black':              '#1a1a20', // foreground / high-contrast text
  '--white':              '#ffffff',
  '--gray-base':          '#f5f5f7', // dominant chrome surface (light)
  '--gray':               '#9999a2', // mid-tone borders / muted text

  '--component-bg':         '#ffffff',
  '--component-text-color': '#1a1a20',

  '--brand-primary': '#472d6a', // purple-500
  '--focus-color':   '#472d6a',

  '--default-button-color':         '#e5e5ea',
  '--default-button-primary-color': '#472d6a',
  '--default-button-success-color': '#6fd08b',
  '--default-button-warning-color': '#fec601',
  '--default-button-danger-color':  '#f15f23',

  '--state-info-color':    '#21a4f4',
  '--state-success-color': '#6fd08b',
  '--state-warning-color': '#fec601',
  '--state-danger-color':  '#f15f23',

  '--main-navigation-color':           '#ffffff',
  '--main-navigation-color--inverted': '#1a1a20',
})

export default defineConfig({
  basePath: '/admin/studio',
  projectId,
  dataset,
  /* Brand chrome — see veroStudioTheme above. */
  theme: veroStudioTheme,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  /* Append "Push to Live Site" to every document's action menu. The
     action self-disables when the active dataset is production. */
  document: {
    actions: (prev) => [...prev, PromoteAction],
  },
  /* Custom tools surface in the top-right of the Studio next to the
     workspace switcher. The Backups tool only does anything in the
     staging dataset — backups are written there for safety. */
  tools: (prev) => [...prev, backupsTool],
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
