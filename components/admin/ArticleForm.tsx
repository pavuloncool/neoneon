'use client'

// components/admin/ArticleForm.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TiptapEditor } from '@/components/admin/TiptapEditor'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { slugify, cn } from '@/lib/utils'
import type { Article, Category, ArticleStatus, Tag } from '@/types'

const inputCls = "bg-transparent border border-[#e5e5e0] px-4 py-3 text-sm text-[#0f0f0f] focus:outline-none focus:border-[#0f0f0f] transition-colors"
const selectCls = "bg-[#fafaf8] border border-[#e5e5e0] px-4 py-3 text-sm text-[#0f0f0f] focus:outline-none focus:border-[#0f0f0f] transition-colors"
const labelCls = "text-xs tracking-widest text-[#6b6b6b] uppercase"

interface ArticleFormProps {
  article?: Article
  allTags: Tag[]
}

function TranslateModal({
  onClose,
  onApply,
}: {
  onClose: () => void
  onApply: (data: { title: string; excerpt: string; slug: string }) => void
}) {
  const [raw, setRaw] = useState('')
  const [err, setErr] = useState('')

  function handleApply() {
    setErr('')
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      if (!parsed.title) { setErr('Brak pola "title" w JSON.'); return }
      onApply({
        title: parsed.title ?? '',
        excerpt: parsed.excerpt ?? '',
        slug: parsed.slug ?? slugify(parsed.title),
      })
    } catch {
      setErr('Nieprawidłowy JSON. Upewnij się że wkleiłeś tylko obiekt { }.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#fafaf8] w-full max-w-2xl mx-4 p-8 border border-[#e5e5e0] shadow-xl">
        <h2 className="font-display text-2xl font-light mb-2 text-[#0f0f0f]">Wklej tłumaczenie meta</h2>
        <p className="text-xs text-[#6b6b6b] mb-6">
          Wklej odpowiedź AI poniżej (format JSON z polami title, excerpt, slug):
        </p>
        <pre className="text-xs bg-[#0f0f0f]/5 border border-[#e5e5e0] p-3 mb-4 font-mono leading-relaxed text-[#6b6b6b]">
{`{
  "title": "English title here",
  "excerpt": "Short English excerpt here",
  "slug": "english-url-slug"
}`}
        </pre>
        <textarea
          rows={8}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Wklej tutaj odpowiedź AI..."
          className="w-full bg-transparent border border-[#e5e5e0] px-4 py-3 text-sm text-[#0f0f0f] font-mono focus:outline-none focus:border-[#0f0f0f] transition-colors resize-none mb-3"
        />
        {err && <p className="text-xs text-red-500 mb-3">{err}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="text-xs tracking-widest uppercase px-4 py-2.5 border border-[#e5e5e0] text-[#6b6b6b] hover:border-[#0f0f0f] hover:text-[#0f0f0f] transition-colors">
            Anuluj
          </button>
          <button type="button" onClick={handleApply}
            className="text-xs tracking-widest uppercase px-6 py-2.5 border border-[#0f0f0f] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-[#fafaf8] transition-colors">
            Zastosuj →
          </button>
        </div>
      </div>
    </div>
  )
}

export function ArticleForm({ article, allTags }: ArticleFormProps) {
  const router = useRouter()
  const isEdit = !!article

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '')
  const [category, setCategory] = useState<Category>(article?.category ?? 'content-writing')
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? 'draft')
  const [locale, setLocale] = useState<'pl' | 'en'>(article?.locale ?? 'pl')
  const [translationId, setTranslationId] = useState(article?.translation_id ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(article?.cover_image_url ?? '')
  const [focalX, setFocalX] = useState<number>(article?.cover_focal_x ?? 0.5)
  const [focalY, setFocalY] = useState<number>(article?.cover_focal_y ?? 0.5)
  const [content, setContent] = useState<object | null>(article?.content ?? null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    article?.tags?.map((t) => t.id) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [copiedContent, setCopiedContent] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!isEdit) {
      const stored = sessionStorage.getItem('neoneon_translate_prefill')
      if (stored) {
        sessionStorage.removeItem('neoneon_translate_prefill')
        try {
          const data = JSON.parse(stored)
          if (data.title) setTitle(data.title)
          if (data.slug) setSlug(data.slug)
          if (data.excerpt) setExcerpt(data.excerpt)
          if (data.category) setCategory(data.category)
          if (data.cover_image_url) setCoverImageUrl(data.cover_image_url)
          if (data.cover_focal_x != null) setFocalX(data.cover_focal_x)
          if (data.cover_focal_y != null) setFocalY(data.cover_focal_y)
          if (data.translation_id) setTranslationId(data.translation_id)
          setLocale('en')
        } catch {}
      }
    }
  }, [isEdit])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!isEdit) setSlug(slugify(value))
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  function handleFocalClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100) / 100
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100) / 100
    setFocalX(Math.min(1, Math.max(0, x)))
    setFocalY(Math.min(1, Math.max(0, y)))
  }

  function extractText(node: any): string {
    if (!node) return ''
    if (node.type === 'text') return node.text ?? ''
    if (node.content) return node.content.map(extractText).join('\n')
    return ''
  }

  async function handleCopyPrompt() {
    if (!article) return
    const tid = article.translation_id || crypto.randomUUID()

    if (!article.translation_id) {
      await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title, slug: article.slug, excerpt: article.excerpt ?? '',
          category: article.category, status: article.status, locale: article.locale ?? 'pl',
          translation_id: tid, cover_image_url: article.cover_image_url ?? null,
          cover_focal_x: article.cover_focal_x ?? 0.5, cover_focal_y: article.cover_focal_y ?? 0.5,
          content: article.content, tag_ids: article.tags?.map(t => t.id) ?? [],
        }),
      })
      setTranslationId(tid)
    }

    sessionStorage.setItem('neoneon_translate_meta', JSON.stringify({
      translation_id: tid, category: article.category,
      cover_image_url: article.cover_image_url ?? '',
      cover_focal_x: article.cover_focal_x ?? 0.5,
      cover_focal_y: article.cover_focal_y ?? 0.5,
    }))

    const prompt = `Translate this article from Polish to English. Return ONLY a JSON object with exactly these keys:
- "title": translated title
- "excerpt": translated excerpt, max 2 sentences
- "slug": URL slug in English (lowercase, hyphens, max 60 chars)

No explanation, no markdown, only the JSON object.

---
TITLE: ${article.title}

EXCERPT: ${article.excerpt ?? ''}
---`

    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  async function handleCopyContent() {
    if (!article) return
    const contentText = article.content ? extractText(article.content) : ''
    await navigator.clipboard.writeText(contentText)
    setCopiedContent(true)
    setTimeout(() => setCopiedContent(false), 3000)
  }

  function handleApplyTranslation(data: { title: string; excerpt: string; slug: string }) {
    setShowModal(false)
    let meta: any = {}
    try {
      const stored = sessionStorage.getItem('neoneon_translate_meta')
      if (stored) meta = JSON.parse(stored)
    } catch {}
    sessionStorage.setItem('neoneon_translate_prefill', JSON.stringify({
      ...data,
      translation_id: meta.translation_id ?? translationId,
      category: meta.category ?? category,
      cover_image_url: meta.cover_image_url ?? coverImageUrl,
      cover_focal_x: meta.cover_focal_x ?? focalX,
      cover_focal_y: meta.cover_focal_y ?? focalY,
    }))
    router.push('/admin/articles/new')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title, slug, excerpt, category, status, locale,
        translation_id: translationId.trim() || null,
        cover_image_url: coverImageUrl || null,
        cover_focal_x: focalX, cover_focal_y: focalY,
        content, tag_ids: selectedTagIds,
      }
      const url = isEdit ? `/api/admin/articles/${article.id}` : '/api/admin/articles'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to save.') }
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
    if (res.ok) { router.push('/admin/articles'); router.refresh() }
  }

  const showTranslateButtons = isEdit && (article?.locale ?? 'pl') === 'pl'

  return (
    <>
      {showModal && (
        <TranslateModal onClose={() => setShowModal(false)} onApply={handleApplyTranslation} />
      )}

      <form onSubmit={handleSave} className="p-10 max-w-4xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-4xl font-light text-[#0f0f0f]">
            {isEdit ? 'Edit article' : 'New article'}
          </h1>
          <div className="flex items-center gap-3">
            {showTranslateButtons && (
              <>
                <button type="button" onClick={handleCopyPrompt}
                  className={cn('text-xs tracking-widest uppercase px-4 py-2.5 border transition-colors',
                    copied
                      ? 'border-green-500 text-green-600'
                      : 'border-[#c8a96e] text-[#c8a96e] hover:bg-[#c8a96e] hover:text-[#fafaf8]'
                  )}>
                  {copied ? '✓ Skopiowano' : 'Copy prompt'}
                </button>
                <button type="button" onClick={() => setShowModal(true)}
                  className="text-xs tracking-widest uppercase px-4 py-2.5 border border-[#c8a96e] text-[#c8a96e] hover:bg-[#c8a96e] hover:text-[#fafaf8] transition-colors">
                  Paste translation
                </button>
                <button type="button" onClick={handleCopyContent}
                  className={cn('text-xs tracking-widest uppercase px-4 py-2.5 border transition-colors',
                    copiedContent
                      ? 'border-green-500 text-green-600'
                      : 'border-[#c8a96e] text-[#c8a96e] hover:bg-[#c8a96e] hover:text-[#fafaf8]'
                  )}>
                  {copiedContent ? '✓ Skopiowano' : 'Copy content'}
                </button>
              </>
            )}
            {isEdit && (
              <button type="button" onClick={handleDelete}
                className="text-xs tracking-widest uppercase px-4 py-2.5 border border-[#e5e5e0] text-[#6b6b6b] hover:border-red-400 hover:text-red-500 transition-colors">
                Delete
              </button>
            )}
            <button type="submit" disabled={saving}
              className={cn('text-xs tracking-widest uppercase px-6 py-2.5 border transition-colors duration-200',
                saving
                  ? 'border-[#e5e5e0] text-[#6b6b6b] cursor-not-allowed'
                  : 'border-[#0f0f0f] text-[#0f0f0f] hover:bg-[#0f0f0f] hover:text-[#fafaf8]'
              )}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create article'}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mb-6">{error}</p>}

        <div className="flex flex-col gap-6">

          {showTranslateButtons && (
            <div className="border border-[#c8a96e]/30 bg-[#c8a96e]/5 px-4 py-3 text-xs leading-relaxed">
              <strong className="text-[#0f0f0f]">Workflow tłumaczenia EN:</strong>
              <span className="text-[#6b6b6b]">
                {' '}Krok 1 — meta: <em>Copy prompt</em> → wklej w AI → skopiuj odpowiedź JSON → <em>Paste translation</em>.
                {' '}Krok 2 — treść: <em>Copy content</em> → otwórz nowy artykuł EN → wklej w edytor.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Title</label>
            <input type="text" required value={title} onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Article title" className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Slug</label>
            <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug" className={cn(inputCls, 'font-mono')} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={selectCls}>
                <option value="content-writing">Content Writing</option>
                <option value="ux-strategies">UX Strategies</option>
                <option value="data-visualisation">Data Visualisation</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ArticleStatus)} className={selectCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Language</label>
              <select value={locale} onChange={(e) => setLocale(e.target.value as 'pl' | 'en')} className={selectCls}>
                <option value="pl">PL — Polski</option>
                <option value="en">EN — English</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              Translation ID
              <span className="ml-2 normal-case text-[#6b6b6b]/60 tracking-normal">— UUID łączący wersje PL i EN</span>
            </label>
            <input type="text" value={translationId} onChange={(e) => setTranslationId(e.target.value)}
              placeholder="Generowany automatycznie przy tłumaczeniu"
              className={cn(inputCls, 'font-mono')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Excerpt</label>
            <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description shown in listings"
              className={cn(inputCls, 'resize-none')} />
          </div>

          <div className="flex flex-col gap-3">
            <label className={labelCls}>Cover image</label>
            <ImageUpload onUpload={(url) => setCoverImageUrl(url)} label="Upload cover image" />
            <input type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="or paste URL: https://..."
              className={cn(inputCls, 'font-mono')} />
            {coverImageUrl && (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-[#6b6b6b] tracking-widest uppercase">
                  Focal point — click to set ({Math.round(focalX * 100)}%, {Math.round(focalY * 100)}%)
                </p>
                <div className="relative w-full cursor-crosshair border border-[#e5e5e0] overflow-hidden"
                  style={{ paddingBottom: '56.25%' }} onClick={handleFocalClick}>
                  <img src={coverImageUrl} alt="Cover preview"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={{ objectPosition: `${focalX * 100}% ${focalY * 100}%` }} />
                  <div className="absolute w-5 h-5 pointer-events-none"
                    style={{ left: `${focalX * 100}%`, top: `${focalY * 100}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className="absolute inset-x-0 top-1/2 h-px bg-white shadow-[0_0_3px_rgba(0,0,0,0.8)]" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-white shadow-[0_0_3px_rgba(0,0,0,0.8)]" />
                    <div className="absolute inset-0 rounded-full border border-white shadow-[0_0_3px_rgba(0,0,0,0.8)]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className={labelCls}>Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                    className={cn('text-xs tracking-widest uppercase px-3 py-1.5 border transition-colors',
                      selectedTagIds.includes(tag.id)
                        ? 'border-[#0f0f0f] text-[#0f0f0f] bg-[#0f0f0f]/5'
                        : 'border-[#e5e5e0] text-[#6b6b6b] hover:border-[#0f0f0f] hover:text-[#0f0f0f]'
                    )}>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Content</label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>

        </div>
      </form>
    </>
  )
}
