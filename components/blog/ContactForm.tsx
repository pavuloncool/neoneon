'use client'

// components/blog/ContactForm.tsx
// Formularz kontaktowy (sekcja page buildera „Formularz kontaktowy”). Tekst obok formularza
// przychodzi z Sanity jako children; etykiety i komunikaty — z tekstów interfejsu (t('…')).

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { Turnstile, type TurnstileHandle } from '@/components/ui/Turnstile'

export function ContactForm({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'captcha'>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstile = useRef<TurnstileHandle>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken }),
      })
      if (res.status === 403) {
        setStatus('captcha')
        // Odrzucony token → nowy do ponownej próby
        turnstile.current?.reset()
        return
      }
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
      // Token Turnstile jest jednorazowy i już zużyty — nowy do ponownej próby.
      // Po sukcesie resetu nie ma: formularz znika, a porzucone wyzwanie liczyłoby się jako „bot”.
      turnstile.current?.reset()
    }
  }

  const inputClass = "bg-transparent border border-border dark:border-white px-4 py-3 text-sm text-ink dark:text-white placeholder:text-muted dark:placeholder:text-white/50 focus:outline-none focus:border-ink dark:focus:border-white transition-colors"
  const labelClass = "text-xs tracking-widest text-muted dark:text-white uppercase"

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-12">
      <div className="flex flex-col gap-6 text-sm text-muted dark:text-white/70 leading-relaxed">
        {children}
      </div>
      {status === 'success' ? (
        <div className="border border-border dark:border-white px-6 py-8">
          <p className="font-display text-2xl font-light mb-2">{t('successTitle')}</p>
          <p className="text-sm text-muted dark:text-white/70">{t('successBody')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>{t('fieldName')}</label>
            <input type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t('placeholderName')} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>{t('fieldEmail')}</label>
            <input type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t('placeholderEmail')} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>{t('fieldMessage')}</label>
            <textarea required rows={6} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={t('placeholderMessage')}
              className={cn(inputClass, "resize-none")} />
          </div>
          {status === 'error' && (
            <p className="text-xs text-red-500">{t('error')}</p>
          )}
          {status === 'captcha' && (
            <p className="text-xs text-red-500">{t('captchaError')}</p>
          )}
          {/* Widget Turnstile i przycisk razem — pusty widget nie dokłada odstępu formularza */}
          <div className="flex flex-col items-start">
            <Turnstile ref={turnstile} onToken={setTurnstileToken} />
            <button type="submit" disabled={status === 'loading' || !turnstileToken}
              className={cn(
                'self-start text-xs tracking-widest uppercase px-8 py-3 border transition-colors duration-200',
                status === 'loading' || !turnstileToken
                  ? 'border-border text-muted cursor-not-allowed'
                  : 'border-ink text-ink hover:bg-ink hover:text-paper dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-ink'
              )}>
              {status === 'loading' ? t('sending') : t('send')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
