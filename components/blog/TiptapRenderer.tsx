// components/blog/TiptapRenderer.tsx
// Server Component — renderuje JSON z Tiptap do HTML bez hydratacji.
// Uruchamianie skryptów embedów (Instagram itp.) obsługuje EmbedActivator.

import { EmbedActivator } from './EmbedActivator'
import type { TiptapContent, TiptapNode } from '@/types'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderNode(node: TiptapNode): string {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(renderNode).join('')

    case 'paragraph':
      return `<p>${(node.content ?? []).map(renderNode).join('')}</p>`

    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2
      return `<h${level}>${(node.content ?? []).map(renderNode).join('')}</h${level}>`
    }

    case 'text': {
      let text = escapeHtml(node.text ?? '')
      for (const mark of node.marks ?? []) {
        if (mark.type === 'bold') text = `<strong>${text}</strong>`
        if (mark.type === 'italic') text = `<em>${text}</em>`
        if (mark.type === 'code') text = `<code>${text}</code>`
        if (mark.type === 'strike') text = `<s>${text}</s>`
        if (mark.type === 'link') {
          const href = escapeHtml(mark.attrs?.href as string ?? '#')
          const target = escapeHtml(mark.attrs?.target as string ?? '_blank')
          text = `<a href="${href}" target="${target}" rel="noopener noreferrer">${text}</a>`
        }
      }
      return text
    }

    case 'bulletList':
      return `<ul>${(node.content ?? []).map(renderNode).join('')}</ul>`

    case 'orderedList':
      return `<ol>${(node.content ?? []).map(renderNode).join('')}</ol>`

    case 'listItem':
      return `<li>${(node.content ?? []).map(renderNode).join('')}</li>`

    case 'blockquote':
      return `<blockquote>${(node.content ?? []).map(renderNode).join('')}</blockquote>`

    case 'codeBlock': {
      const lang = node.attrs?.language as string ?? ''
      const code = (node.content ?? []).map(renderNode).join('')
      return `<pre><code class="language-${lang}">${code}</code></pre>`
    }

    case 'hardBreak':
      return '<br />'

    case 'horizontalRule':
      return '<hr />'

    case 'image': {
      const src = node.attrs?.src as string ?? ''
      const alt = node.attrs?.alt as string ?? ''
      const title = node.attrs?.title as string ?? ''
      return `<img src="${src}" alt="${alt}" title="${title}" loading="lazy" />`
    }

    case 'youtube': {
      const src = node.attrs?.src as string ?? ''
      return `<div class="video-container"><iframe src="${src}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`
    }

    default:
      return (node.content ?? []).map(renderNode).join('')
  }
}

interface TiptapRendererProps {
  content: TiptapContent
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  const html = renderNode(content)

  return (
    <>
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <EmbedActivator />
    </>
  )
}
