#!/usr/bin/env node
// scripts/migrate-to-sanity.mjs
// Migracja artykułów, tagów, komentarzy i wiadomości kontaktowych z Supabase do Sanity.
//
//   node scripts/migrate-to-sanity.mjs --dry-run [--out plik.json]   # tylko raport, nic nie zapisuje
//   node scripts/migrate-to-sanity.mjs                               # zapis do Sanity
//
// Idempotentny (createOrReplace) — można uruchamiać wielokrotnie, np. tuż przed wdrożeniem.
// _id artykułu = dawny UUID z Supabase. Komentarze zatwierdzone → opublikowane,
// niezatwierdzone i wiadomości kontaktowe → szkice (drafts.*), tak jak zapisują je formularze.
// Wymaga w .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SANITY_MIGRATION_TOKEN.

import fs from 'node:fs'
import path from 'node:path'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { createClient as createSanity } from '@sanity/client'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const OUT = args.includes('--out') ? args[args.indexOf('--out') + 1] : null

// ── env ──────────────────────────────────────────────────────
const envFile = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '.env.local')
const env = Object.fromEntries(
  fs.readFileSync(envFile, 'utf8').split('\n')
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    })
)
for (const k of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SANITY_MIGRATION_TOKEN']) {
  if (!env[k]) throw new Error(`Brak ${k} w .env.local`)
}

