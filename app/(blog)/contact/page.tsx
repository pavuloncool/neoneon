'use client'

// app/(blog)/contact/page.tsx

import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-16">
        <p className="text-xs tracking-widest text-muted uppercase mb-4">Contact</p>
        <h1 className="font-display text-6xl md:text-7xl font-light leading-none">
          Get in touch
        </h1>
      </header>

      <div className="grid md:grid-cols-[1fr_2fr] gap-12">
        <div className="flex flex-col gap-6 text-sm text-muted leading-relaxed">
          <p>
            Whether you have a project in mind, a question about my work,
            or just want to say hello — I would love to hear from you.
          </p>
          <p>I typically respond within two business days.</p>
        </div>

        {status === 'success' ? (
          <div className="border border-border px-6 py-8">
            <p className="font-display text-2xl font-light mb-2">Thank you.</p>
            <p className="text-sm text-muted">Your message has been received. I will be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-widest text-muted uppercase">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="bg-transparent border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-widest text-muted uppercase">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="bg-transparent border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-widest text-muted uppercase">Message</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="What's on your mind?"
                className="bg-transparent border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors resize-none"
              />
            </div>
            {status === 'error' && (
              <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className={cn(
                'self-start text-xs tracking-widest uppercase px-8 py-3 border transition-colors duration-200',
                status === 'loading'
                  ? 'border-border text-muted cursor-not-allowed'
                  : 'border-ink text-ink hover:bg-ink hover:text-paper'
              )}
            >
              {status === 'loading' ? 'Sending...' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
