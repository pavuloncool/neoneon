'use client'

// components/admin/ArticleForm.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TiptapEditor } from '@/components/admin/TiptapEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { slugify, cn } from '@/lib/utils'
import type { Article, Category, ArticleStatus, Tag } from '@/types'

interface ArticleFormProps {
  article?: Article
  allTags: Tag[]
}

export function ArticleForm({ article, allTags }: ArticleFormProps) {
  const router = useRouter()
  const isEdit = !!article

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [category, setCategory] = useState<Category>(article?.category ?? 'content-writing')
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? 'draft')
  const [coverImageUrl, setCoverImageUrl] = useState(article?.cover_image_url ?? '')
  const [content, setContent] = useState<object | null>(article?.content ?? null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags?.map((t) => t.id) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!isEdit) setSlug(slugify(value))
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        title,
        slug,
        excerpt,
        category,
        status,
        cover_image_url: coverImageUrl || null,
        content,
        tag_ids: selectedTagIds,
      }

      const url = isEdit ? `/api/admin/articles/${article.id}` : '/api/admin/articles'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save.')
      }

      router.push('/admin/articles')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!article) return
    if (!confirm('Delete this article? This cannot be undone.')) return

    const res = await fetch(`/api/admin/articles/${article.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/articles')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSave} className="p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-4xl font-light">
          {isEdit ? 'Edit article' : 'New article'}
        </h1>
        <div className="flex items-center gap-3">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs tracking-widest uppercase px-4 py-2.5 border border-border text-muted hover:border-red-400 hover:text-red-500 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'text-xs tracking-widest uppercase px-6 py-2.5 border transition-colors duration-200',
              saving
                ? 'border-border text-muted cursor-not-allowed'
                : 'border-ink text-ink hover:bg-ink hover:text-paper'
            )}
          >
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create article'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-6">{error}</p>
      )}

      <div className="flex flex-col gap-6">

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest text-muted uppercase">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Article title"
            className="bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest text-muted uppercase">Slug</label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-slug"
            className="bg-transparent border border-border px-4 py-3 text-sm font-mono focus:outline-none focus:border-ink transition-colors"
          />
        </div>

        {/* Category + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs tracking-widest text-muted uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="bg-paper border border-border px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
            >
              <option value="content-writing">Content Writing</option>
              <option value="ux-strategies">UX Strategies</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs tracking-widest text-muted uppercase">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
              className="bg-paper border border-border px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Excerpt */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest text-muted uppercase">Excerpt</label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short description shown in listings"
            className="bg-transparent border border-border px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors resize-none"
          />
        </div>

        {/* Cover image */}
        <div className="flex flex-col gap-3">
          <label className="text-xs tracking-widest text-muted uppercase">Cover image</label>
          <ImageUpload
            onUpload={(url) => setCoverImageUrl(url)}
            label="Upload cover image"
          />
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="or paste URL: https://..."
            className="bg-transparent border border-border px-4 py-3 text-sm font-mono focus:outline-none focus:border-ink transition-colors"
          />
          {coverImageUrl && (
            <img src={coverImageUrl} alt="Cover preview" className="h-32 w-full object-cover border border-border" />
          )}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest text-muted uppercase">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'text-xs tracking-widest uppercase px-3 py-1.5 border transition-colors',
                    selectedTagIds.includes(tag.id)
                      ? 'border-ink text-ink bg-ink/5'
                      : 'border-border text-muted hover:border-ink hover:text-ink'
                  )}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content editor */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-widest text-muted uppercase">Content</label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

      </div>
    </form>
  )
}
