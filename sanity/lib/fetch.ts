// sanity/lib/fetch.ts
// Pobieranie treści z obsługą podglądu (Presentation Tool w Studio).
// W trybie podglądu (Draft Mode, włączany tylko z Studio) — szkice + stega do klikalnej edycji;
// poza nim — opublikowane treści z CDN, bez zmian. Token nigdy nie trafia do przeglądarki.

import { draftMode } from 'next/headers'
import type { QueryParams } from 'next-sanity'
import { client } from './client'

// Pola, które w podglądzie dostają niewidoczne znaczniki edycji (stega).
// Slugi, kategorie, języki, ID i daty muszą zostać czyste — od nich zależą adresy i logika stron.
const EDITABLE_FIELDS = new Set(['title', 'excerpt', 'name', 'nameEn'])

const previewClient = client.withConfig({
  useCdn: false,
  perspective: 'drafts',
  token: process.env.SANITY_API_READ_TOKEN,
  stega: {
    enabled: true,
    studioUrl: '/studio',
    filter: (props) => {
      if (props.sourcePath[0] === 'content') return props.filterDefault(props)
      return EDITABLE_FIELDS.has(String(props.sourcePath.at(-1)))
    },
  },
})

export async function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  const { isEnabled } = await draftMode()
  return (isEnabled ? previewClient : client).fetch<T>(query, params)
}
