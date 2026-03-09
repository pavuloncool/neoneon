// lib/queries.ts
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Article, Category, Tag, Comment } from '@/types'

// ── Artykuły ────────────────────────────────────────────────

export async function getArticles(options?: {
  category?: Category
  tag?: string
  limit?: number
  locale?: 'pl' | 'en'
}): Promise<Article[]> {
  const supabase = await createClient()

  if (options?.tag) {
    const { data: tagData } = await supabase
      .from('tags')
      .select('id')
      .eq('slug', options.tag)
      .single()

    if (!tagData) return []

    const { data: articleIds } = await supabase
      .from('article_tags')
      .select('article_id')
      .eq('tag_id', (tagData as any).id)

    if (!articleIds || articleIds.length === 0) return []

    let query = supabase
      .from('articles')
      .select(`*, tags:article_tags(tag:tags(*))`)
      .eq('status', 'published')
      .eq('locale', options?.locale ?? 'pl')
      .in('id', (articleIds as any[]).map((r) => r.article_id))
      .order('published_at', { ascending: false })

    if (options?.category) query = query.eq('category', options.category)
    if (options?.limit) query = query.limit(options.limit)

    const { data, error } = await query
    if (error) { console.error('getArticles error:', error); return [] }
    return (data ?? []).map(flattenTags)
  }

  let query = supabase
    .from('articles')
    .select(`*, tags:article_tags(tag:tags(*))`)
    .eq('status', 'published')
    .eq('locale', options?.locale ?? 'pl')
    .order('published_at', { ascending: false })

  if (options?.category) query = query.eq('category', options.category)
  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) { console.error('getArticles error:', error); return [] }
  return (data ?? []).map(flattenTags)
}

export async function getArticleBySlug(
  slug: string,
  locale: 'pl' | 'en' = 'pl'
): Promise<Article | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(`*, tags:article_tags(tag:tags(*))`)
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('locale', locale)
    .single()
  if (error || !data) return null
  return flattenTags(data)
}

export async function searchArticles(
  query: string,
  locale: 'pl' | 'en' = 'pl'
): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(`*, tags:article_tags(tag:tags(*))`)
    .eq('status', 'published')
    .eq('locale', locale)
    .textSearch('fts', query, { type: 'websearch' })
    .order('published_at', { ascending: false })
  if (error) { console.error('searchArticles error:', error); return [] }
  return (data ?? []).map(flattenTags)
}

export async function getArticleTranslation(
  translationId: string,
  targetLocale: 'pl' | 'en'
): Promise<Article | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(`*, tags:article_tags(tag:tags(*))`)
    .eq('translation_id', translationId)
    .eq('locale', targetLocale)
    .eq('status', 'published')
    .single()
  if (error || !data) return null
  return flattenTags(data)
}

// ── Tagi ─────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tags')
    .select('*, articles(title, category, slug)')
    .order('name')
  return data ?? []
}

export async function getTagsByCategory(category: string): Promise<Tag[]> {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('id')
    .eq('category', category)
    .eq('status', 'published')

  if (!articles || articles.length === 0) return []

  const articleIds = (articles as any[]).map((a) => a.id)

  const { data: articleTags } = await supabase
    .from('article_tags')
    .select('tag_id')
    .in('article_id', articleIds)

  if (!articleTags || articleTags.length === 0) return []

  const tagIds = [...new Set((articleTags as any[]).map((at) => at.tag_id))]

  const { data: tags } = await supabase
    .from('tags')
    .select('id, name, slug')
    .in('id', tagIds)
    .order('name')

  return tags ?? []
}

// ── Komentarze ───────────────────────────────────────────────

export async function getCommentsByArticle(articleId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('*, articles(title, category, slug)')
    .eq('article_id', articleId)
    .eq('approved', true)
    .order('created_at', { ascending: true })
  return data ?? []
}

// ── Admin ─────────────────────────────────────────────────────

export async function getAdminArticles(): Promise<Article[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('articles')
    .select(`*, tags:article_tags(tag:tags(*))`)
    .order('created_at', { ascending: false })
  return (data ?? []).map(flattenTags)
}

export async function getPendingComments(): Promise<Comment[]> {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('comments')
    .select('*, articles(title, category, slug)')
    .eq('approved', false)
    .order('created_at', { ascending: true })
  return data ?? []
}

// ── Helper ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenTags(article: any): Article {
  return {
    ...article,
    tags: (article.tags ?? []).map((t: { tag: Tag }) => t.tag),
  }
}