const supabase = createSupabase(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const sanity = createSanity({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'n81gbqh8',
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2025-02-19',
  token: env.SANITY_MIGRATION_TOKEN,
  useCdn: false,
})

const report = { articles: 0, drafts: 0, tags: 0, images: 0, comments: 0, contacts: 0, unknownNodes: {}, unknownMarks: {} }

// ── obrazy ───────────────────────────────────────────────────
const assetCache = new Map()

async function uploadImage(url) {
  if (assetCache.has(url)) return assetCache.get(url)
  report.images++
  let ref
  if (DRY_RUN) {
    ref = `image-dryrun-${assetCache.size}`
  } else {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Nie udało się pobrać obrazu ${url}: ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const asset = await sanity.assets.upload('image', buffer, { filename: decodeURIComponent(url.split('/').pop()) })
    ref = asset._id
  }
  assetCache.set(url, ref)
  return ref
}

// ── Tiptap → Portable Text ───────────────────────────────────
function isEmbedHtml(html) {
  const normalized = html.trim().toLowerCase()
  if (!normalized.includes('<') || !normalized.includes('>')) return false
  return ['<iframe', '<blockquote', '<script'].some((tag) => normalized.includes(tag))
}

function plainText(node) {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(plainText).join('')
}

const DECORATORS = { bold: 'strong', italic: 'em', code: 'code', strike: 'strike-through' }

function makeConverter() {
  let n = 0
  const key = () => `k${(n++).toString(36)}`

  function block(inline, { style = 'normal', listItem, level } = {}) {
    const markDefs = []
    const children = []
    for (const node of inline ?? []) {
      if (node.type === 'hardBreak') {
        children.push({ _type: 'span', _key: key(), text: '\n', marks: [] })
        continue
      }
      if (node.type !== 'text') {
        report.unknownNodes[`inline:${node.type}`] = (report.unknownNodes[`inline:${node.type}`] ?? 0) + 1
        continue
      }
      const marks = []
      for (const mark of node.marks ?? []) {
        if (DECORATORS[mark.type]) {
          marks.push(DECORATORS[mark.type])
        } else if (mark.type === 'link') {
          const href = mark.attrs?.href ?? '#'
          const blank = (mark.attrs?.target ?? '_blank') === '_blank'
          let def = markDefs.find((d) => d.href === href && d.blank === blank)
          if (!def) {
            def = { _type: 'link', _key: key(), href, blank }
            markDefs.push(def)
          }
          marks.push(def._key)
        } else {
          report.unknownMarks[mark.type] = (report.unknownMarks[mark.type] ?? 0) + 1
        }
      }
      children.push({ _type: 'span', _key: key(), text: node.text ?? '', marks })
    }
    if (children.length === 0) children.push({ _type: 'span', _key: key(), text: '', marks: [] })
    const b = { _type: 'block', _key: key(), style, markDefs, children }
    if (listItem) Object.assign(b, { listItem, level })
    return b
  }

  async function convert(node, ctx = {}) {
    switch (node.type) {
      case 'doc': {
        const out = []
        for (const c of node.content ?? []) out.push(...(await convert(c, ctx)))
        return out
      }
      case 'paragraph':
        return [block(node.content, ctx)]
      case 'heading':
        return [block(node.content, { style: `h${node.attrs?.level ?? 2}` })]
      case 'blockquote': {
        const out = []
        for (const c of node.content ?? []) out.push(...(await convert(c, { ...ctx, style: 'blockquote' })))
        return out
      }
      case 'bulletList':
      case 'orderedList': {
        const listItem = node.type === 'bulletList' ? 'bullet' : 'number'
        const level = (ctx.level ?? 0) + 1
        const out = []
        for (const li of node.content ?? []) {
          for (const c of li.content ?? []) out.push(...(await convert(c, { listItem, level })))
        }
        return out
      }
      case 'codeBlock': {
        const code = plainText(node)
        if (isEmbedHtml(code)) return [{ _type: 'embed', _key: key(), html: code }]
        return [{ _type: 'codeBlock', _key: key(), language: node.attrs?.language ?? '', code }]
      }
      case 'horizontalRule':
        return [{ _type: 'divider', _key: key(), style: 'line' }]
      case 'image': {
        const src = node.attrs?.src
        if (!src) return []
        const img = { _type: 'image', _key: key(), asset: { _type: 'reference', _ref: await uploadImage(src) } }
        if (node.attrs?.alt) img.alt = node.attrs.alt
        return [img]
      }
      case 'youtube':
        return node.attrs?.src ? [{ _type: 'youtube', _key: key(), url: node.attrs.src }] : []
      default:
        report.unknownNodes[node.type] = (report.unknownNodes[node.type] ?? 0) + 1
        return []
    }
  }

  return (content) => (content ? convert(content) : Promise.resolve([]))
}

// ── główna procedura ─────────────────────────────────────────
async function must(query) {
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

const [articles, tags, articleTags, comments, contacts] = await Promise.all([
  must(supabase.from('articles').select('*').order('created_at')),
  must(supabase.from('tags').select('*').order('name')),
  must(supabase.from('article_tags').select('*')),
  must(supabase.from('comments').select('*').order('created_at')),
  must(supabase.from('contacts').select('*').order('created_at')),
])

const docs = []

for (const t of tags) {
  docs.push({ _id: `tag-${t.id}`, _type: 'tag', name: t.name, nameEn: t.name_en ?? undefined, slug: { _type: 'slug', current: t.slug } })
  report.tags++
}

for (const a of articles) {
  const convert = makeConverter()
  const doc = {
    _id: a.status === 'draft' ? `drafts.${a.id}` : a.id,
    _type: 'article',
    title: a.title,
    slug: { _type: 'slug', current: a.slug },
    locale: a.locale ?? 'pl',
    translationId: a.translation_id ?? undefined,
    category: a.category,
    excerpt: a.excerpt ?? undefined,
    publishedAt: a.published_at ?? undefined,
    tags: articleTags
      .filter((at) => at.article_id === a.id)
      .map((at) => ({ _type: 'reference', _key: at.tag_id.slice(0, 12), _ref: `tag-${at.tag_id}` })),
    content: await convert(a.content),
  }
  if (a.cover_image_url) {
    doc.coverImage = {
      _type: 'image',
      asset: { _type: 'reference', _ref: await uploadImage(a.cover_image_url) },
      hotspot: { _type: 'sanity.imageHotspot', x: a.cover_focal_x ?? 0.5, y: a.cover_focal_y ?? 0.5, width: 0.3, height: 0.3 },
      crop: { _type: 'sanity.imageCrop', top: 0, bottom: 0, left: 0, right: 0 },
    }
  }
  docs.push(doc)
  report.articles++
  if (a.status === 'draft') report.drafts++
}

for (const c of comments) {
  docs.push({
    _id: c.approved ? `comment-${c.id}` : `drafts.comment-${c.id}`,
    _type: 'comment',
    article: { _type: 'reference', _ref: c.article_id, _weak: true },
    authorName: c.author_name,
    authorEmail: c.author_email,
    body: c.body,
    submittedAt: c.created_at,
  })
  report.comments++
}

for (const c of contacts) {
  docs.push({
    _id: `drafts.contact-${c.id}`,
    _type: 'contactMessage',
    name: c.name,
    email: c.email,
    message: c.message,
    submittedAt: c.created_at,
  })
  report.contacts++
}

if (OUT) fs.writeFileSync(OUT, JSON.stringify(docs, null, 2))

if (!DRY_RUN) {
  const tx = sanity.transaction()
  for (const d of docs) tx.createOrReplace(d)
  const res = await tx.commit({ visibility: 'sync' })
  report.transactionId = res.transactionId
}

console.log(JSON.stringify({ mode: DRY_RUN ? 'dry-run' : 'write', ...report }, null, 2))
