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
      body: JSON.stringify({ name: name.trim(), slug: slugify(name.trim()) }),
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

  return (
    <div className="p-10 max-w-2xl">
      <h1 className="font-display text-4xl font-light mb-10">Tags</h1>

      {/* Formularz dodawania */}
      <form onSubmit={handleAdd} className="flex gap-0 mb-10">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tag name"
          className="flex-1 bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="border border-l-0 border-ink px-6 py-3 text-xs tracking-widest uppercase text-ink hover:bg-ink hover:text-paper transition-colors disabled:border-border disabled:text-muted disabled:cursor-not-allowed"
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
                <p className="text-sm text-ink">{tag.name}</p>
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
