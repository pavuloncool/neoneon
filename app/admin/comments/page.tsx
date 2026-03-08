// app/admin/comments/page.tsx
import { getPendingComments } from '@/lib/queries'
import { formatDate } from '@/lib/utils'
import { ApproveCommentButton } from '@/components/admin/ApproveCommentButton'
import { DeleteCommentButton } from '@/components/admin/DeleteCommentButton'
import Link from 'next/link'

export default async function AdminCommentsPage() {
  const comments = await getPendingComments()
  return (
    <div className="p-10 max-w-4xl">
      <h1 className="font-display text-4xl font-light mb-10">Comments</h1>
      {comments.length === 0 ? (
        <p className="text-muted text-sm">No pending comments.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {comments.map((comment) => {
            const article = (comment as any).articles
            const articleUrl = article ? `/${article.category}/${article.slug}` : null
            return (
              <div key={comment.id} className="py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{comment.author_name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {articleUrl ? (
                        <Link href={articleUrl} className="italic hover:text-ink transition-colors">
                          {article.title}
                        </Link>
                      ) : null}
                      {' · '}
                      {formatDate(comment.created_at)}
                    </p>
                    <p className="text-sm text-ink mt-3 leading-relaxed">{comment.body}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <ApproveCommentButton commentId={comment.id} />
                    <DeleteCommentButton commentId={comment.id} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
