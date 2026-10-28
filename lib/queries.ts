// lib/queries.ts
// Artykuły, tagi i komentarze → Sanity (GROQ).
// Projekcja GROQ zwraca ten sam kształt co dawne wiersze Supabase (typ Article),
// dzięki czemu strony i komponenty nie wymagają zmian.

import { groq } from 'next-sanity'
import { client } from '@/sanity/lib/client'
import type { Article, Category, Tag, Comment } from '@/types'

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
    return await client.fetch<Article[]>(
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
  return client.fetch<Article | null>(
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
    return await client.fetch<Article[]>(
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
  return client.fetch<Article | null>(
    groq`*[_type == "article" && locale == $targetLocale && _id in *[_type == "translation.metadata" && references($articleId)].translations[].value._ref][0] ${ARTICLE_PROJECTION}`,
    { articleId, targetLocale }
  )
}

// ── Tagi ─────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  return client.fetch<Tag[]>(groq`*[_type == "tag"] | order(name asc) ${TAG_PROJECTION}`)
}

export async function getTagsByCategory(category: string): Promise<Tag[]> {
  return client.fetch<Tag[]>(
    groq`*[_type == "tag" && count(*[_type == "article" && category == $category && references(^._id)]) > 0] | order(name asc) ${TAG_PROJECTION}`,
    { category }
  )
}

// ── Komentarze ───────────────────────────────────────────────

// Tylko opublikowane (= zatwierdzone w Studio). E-mail autora nie trafia na stronę.
export async function getCommentsByArticle(articleId: string): Promise<Comment[]> {
  return client.fetch<Comment[]>(
    groq`*[_type == "comment" && article._ref == $articleId] | order(submittedAt asc) {
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
