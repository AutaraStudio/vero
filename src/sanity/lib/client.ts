import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

/* Server-side client. Uses SANITY_API_TOKEN when present so that
   document types with restricted public-read permissions (e.g. new
   ones added after the dataset's public-access scope was set) are
   fetchable at build time. The token is server-only — never bundled
   into client JS — so it's safe to pass here.

   Falls back to anonymous read when no token is set (e.g. local dev
   without .env.local) so existing public-readable types still work. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
