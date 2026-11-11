// sanity/slugConflicts.ts
// Strony (page) i kategorie (category) dzielą adresy pierwszego poziomu: /{locale}/{slug}.
// Walidacja w Studio pilnuje, żeby w jednym języku slug nie powtórzył się w żadnym z tych typów.

import type { SanityClient } from 'sanity'
import { apiVersion } from './env'

type GetClient = (options: { apiVersion: string }) => SanityClient

// Czy inny dokument danego typu (opublikowany albo szkic) w tym języku ma już ten slug
export async function slugTaken(
  getClient: GetClient,
  type: 'page' | 'category',
  slug: string,
  locale: string,
  documentId: string | undefined
): Promise<boolean> {
  const id = (documentId ?? '').replace(/^drafts\./, '')
  // Perspektywa raw: widać też szkice (domyślna perspektywa API 2025-02-19 to „published”).
  // Wersje z wydań (versions.*) pomijane — projekt ich nie używa, a raw pokazałby też własną wersję dokumentu.
  return getClient({ apiVersion })
    .withConfig({ perspective: 'raw' })
    .fetch<boolean>(
      'defined(*[_type == $type && slug.current == $slug && locale == $locale && !(_id in [$id, $draft]) && !(_id in path("versions.**"))][0]._id)',
      { type, slug, locale, id, draft: `drafts.${id}` }
    )
}

// Slug opublikowanej wersji dokumentu (null = dokument jeszcze nieopublikowany).
// Perspektywa raw: zapytanie po dokładnym _id wersji opublikowanej, niezależnie od domyślnej perspektywy API.
export async function publishedSlug(getClient: GetClient, documentId: string | undefined): Promise<string | null> {
  const id = (documentId ?? '').replace(/^(drafts|versions\.[^.]+)\./, '')
  if (!id) return null
  return getClient({ apiVersion })
    .withConfig({ perspective: 'raw' })
    .fetch<string | null>('*[_id == $id][0].slug.current', { id })
}
