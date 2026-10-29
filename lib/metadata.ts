// lib/metadata.ts
// Metadane SEO: tytuł, opis, canonical, hreflang PL↔EN i Open Graph.
// openGraph jest zawsze kompletny (url, język, obrazek) — Next scala go z layoutem płytko,
// więc niepełny obiekt zgubiłby wartości domyślne. og:title i og:description Next uzupełnia sam z title/description.

import type { Metadata } from 'next'
import { getPageTranslation, getSiteSettings } from '@/lib/queries'
import { OG_LOCALE, SITE_NAME, localeUrl, otherLocale, type Locale } from '@/lib/site'
import type { Page, SanityImage } from '@/types'

interface SeoInput {
  locale: Locale
  path: string
  // Ścieżka odpowiednika w drugim języku; null = brak tłumaczenia (bez hreflang)
  altPath: string | null
  title?: string | null
  description?: string | null
  image?: Pick<SanityImage, 'url' | 'width' | 'height' | 'alt'> | null
  // Tytuł bez szablonu „%s | neoneon” (strona główna ma markę w tytule)
  absoluteTitle?: boolean
  article?: { publishedTime?: string | null; modifiedTime?: string | null }
}

export async function seoMetadata({ locale, path, altPath, title, description, image, absoluteTitle, article }: SeoInput): Promise<Metadata> {
  const settings = await getSiteSettings(locale)
  const other = otherLocale(locale)
  const url = localeUrl(locale, path)
  const languages: Record<string, string> = { [locale]: url }
  if (altPath !== null) languages[other] = localeUrl(other, altPath)
  if (languages.pl) languages['x-default'] = languages.pl

  const img = image?.url ? image : settings?.ogImage
  const common = {
    url,
    siteName: SITE_NAME,
    locale: OG_LOCALE[locale],
    ...(altPath !== null ? { alternateLocale: OG_LOCALE[other] } : {}),
    ...(img?.url
      ? { images: [{ url: img.url, width: img.width ?? undefined, height: img.height ?? undefined, alt: img.alt ?? settings?.logoAlt ?? SITE_NAME }] }
      : {}),
  }

  return {
    ...(title ? { title: absoluteTitle ? { absolute: title } : title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: url, languages },
    openGraph: article
      ? { ...common, type: 'article', publishedTime: article.publishedTime ?? undefined, modifiedTime: article.modifiedTime ?? undefined }
      : { ...common, type: 'website' },
  }
}

// Strony z page buildera — odpowiednik językowy przez translation.metadata
export async function pageMetadata(page: Page | null, locale: Locale): Promise<Metadata> {
  if (!page) return {}
  const translation = await getPageTranslation(page.id, otherLocale(locale))
  const altPath = !translation ? null : translation.isHome ? '' : translation.slug ? `/${translation.slug}` : null
  return seoMetadata({
    locale,
    path: page.isHome ? '' : `/${page.slug}`,
    altPath,
    // Bez tytułu SEO podstrona dostaje swój tytuł; strona główna — tytuł domyślny z ustawień
    title: page.seo?.title ?? (page.isHome ? null : page.title),
    description: page.seo?.description,
    image: page.seo?.image,
    absoluteTitle: !!page.isHome,
  })
}
