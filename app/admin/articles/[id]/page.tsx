import { createAdminClient } from '@/lib/supabase/admin'
import { ArticleForm } from '@/components/admin/ArticleForm'
import { getAllTags } from '@/lib/queries'
import { notFound } from 'next/navigation'
import type { Article, Tag } from '@/types'

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

  const { data: articleTagRows } = await supabase
    .from('article_tags')
    .select('tag_id, tags(id, name, slug)')
    .eq('article_id', id)

  const tags = (articleTagRows ?? [])
    .map((r: any) => r.tags)
    .filter(Boolean) as Tag[]

  const article: Article = {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt ?? undefined,
    content: data.content,
    category: data.category,
    cover_image_url: data.cover_image_url ?? undefined,
    cover_focal_x: data.cover_focal_x ?? 0.5,
    cover_focal_y: data.cover_focal_y ?? 0.5,
    status: data.status,
    locale: data.locale ?? 'pl',
    translation_id: data.translation_id ?? null,
    published_at: data.published_at ?? undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
    tags,
  }

  const allTags = await getAllTags()
  return <ArticleForm article={article} allTags={allTags} />
}
