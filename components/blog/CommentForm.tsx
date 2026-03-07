'use client'

// components/blog/CommentForm.tsx

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  articleId: string
}

export function CommentForm({ articleId }: CommentFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({ author_name: '', author_email: '', body: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, article_id: articleId }),
      })

      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ author_name: '', author_email: '', body: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mt-12 pt-10 border-t border-border">
      <h3 className="font-display text-2xl font-light mb-6">Leave a comment</h3>

      {status === 'success' ? (
        <p className="text-sm text-muted border border-border px-4 py-3">
          Thank you — your comment is awaiting moderation.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-widest text-muted uppercase">Name</label>
              <input
                type="text"
                required
                value={form.author_name}
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                className="bg-transparent border border-border px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors"
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-widest text-muted uppercase">Email</label>
              <input
                type="email"
                required
                value={form.author_email}
                onChange={(e) => setForm({ ...form, author_email: e.target.value })}
                className="bg-transparent border border-border px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs tracking-widest text-muted uppercase">Comment</label>
            <textarea
              required
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="bg-transparent border border-border px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors resize-none"
              placeholder="Your thoughts..."
            />
          </div>

          {status === 'error' && (
            <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className={cn(
              'self-start text-xs tracking-widest uppercase px-6 py-3 border transition-colors duration-200',
              status === 'loading'
                ? 'border-border text-muted cursor-not-allowed'
                : 'border-ink text-ink hover:bg-ink hover:text-paper'
            )}
          >
            {status === 'loading' ? 'Sending...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  )
}
