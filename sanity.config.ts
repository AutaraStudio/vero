'use client'

/**
 * Sanity Studio configuration. Studio is mounted at /admin/studio
 * via src/app/admin/studio/[[...tool]]/page.tsx.
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import PromoteAction from './src/sanity/actions/promoteAction'

export default defineConfig({
  basePath: '/admin/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  /* Append "Push to Live Site" to every document's action menu. The
     action self-disables when the active dataset is production. */
  document: {
    actions: (prev) => [...prev, PromoteAction],
  },
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
