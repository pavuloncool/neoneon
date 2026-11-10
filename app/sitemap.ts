import type { MetadataRoute } from 'next'
import { getSitemapData } from '@/lib/queries'
import { localeUrl } from '@/lib/site'
import type { Locale } from '@/lib/locales'

// Odświeżana co godzinę — nowe artykuły trafiają do sitemapy bez ponownego wdrożenia
export const revalidate = 3600

type Doc = { _id: string; locale: Locale; path: string; modifiedAt: string | null }

// Jak w lib/metadata.ts: x-default wskazuje wersję PL, jeśli istnieje
function withDefault(languages: Partial<Record<Locale, string>>): Record<string, string> {
  return languages.pl ? { ...languages, 'x-default': languages.pl } : (languages as Record<string, string>)
}

// Późniejsza z dwóch dat ISO (różne formaty strefy, więc porównanie przez Date.parse)
function newer(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return Date.parse(b) > Date.parse(a) ? b : a
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages, articles, translations } = await getSitemapData()

  const docs: Doc[] = [
    ...pages.flatMap((p) => (p.isHome || p.slug ? [{ ...p, path: p.isHome ? '' : `/${p.slug}` }] : [])),
    ...articles.map((a) => ({ ...a, path: `/${a.category}/${a.slug}` })),
  ]
  const byId = new Map(docs.map((d) => [d._id, d]))

  // Dokument → jego wersje językowe (z translation.metadata)
  const groupOf = new Map<string, Doc[]>()
  for (const { refs } of translations) {
    const group = (refs ?? []).flatMap((id) => byId.get(id) ?? [])
    for (const d of group) groupOf.set(d._id, group)
  }

  const entries: MetadataRoute.Sitemap = docs.map((d) => {
    const group = groupOf.get(d._id) ?? [d]
    return {
      url: localeUrl(d.locale, d.path),
      lastModified: d.modifiedAt ?? undefined,
      alternates: { languages: withDefault(Object.fromEntries(group.map((g) => [g.locale, localeUrl(g.locale, g.path)]))) },
    }
  })

  // Strony kategorii: tylko w językach, w których kategoria ma artykuły.
  // lastmod = najnowsza data modyfikacji artykułu tej kategorii w danym języku.
  const byCategory = new Map<string, Map<Locale, string | null>>()
  for (const a of articles) {
    const locales = byCategory.get(a.category) ?? new Map<Locale, string | null>()
    byCategory.set(a.category, locales)
    const current = locales.get(a.locale) ?? null
    locales.set(a.locale, newer(current, a.modifiedAt))
  }
  for (const [category, locales] of byCategory) {
    const languages = withDefault(Object.fromEntries([...locales.keys()].map((l) => [l, localeUrl(l, `/${category}`)])))
    for (const [locale, modifiedAt] of locales) {
      entries.push({ url: localeUrl(locale, `/${category}`), lastModified: modifiedAt ?? undefined, alternates: { languages } })
    }
  }

  return entries
}
