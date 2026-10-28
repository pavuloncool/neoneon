// sanity/lib/client.ts
// Tylko po stronie serwera. Dataset jest publiczny (plan Free), ale komentarze i wiadomości
// zostają szkicami (drafts.*), które bez tokena są niedostępne.
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

// Szkice komentarzy (token Viewer) — tylko po stronie serwera, bez e-maili w projekcji
export const draftsClient = client.withConfig({ perspective: 'raw' })

// Zapis z formularzy (token Editor) — formularze tworzą wyłącznie szkice (drafts.*)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})
