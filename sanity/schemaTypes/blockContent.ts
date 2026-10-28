// sanity/schemaTypes/blockContent.ts
// Treść artykułu (Portable Text). Odpowiada węzłom, które obsługiwał TiptapRenderer.

import { defineArrayMember, defineField, defineType } from 'sanity'

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
      fields: [defineField({ name: 'alt', title: 'Tekst alternatywny', type: 'string' })],
    }),
    defineArrayMember({
      name: 'divider',
      title: 'Linia pozioma',
      type: 'object',
      fields: [defineField({ name: 'style', type: 'string', hidden: true, initialValue: 'line' })],
      preview: { prepare: () => ({ title: '— linia pozioma —' }) },
    }),
    defineArrayMember({
      name: 'youtube',
      title: 'YouTube',
      type: 'object',
      fields: [defineField({ name: 'url', title: 'URL filmu (embed)', type: 'url', validation: (r) => r.required() })],
      preview: { select: { title: 'url' }, prepare: ({ title }) => ({ title: 'YouTube', subtitle: title }) },
    }),
    defineArrayMember({
      name: 'embed',
      title: 'Embed (HTML)',
      description: 'Kod osadzenia z Instagrama, X itp. — wklej cały fragment HTML.',
      type: 'object',
      fields: [defineField({ name: 'html', title: 'Kod HTML', type: 'text', rows: 6, validation: (r) => r.required() })],
      preview: { select: { title: 'html' }, prepare: ({ title }) => ({ title: 'Embed', subtitle: title?.slice(0, 80) }) },
    }),
    defineArrayMember({
      name: 'codeBlock',
      title: 'Blok kodu',
      type: 'object',
      fields: [
        defineField({ name: 'language', title: 'Język', type: 'string' }),
        defineField({ name: 'code', title: 'Kod', type: 'text', rows: 8 }),
      ],
      preview: { select: { title: 'language', subtitle: 'code' } },
    }),
  ],
})
