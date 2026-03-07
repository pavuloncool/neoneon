// app/admin/articles/new/page.tsx

import { getAllTags } from '@/lib/queries'
import { ArticleForm } from '@/components/admin/ArticleForm'

export default async function NewArticlePage() {
  const allTags = await getAllTags()

  return <ArticleForm allTags={allTags} />
}
