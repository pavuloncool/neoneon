// app/admin/articles/[id]/page.tsx

import { createAdminClient } from '@/lib/supabase/server'
import { getAllTags } from '@/lib/queries'
import { ArticleForm } from '@/components/admin/ArticleForm'
import { notFound } from 'next/navigation'
import type { Article, Tag } from '@/types'

interface EditArticlePageProps {
  params: Promise<{ id: string }>
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params
  const supabase = await createAdminClient()

  const { data: articleRow } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (!articleRow) notFound()

  const { data: tagRows } = await supabase
    .from('article_tags')
    .select('tag_id, tags(id, name, slug)')
    .eq('article_id', id)

  const tags: Tag[] = (tagRows ?? [])
    .map((row: { tag_id: string; tags: Tag | Tag[] | null }) => {
      const t = Array.isArray(row.tags) ? row.tags[0] : row.tags
      return t ?? null
    })
    .filter(Boolean) as Tag[]

  const article: Article = { ...articleRow, tags }
  const allTags = await getAllTags()

  return <ArticleForm article={article} allTags={allTags} />
}
