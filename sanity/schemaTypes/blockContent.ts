// sanity/schemaTypes/blockContent.ts
// Treść artykułu (Portable Text). Odpowiada węzłom, które obsługiwał TiptapRenderer.

import { defineArrayMember, defineField, defineType } from 'sanity'
import { CodeIcon } from '@sanity/icons/Code'
import { CodeBlockIcon } from '@sanity/icons/CodeBlock'
import { ImageIcon } from '@sanity/icons/Image'
import { PlayIcon } from '@sanity/icons/Play'
import { RemoveIcon } from '@sanity/icons/Remove'
import { EMBED_PROVIDER_NAMES, parseEmbedUrl } from '@/lib/embeds'

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Treść',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Akapit', value: 'normal' },
        { title: 'Nagłówek H2', value: 'h2' },
        { title: 'Nagłówek H3', value: 'h3' },
        { title: 'Cytat', value: 'blockquote' },
      ],
      lists: [
        { title: 'Punktowana', value: 'bullet' },
        { title: 'Numerowana', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Pogrubienie', value: 'strong' },
          { title: 'Kursywa', value: 'em' },
          { title: 'Kod', value: 'code' },
          { title: 'Przekreślenie', value: 'strike-through' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (r) => r.uri({ scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true }),
              }),
              defineField({ name: 'blank', title: 'Otwórz w nowej karcie', type: 'boolean', initialValue: true }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      fields: [defineField({ name: 'alt', title: 'Tekst alternatywny', type: 'string' })],
    }),
    defineArrayMember({
      name: 'divider',
      title: 'Linia pozioma',
      type: 'object',
      icon: RemoveIcon,
      fields: [defineField({ name: 'style', type: 'string', hidden: true, initialValue: 'line' })],
      preview: { prepare: () => ({ title: '— linia pozioma —' }) },
    }),
    defineArrayMember({
      name: 'mediaEmbed',
      title: 'Media z linku (YouTube, Instagram…)',
      type: 'object',
      icon: PlayIcon,
      fields: [
        defineField({
          name: 'url',
          title: 'Link',
          description: `Wklej zwykły link do filmu lub posta. Obsługiwane: ${Object.values(EMBED_PROVIDER_NAMES).join(', ')}.`,
          type: 'url',
          validation: (r) =>
            r.required().custom((url) =>
              !url || parseEmbedUrl(url)
                ? true
                : 'Nie rozpoznaję tego linku. Sprawdź, czy prowadzi do konkretnego filmu/posta — albo użyj bloku „Kod HTML (embed)”.'
            ),
        }),
        defineField({ name: 'caption', title: 'Podpis (opcjonalnie)', type: 'string' }),
      ],
      preview: {
        select: { url: 'url', caption: 'caption' },
        prepare: ({ url, caption }) => {
          const parsed = parseEmbedUrl(url)
          return {
            title: parsed ? EMBED_PROVIDER_NAMES[parsed.provider] : 'Media (nierozpoznany link)',
            subtitle: caption || url,
          }
        },
      },
    }),
    defineArrayMember({
      name: 'embed',
      title: 'Kod HTML (embed)',
      description: 'Dla serwisów spoza listy „Media z linku” — wklej cały kod osadzenia (iframe/blockquote).',
      type: 'object',
      icon: CodeBlockIcon,
      fields: [defineField({ name: 'html', title: 'Kod HTML', type: 'text', rows: 6, validation: (r) => r.required() })],
      preview: { select: { title: 'html' }, prepare: ({ title }) => ({ title: 'Kod HTML (embed)', subtitle: title?.slice(0, 80) }) },
    }),
    defineArrayMember({
      name: 'codeBlock',
      title: 'Blok kodu',
      type: 'object',
      icon: CodeIcon,
      fields: [
        defineField({ name: 'language', title: 'Język', type: 'string' }),
        defineField({ name: 'code', title: 'Kod', type: 'text', rows: 8 }),
      ],
      preview: { select: { title: 'language', subtitle: 'code' } },
    }),
  ],
  // Menu „+ Wstaw” w pasku narzędzi edytora: ikony + opcjonalny widok siatki
  options: { insertMenu: { showIcons: true, views: [{ name: 'list' }, { name: 'grid' }] } },
})
