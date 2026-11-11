// lib/categoryRoute.ts
// Rozwiązanie adresu /{locale}/{slug} na kategorię (trasa [...segments]):
// dokument `category` w Sanity (z tłumaczeniem do hreflang); brak = to nie kategoria
// (trasa sprawdza dalej stronę z page buildera).

import { getCategory, getCategoryTranslation } from '@/lib/queries'
import { otherLocale, type Locale } from '@/lib/locales'

export interface ResolvedCategory {
  slug: string
  title: string
  // Tytuł i opis do metadanych (puste = brak, jak dotąd na stronach kategorii)
  seoTitle: string
  seoDescription: string | null
  // Slug odpowiednika w drugim języku; null = brak tłumaczenia (bez hreflang)
  altSlug: string | null
}

export async function resolveCategory(locale: Locale, slug: string): Promise<ResolvedCategory | null> {
  const doc = await getCategory(locale, slug)
  if (doc) {
    const translation = await getCategoryTranslation(doc.id, otherLocale(locale))
    return {
      slug: doc.slug,
      title: doc.title,
      seoTitle: doc.seo_title?.trim() || doc.title,
      seoDescription: doc.seo_description?.trim() || doc.description?.trim() || null,
      altSlug: translation?.slug ?? null,
    }
  }

  return null
}
