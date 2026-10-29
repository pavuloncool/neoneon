import type { MetadataRoute } from 'next'
import { getSitemapData } from '@/lib/queries'
import { localeUrl, type Locale } from '@/lib/site'

// Odświeżana co godzinę — nowe artykuły trafiają do sitemapy bez ponownego wdrożenia
export const revalidate = 3600

type Doc = { _id: string; locale: Locale; path: string; _updatedAt: string }

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
      lastModified: d._updatedAt,
      alternates: { languages: Object.fromEntries(group.map((g) => [g.locale, localeUrl(g.locale, g.path)])) },
    }
  })

  // Strony kategorii — tylko te, w których są artykuły; ta sama ścieżka w obu językach
  const categories = [...new Set(articles.map((a) => a.category))]
  for (const category of categories) {
    for (const locale of ['pl', 'en'] as const) {
      entries.push({
        url: localeUrl(locale, `/${category}`),
        alternates: { languages: { pl: localeUrl('pl', `/${category}`), en: localeUrl('en', `/${category}`) } },
      })
    }
  }

  return entries
}
