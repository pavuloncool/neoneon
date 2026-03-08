'use client'

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  async function handleDelete() {
    await fetch(`/api/admin/comments/${commentId}`, { method: 'DELETE' })
    window.location.reload()
  }
  return (
    <button
      onClick={handleDelete}
      className="text-xs tracking-widest uppercase px-3 py-1.5 border border-border text-muted hover:border-red-400 hover:text-red-400 transition-colors"
    >
      Delete
    </button>
  )
}
