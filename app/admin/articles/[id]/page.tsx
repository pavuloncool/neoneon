import { createAdminClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/ArticleForm'
import { getAllTags } from '@/lib/queries'
import { notFound } from 'next/navigation'
import type { Article, Tag } from '@/types'

export default async function EditArticlePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createAdminClient()

  const { data: articleRow } = await supabase
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!articleRow) notFound()

  const { data: articleTagRows } = await supabase
    .from('article_tags')
    .select('tag_id, tags(id, name, slug)')
    .eq('article_id', params.id)

  const tags = (articleTagRows ?? [])
    .map((r: any) => r.tags)
    .filter(Boolean) as Tag[]

  const article: Article = {
    id: articleRow.id,
    slug: articleRow.slug,
    title: articleRow.title,
    excerpt: articleRow.excerpt ?? undefined,
    content: articleRow.content,
    category: articleRow.category,
    cover_image_url: articleRow.cover_image_url ?? undefined,
    status: articleRow.status,
    published_at: articleRow.published_at ?? undefined,
    created_at: articleRow.created_at,
    updated_at: articleRow.updated_at,
    tags,
  }

  const allTags = await getAllTags()

  return <ArticleForm article={article} allTags={allTags} />
}
