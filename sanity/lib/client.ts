// sanity/lib/client.ts
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Publiczny odczyt opublikowanych treści przez CDN Sanity
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
})

// Odczyt z draftami — tylko po stronie serwera (panel /admin)
export const draftsClient = client.withConfig({
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'raw',
})
