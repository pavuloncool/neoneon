// sanity/lib/client.ts
// Tylko po stronie serwera. Dataset jest publiczny (plan Free), ale komentarze i wiadomości
// zostają szkicami (drafts.*), które bez tokena są niedostępne.
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Tylko lokalne testy (symulacja danych bez zapisu do Sanity, np. etap 6 — higiena/sanity-mock.mjs):
// inny adres API dla odczytu treści. Na Vercel (każde środowisko) ignorowane.
const testApiHost = process.env.VERCEL ? undefined : process.env.SANITY_API_HOST

// Odczyt opublikowanych treści przez CDN Sanity (token Viewer)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  token: process.env.SANITY_API_READ_TOKEN,
  ...(testApiHost ? { apiHost: testApiHost, useCdn: false } : {}),
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
