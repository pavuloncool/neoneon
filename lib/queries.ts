// lib/queries.ts
// Wszystkie zapytania do Supabase — używane w Server Components

import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Article, Category, Tag, Comment } from '@/types'

// ── Artykuły ────────────────────────────────────────────────

export async function getArticles(options?: {
  category?: Category
  tag?: string
  limit?: number
}): Promise<Article[]> {
  const supabase = await createClient()

  let query = supabase
    .from('articles')
    .select(`
      *,
      tags:article_tags(tag:tags(*))
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('getArticles error:', error)
    return []
  }

  // Spłaszcz zagnieżdżone tagi
  return (data ?? []).map(flattenTags)
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      tags:article_tags(tag:tags(*))
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) return null

  return flattenTags(data)
}

export async function searchArticles(query: string): Promise<Article[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      tags:article_tags(tag:tags(*))
    `)
    .eq('status', 'published')
    .textSearch('fts', query, { type: 'websearch' })
    .order('published_at', { ascending: false })

  if (error) {
    console.error('searchArticles error:', error)
    return []
  }

  return (data ?? []).map(flattenTags)
}

// ── Tagi ─────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  return data ?? []
}

// ── Komentarze ───────────────────────────────────────────────

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
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: true })

  return data ?? []
}

// ── Helper ───────────────────────────────────────────────────

// Supabase zwraca tagi jako [{ tag: { id, name, slug } }]
// Spłaszczamy do [{ id, name, slug }]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenTags(article: any): Article {
  return {
    ...article,
    tags: (article.tags ?? []).map((t: { tag: Tag }) => t.tag),
  }
}
