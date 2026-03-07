'use client'

// components/admin/ApproveCommentButton.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ApproveCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function approve() {
    setLoading(true)
    await fetch(`/api/admin/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true }),
    })
    setDone(true)
    setLoading(false)
    router.refresh()
  }

  if (done) return <span className="text-xs text-accent tracking-widest uppercase">Approved</span>

  return (
    <button
      onClick={approve}
      disabled={loading}
      className="shrink-0 text-xs tracking-widest uppercase px-4 py-2 border border-border text-muted hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Approve'}
    </button>
  )
}
