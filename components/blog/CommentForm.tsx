'use client'

// components/blog/CommentForm.tsx

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  articleId: string
}

export function CommentForm({ articleId }: CommentFormProps) {
  const t = useTranslations('comments')
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

  const inputClass = "bg-transparent border border-border dark:border-white px-3 py-2 text-sm text-ink dark:text-white placeholder:text-muted dark:placeholder:text-white/50 focus:outline-none focus:border-ink dark:focus:border-white transition-colors"
  const labelClass = "text-xs tracking-widest text-muted dark:text-white uppercase"

  return (
    <div className="mt-12 pt-10 border-t border-border">
      <h3 className="font-display text-2xl font-light mb-6">{t('heading')}</h3>

      {status === 'success' ? (
        <p className="text-sm text-muted dark:text-white/70 border border-border dark:border-white px-4 py-3">
          {t('success')}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>{t('fieldName')}</label>
              <input type="text" required value={form.author_name}
                suppressHydrationWarning
                onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                placeholder={t('placeholderName')} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>{t('fieldEmail')}</label>
              <input type="email" required value={form.author_email}
                suppressHydrationWarning
                onChange={(e) => setForm({ ...form, author_email: e.target.value })}
                placeholder={t('placeholderEmail')} className={inputClass} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>{t('fieldComment')}</label>
            <textarea required rows={5} value={form.body}
              suppressHydrationWarning
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder={t('placeholderComment')}
              className={cn(inputClass, "resize-none")} />
          </div>
          {status === 'error' && (
            <p className="text-xs text-red-500">{t('error')}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className={cn(
              'self-start text-xs tracking-widest uppercase px-6 py-3 border transition-colors duration-200',
              status === 'loading'
                ? 'border-border text-muted cursor-not-allowed'
                : 'border-ink text-ink hover:bg-ink hover:text-paper dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-ink'
            )}
          >
            {status === 'loading' ? t('submitting') : t('submit')}
          </button>
        </form>
      )}
    </div>
  )
}
