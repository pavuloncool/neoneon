'use client'

// components/admin/TagsManager.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'
import type { Tag } from '@/types'

export function TagsManager({ initialTags }: { initialTags: Tag[] }) {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')

    const res = await fetch('/api/admin/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        name_en: nameEn.trim() || null,
        slug: slugify(name.trim()),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to create tag.')
      setSaving(false)
      return
    }

    const newTag = await res.json()
    setTags((prev) => [...prev, newTag])
    setName('')
    setNameEn('')
    setSaving(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tag?')) return

    const res = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTags((prev) => prev.filter((t) => t.id !== id))
      router.refresh()
    }
  }

  const inputClass = "bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"

  return (
    <div className="p-10 max-w-2xl">
      <h1 className="font-display text-4xl font-light mb-10">Tags</h1>

      {/* Formularz dodawania */}
      <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-10">
        <div className="flex gap-0">
          <div className="flex-1 flex flex-col">
            <label className="text-xs text-muted uppercase tracking-widest mb-1.5">PL</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nazwa po polsku"
              className={inputClass + ' w-full'}
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="text-xs text-muted uppercase tracking-widest mb-1.5">EN</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="English name"
              className={inputClass + ' w-full border-l-0'}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="self-start border border-ink px-6 py-3 text-xs tracking-widest uppercase text-ink hover:bg-ink hover:text-paper transition-colors disabled:border-border disabled:text-muted disabled:cursor-not-allowed"
        >
          {saving ? '...' : 'Add tag'}
        </button>
      </form>

      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

      {/* Lista tagów */}
      {tags.length === 0 ? (
        <p className="text-muted text-sm">No tags yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-ink">
                  {tag.name}
                  {tag.name_en && (
                    <span className="text-muted ml-2">/ {tag.name_en}</span>
                  )}
                </p>
                <p className="text-xs text-muted font-mono mt-0.5">{tag.slug}</p>
              </div>
              <button
                onClick={() => handleDelete(tag.id)}
                className="text-xs text-muted hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
