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
  return getClient({ apiVersion }).fetch<boolean>(
    'defined(*[_type == $type && slug.current == $slug && locale == $locale && !(_id in [$id, $draft])][0]._id)',
    { type, slug, locale, id, draft: `drafts.${id}` }
  )
}
