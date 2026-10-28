// lib/queries.ts
// Artykuły, tagi i komentarze → Sanity (GROQ).
// Projekcja GROQ zwraca ten sam kształt co dawne wiersze Supabase (typ Article),
// dzięki czemu strony i komponenty nie wymagają zmian.

import { cache } from 'react'
import { groq } from 'next-sanity'
import { draftsClient } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/fetch'
import { LINK_PROJECTION } from '@/lib/links'
import type { Article, Category, Tag, Comment, Page, SiteSettings } from '@/types'

const TAG_PROJECTION = groq`{ "id": _id, name, "name_en": nameEn, "slug": slug.current }`

const ARTICLE_PROJECTION = groq`{
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  content,
  category,
  "cover_image_url": coverImage.asset->url,
  "cover_focal_x": coverImage.hotspot.x,
  "cover_focal_y": coverImage.hotspot.y,
  "status": select(_id in path("drafts.**") => "draft", "published"),
  "published_at": publishedAt,
  "created_at": _createdAt,
  "updated_at": _updatedAt,
  "tags": tags[]->${TAG_PROJECTION},
  locale
}`

// ── Artykuły ────────────────────────────────────────────────

export async function getArticles(options?: {
  category?: Category
  tag?: string
  limit?: number
  locale?: 'pl' | 'en'
}): Promise<Article[]> {
  const filters = ['_type == "article"', 'locale == $locale']
  const params: Record<string, string> = { locale: options?.locale ?? 'pl' }
  if (options?.category) {
    filters.push('category == $category')
    params.category = options.category
  }
  if (options?.tag) {
    filters.push('references(*[_type == "tag" && slug.current == $tag]._id)')
    params.tag = options.tag
  }
  const slice = options?.limit ? `[0...${Math.floor(options.limit)}]` : ''

  try {
    return await sanityFetch<Article[]>(
      groq`*[${filters.join(' && ')}] | order(publishedAt desc) ${slice} ${ARTICLE_PROJECTION}`,
      params
    )
  } catch (error) {
    console.error('getArticles error:', error)
    return []
  }
}

export async function getArticleBySlug(
  slug: string,
  locale: 'pl' | 'en' = 'pl'
): Promise<Article | null> {
  return sanityFetch<Article | null>(
    groq`*[_type == "article" && slug.current == $slug && locale == $locale][0] ${ARTICLE_PROJECTION}`,
    { slug, locale }
  )
}

export async function searchArticles(
  query: string,
  locale: 'pl' | 'en' = 'pl'
): Promise<Article[]> {
  // `match` dopasowuje prefiksy słów — dla każdego słowa zapytania osobny warunek (AND)
  const terms = query.trim().split(/\s+/).filter(Boolean).map((t) => `${t}*`)
  if (terms.length === 0) return []
  const conditions = terms.map((_, i) => `[title, excerpt, pt::text(content)] match $t${i}`).join(' && ')
  const params = Object.fromEntries(terms.map((t, i) => [`t${i}`, t]))

  try {
    return await sanityFetch<Article[]>(
      groq`*[_type == "article" && locale == $locale && ${conditions}] | order(publishedAt desc) ${ARTICLE_PROJECTION}`,
      { locale, ...params }
    )
  } catch (error) {
    console.error('searchArticles error:', error)
    return []
  }
}

// Wersja artykułu w drugim języku — powiązanie przez dokument translation.metadata
export async function getArticleTranslation(
  articleId: string,
  targetLocale: 'pl' | 'en'
): Promise<Article | null> {
  return sanityFetch<Article | null>(
    groq`*[_type == "article" && locale == $targetLocale && _id in *[_type == "translation.metadata" && references($articleId)].translations[].value._ref][0] ${ARTICLE_PROJECTION}`,
    { articleId, targetLocale }
  )
}

// ── Tagi ─────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  return sanityFetch<Tag[]>(groq`*[_type == "tag"] | order(name asc) ${TAG_PROJECTION}`)
}

export async function getTagsByCategory(category: string): Promise<Tag[]> {
  return sanityFetch<Tag[]>(
    groq`*[_type == "tag" && count(*[_type == "article" && category == $category && references(^._id)]) > 0] | order(name asc) ${TAG_PROJECTION}`,
    { category }
  )
}

// ── Komentarze ───────────────────────────────────────────────

// Tylko zatwierdzone w Studio. Komentarze są szkicami, więc czytamy je tokenem;
// e-mail autora nie trafia do projekcji.
export async function getCommentsByArticle(articleId: string): Promise<Comment[]> {
  return draftsClient.fetch<Comment[]>(
    groq`*[_type == "comment" && article._ref == $articleId && approved == true] | order(submittedAt asc) {
      "id": _id,
      "article_id": article._ref,
      "author_name": authorName,
      body,
      "approved": true,
      "created_at": submittedAt
    }`,
    { articleId }
  )
}

// ── Treść strony: ustawienia, strony z sekcji, teksty interfejsu ──────────

const IMAGE_PROJECTION = groq`{ "url": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, hotspot }`
const NAV_PROJECTION = groq`{ label, "link": link${LINK_PROJECTION} }`

// cache(): layout, metadane i strona w jednym żądaniu dzielą jedno zapytanie
export const getSiteSettings = cache(async (locale: 'pl' | 'en'): Promise<SiteSettings | null> =>
  sanityFetch<SiteSettings | null>(
    groq`*[_type == "siteSettings" && locale == $locale][0]{
      siteTitle, titleTemplate, description,
      "ogImage": ogImage${IMAGE_PROJECTION},
      "logoLight": logoLight${IMAGE_PROJECTION},
      "logoDark": logoDark${IMAGE_PROJECTION},
      logoAlt,
      "navigation": navigation[]${NAV_PROJECTION},
      footerText,
      "footerLinks": footerLinks[]${NAV_PROJECTION},
      a11y
    }`,
    { locale }
  )
)

const PAGE_PROJECTION = groq`{
  "id": _id, title, "slug": slug.current, isHome, width,
  "seo": seo{ title, description, "image": image${IMAGE_PROJECTION} },
  "sections": sections[]{
    ...,
    _type == "textImage" => { "image": image${IMAGE_PROJECTION}, "ctaLink": ctaLink${LINK_PROJECTION} }
  }
}`

export const getHomePage = cache(async (locale: 'pl' | 'en'): Promise<Page | null> =>
  sanityFetch<Page | null>(groq`*[_type == "page" && isHome == true && locale == $locale][0]${PAGE_PROJECTION}`, { locale })
)

export const getPage = cache(async (locale: 'pl' | 'en', slug: string): Promise<Page | null> =>
  sanityFetch<Page | null>(
    groq`*[_type == "page" && isHome != true && slug.current == $slug && locale == $locale][0]${PAGE_PROJECTION}`,
    { locale, slug }
  )
)

// Teksty interfejsu — nakładane na messages/*.json w i18n/request.ts
export const getUiStrings = cache(async (locale: string): Promise<Record<string, Record<string, string>> | null> =>
  sanityFetch<Record<string, Record<string, string>> | null>(
    groq`*[_type == "uiStrings" && locale == $locale][0]`,
    { locale }
  )
)
