// app/admin/comments/page.tsx

import { getPendingComments } from '@/lib/queries'
import { formatDate } from '@/lib/utils'
import { ApproveCommentButton } from '@/components/admin/ApproveCommentButton'

export default async function AdminCommentsPage() {
  const comments = await getPendingComments()

  return (
    <div className="p-10 max-w-4xl">
      <h1 className="font-display text-4xl font-light mb-10">Comments</h1>

      {comments.length === 0 ? (
        <p className="text-muted text-sm">No pending comments.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {comments.map((comment) => (
            <div key={comment.id} className="py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{comment.author_name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {comment.author_name} · {formatDate(comment.created_at)}
                  </p>
                  <p className="text-sm text-ink mt-3 leading-relaxed">{comment.content}</p>
                </div>
                <ApproveCommentButton commentId={comment.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
