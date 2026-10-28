// sanity/schemaTypes/article.ts
// Pola odpowiadają dawnej tabeli `articles` w Supabase.
// _id artykułów zmigrowanych = dawny UUID z Supabase.
// Wersje PL/EN łączy dokument translation.metadata (wtyczka @sanity/document-internationalization).

import { defineField, defineType } from 'sanity'

export const CATEGORIES = [
  { title: 'Content Writing', value: 'content-writing' },
  { title: 'UX Strategies', value: 'ux-strategies' },
  { title: 'Data Visualisation', value: 'data-visualisation' },
]

export const article = defineType({
  name: 'article',
  title: 'Artykuł',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Tytuł', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      // Ustawiane przez wtyczkę document-internationalization (languageField: 'locale')
      name: 'locale',
      title: 'Język',
      type: 'string',
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'string',
      options: { list: CATEGORIES, layout: 'radio' },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'excerpt', title: 'Zajawka', type: 'text', rows: 3 }),
    defineField({
      name: 'coverImage',
      title: 'Okładka',
      description: 'Punkt hotspot wyznacza kadrowanie okładki.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'tags', title: 'Tagi', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] }),
    defineField({ name: 'publishedAt', title: 'Data publikacji', type: 'datetime', initialValue: () => new Date().toISOString() }),
    defineField({ name: 'content', title: 'Treść', type: 'blockContent' }),
  ],
  orderings: [{ title: 'Data publikacji', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', locale: 'locale', category: 'category', media: 'coverImage' },
    prepare: ({ title, locale, category, media }) => ({ title, subtitle: `${locale?.toUpperCase() ?? '?'} · ${category ?? ''}`, media }),
  },
})
