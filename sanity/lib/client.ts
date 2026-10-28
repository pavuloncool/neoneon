// sanity/lib/client.ts
// Tylko po stronie serwera — dataset jest prywatny, więc każdy odczyt wymaga tokena.
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Odczyt opublikowanych treści przez CDN Sanity (token Viewer)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  token: process.env.SANITY_API_READ_TOKEN,
})

// Zapis z formularzy — token Contributor może tworzyć wyłącznie szkice (drafts.*)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})
