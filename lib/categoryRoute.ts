// lib/categoryRoute.ts
// Rozwiązanie adresu /{locale}/{slug} na kategorię (trasa [...segments]):
// 1) dokument `category` w Sanity (z tłumaczeniem do hreflang),
// 2) okres przejściowy — dotychczasowa lista z kodu (lib/categories.ts, nazwy z tekstów interfejsu),
// 3) brak = to nie kategoria (trasa sprawdza dalej stronę z page buildera).

import { getTranslations } from 'next-intl/server'
import { getCategory, getCategoryTranslation } from '@/lib/queries'
import { legacyCategory } from '@/lib/categories'
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

  const legacy = legacyCategory(slug)
  if (legacy) {
    // Jak dotąd: nazwa z tekstów interfejsu (uiStrings → messages), ten sam adres w obu językach
    const t = await getTranslations({ locale, namespace: 'nav' })
    const title = t(legacy.messageKey)
    return { slug: legacy.value, title, seoTitle: title, seoDescription: null, altSlug: legacy.value }
  }

  return null
}
