// lib/queries.ts
// Artykuły i tagi → Sanity (GROQ). Komentarze → Supabase.
// Projekcja GROQ zwraca ten sam kształt co dawne wiersze Supabase (typ Article),
// dzięki czemu strony i komponenty nie wymagają zmian.

import { groq } from 'next-sanity'
import { client, draftsClient } from '@/sanity/lib/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'
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
  locale,
  "translation_id": translationId
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

export async function getArticleTranslation(
  translationId: string,
  targetLocale: 'pl' | 'en'
): Promise<Article | null> {
  return client.fetch<Article | null>(
    groq`*[_type == "article" && translationId == $translationId && locale == $targetLocale][0] ${ARTICLE_PROJECTION}`,
    { translationId, targetLocale }
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

// ── Komentarze (Supabase) ────────────────────────────────────

export async function getCommentsByArticle(articleId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .eq('approved', true)
    .order('created_at', { ascending: true })
  return data ?? []
}

// ── Admin ─────────────────────────────────────────────────────

// Wszystkie artykuły łącznie z draftami (token Viewer). Draft opublikowanego
// artykułu pomijamy, żeby nie liczyć go podwójnie.
export async function getAdminArticles(): Promise<Article[]> {
  const all = await draftsClient.fetch<Article[]>(
    groq`*[_type == "article"] | order(_createdAt desc) ${ARTICLE_PROJECTION}`
  )
  const publishedIds = new Set(all.filter((a) => a.status === 'published').map((a) => a.id))
  return all.filter((a) => a.status === 'published' || !publishedIds.has(a.id.replace(/^drafts\./, '')))
}

export type PendingComment = Comment & {
  articles: Pick<Article, 'title' | 'category' | 'slug'> | null
}

export async function getPendingComments(): Promise<PendingComment[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('comments')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: true })
  const comments = (data ?? []) as Comment[]
  if (comments.length === 0) return []

  const ids = [...new Set(comments.map((c) => c.article_id))]
  const articles = await client.fetch<{ id: string; title: string; category: Category; slug: string }[]>(
    groq`*[_type == "article" && _id in $ids]{ "id": _id, title, category, "slug": slug.current }`,
    { ids }
  )
  const byId = new Map(articles.map((a) => [a.id, a]))
  return comments.map((c) => ({ ...c, articles: byId.get(c.article_id) ?? null }))
}
