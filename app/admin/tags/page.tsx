// app/admin/tags/page.tsx

import { getAllTags } from '@/lib/queries'
import { TagsManager } from '@/components/admin/TagsManager'

export default async function AdminTagsPage() {
  const tags = await getAllTags()
  return <TagsManager initialTags={tags} />
}
