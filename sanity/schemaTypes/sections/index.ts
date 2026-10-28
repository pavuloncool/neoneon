// sanity/schemaTypes/sections/index.ts
// Sekcje page buildera. Każda odpowiada komponentowi w components/sections/.

import { defineArrayMember, defineField, defineType } from 'sanity'
import { CATEGORIES } from '../article'

// Prosta treść sekcji (akapity, pogrubienie, kursywa, linki)
const simpleText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [{ title: 'Akapit', value: 'normal' }],
        lists: [],
        marks: {
          decorators: [
            { title: 'Pogrubienie', value: 'strong' },
            { title: 'Kursywa', value: 'em' },
          ],
          annotations: [
            defineArrayMember({
              name: 'link',
              title: 'Link',
              type: 'object',
              fields: [defineField({ name: 'href', title: 'URL', type: 'url', validation: (r) => r.uri({ scheme: ['http', 'https', 'mailto'], allowRelative: true }) })],
            }),
          ],
        },
      }),
    ],
  })

export const hero = defineType({
  name: 'hero',
  title: 'Nagłówek strony',
  type: 'object',
  fields: [
    defineField({
      name: 'variant',
      title: 'Wygląd',
      type: 'string',
      options: { list: [{ title: 'Duży (strona główna)', value: 'large' }, { title: 'Podstrona', value: 'page' }], layout: 'radio' },
      initialValue: 'page',
    }),
    defineField({ name: 'eyebrow', title: 'Etykieta nad tytułem', type: 'string' }),
    defineField({ name: 'heading', title: 'Tytuł', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'headingEmphasis', title: 'Druga linia tytułu (kursywa)', type: 'string', hidden: ({ parent }) => parent?.variant !== 'large' }),
  ],
  preview: { select: { title: 'heading', subtitle: 'eyebrow' }, prepare: ({ title, subtitle }) => ({ title: `Nagłówek: ${title ?? ''}`, subtitle }) },
})

export const categoryTiles = defineType({
  name: 'categoryTiles',
  title: 'Kafelki kategorii',
  type: 'object',
  fields: [
    defineField({ name: 'ariaLabel', title: 'Etykieta sekcji dla czytników ekranu', type: 'string' }),
    defineField({ name: 'eyebrow', title: 'Etykieta na kafelkach', description: 'Np. „Kategoria”.', type: 'string' }),
    defineField({
      name: 'tiles',
      title: 'Kafelki',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tile',
          fields: [
            defineField({ name: 'category', title: 'Kategoria', type: 'string', options: { list: CATEGORIES }, validation: (r) => r.required() }),
            defineField({ name: 'title', title: 'Nazwa na kafelku', type: 'string', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'title', subtitle: 'category' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Kafelki kategorii' }) },
})

export const recentArticles = defineType({
  name: 'recentArticles',
  title: 'Najnowsze artykuły',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Nagłówek', type: 'string' }),
    defineField({ name: 'limit', title: 'Liczba artykułów', type: 'number', initialValue: 6, validation: (r) => r.min(1).max(24).integer() }),
  ],
  preview: { select: { title: 'heading', limit: 'limit' }, prepare: ({ title, limit }) => ({ title: `Najnowsze artykuły: ${title ?? ''}`, subtitle: `${limit ?? 6} szt.` }) },
})

export const textImage = defineType({
  name: 'textImage',
  title: 'Tekst ze zdjęciem',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Zdjęcie',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Tekst alternatywny', type: 'string' })],
    }),
    simpleText('body', 'Treść'),
    defineField({ name: 'ctaLabel', title: 'Link pod tekstem — etykieta', type: 'string' }),
    defineField({ name: 'ctaLink', title: 'Link pod tekstem — cel', type: 'link' }),
  ],
  preview: { select: { media: 'image' }, prepare: ({ media }) => ({ title: 'Tekst ze zdjęciem', media }) },
})

export const featureGrid = defineType({
  name: 'featureGrid',
  title: 'Siatka obszarów',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Etykieta sekcji', type: 'string' }),
    defineField({
      name: 'items',
      title: 'Elementy',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          fields: [
            defineField({ name: 'title', title: 'Tytuł', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: 'Opis', type: 'text', rows: 3 }),
          ],
        }),
      ],
    }),
  ],
  preview: { select: { title: 'label' }, prepare: ({ title }) => ({ title: `Siatka: ${title ?? ''}` }) },
})

export const contactForm = defineType({
  name: 'contactForm',
  title: 'Formularz kontaktowy',
  description: 'Etykiety pól i komunikaty formularza edytujesz w „Teksty interfejsu”.',
  type: 'object',
  fields: [simpleText('intro', 'Tekst obok formularza')],
  preview: { prepare: () => ({ title: 'Formularz kontaktowy' }) },
})

export const richText = defineType({
  name: 'richText',
  title: 'Tekst',
  type: 'object',
  fields: [defineField({ name: 'body', title: 'Treść', type: 'blockContent' })],
  preview: { prepare: () => ({ title: 'Tekst' }) },
})

export const SECTION_TYPES = ['hero', 'categoryTiles', 'recentArticles', 'textImage', 'featureGrid', 'contactForm', 'richText']
export const sectionSchemas = [hero, categoryTiles, recentArticles, textImage, featureGrid, contactForm, richText]
