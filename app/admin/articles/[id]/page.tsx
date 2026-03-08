import { createAdminClient } from '@/lib/supabase/admin'
import { ArticleForm } from '@/components/admin/ArticleForm'
import { getAllTags } from '@/lib/queries'
import { notFound } from 'next/navigation'
import type { Article, ArticleRow, Tag } from '@/types'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createAdminClient()

  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const articleRow = data as ArticleRow

  const { data: articleTagRows } = await supabase
    .from('article_tags')
    .select('tag_id, tags(id, name, slug)')
    .eq('article_id', id)

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
