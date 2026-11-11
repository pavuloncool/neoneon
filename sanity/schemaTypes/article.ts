// sanity/schemaTypes/article.ts
// Pola odpowiadają dawnej tabeli `articles` w Supabase.
// _id artykułów zmigrowanych = dawny UUID z Supabase.
// Wersje PL/EN łączy dokument translation.metadata (wtyczka @sanity/document-internationalization).

import { defineField, defineType } from 'sanity'
import { faqField } from './faqField'
import { categoryRefField } from './category'
import { publishedSlug } from '../slugConflicts'

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
      description:
        'Część adresu artykułu: /{język}/{kategoria}/{slug}. Po publikacji zmiana jest zablokowana — stary adres zwracałby 404.',
      options: { source: 'title', maxLength: 96 },
      validation: (r) =>
        r.required().custom(async (slug, ctx) => {
          if (!slug?.current) return true
          // Wielkie litery w URL-u tworzą duplikaty w Google; proxy.ts i tak przekierowuje na małe litery
          if (slug.current !== slug.current.toLowerCase()) return 'Slug tylko małymi literami'
          // Opublikowany artykuł: zmiana sluga = stary adres 404 (bez przekierowań). Błąd blokuje „Opublikuj”.
          const published = await publishedSlug(ctx.getClient, ctx.document?._id)
          if (published && published !== slug.current) {
            return `Nie można zmienić adresu opublikowanego artykułu: stary adres (i linki do niego) zwracałby 404. Przywróć „${published}”.`
          }
          return true
        }),
    }),
    defineField({
      // Ustawiane przez wtyczkę document-internationalization (languageField: 'locale')
      name: 'locale',
      title: 'Język',
      type: 'string',
      readOnly: true,
      validation: (r) => r.required(),
    }),
    // Kategoria = dokument `category` w tym samym języku; jej slug jest częścią adresu artykułu
    defineField({
      ...categoryRefField(),
      description: 'Kategoria z listy „Kategorie” w tym samym języku. Jej adres jest częścią adresu artykułu.',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'excerpt', title: 'Zajawka', type: 'text', rows: 3 }),
    // Nieobowiązkowe: puste = w wynikach wyszukiwania i udostępnieniach idzie Tytuł / Zajawka
    defineField({
      name: 'seoTitle',
      title: 'Tytuł SEO',
      description: 'Tytuł w Google i w karcie przeglądarki. Puste = użyty zostanie Tytuł. Końcówka z „Ustawień strony” (np. „| neoneon”) dopisze się sama.',
      type: 'string',
      validation: (r) => r.max(60).warning('Google zwykle ucina tytuły dłuższe niż ok. 60 znaków (razem z końcówką).'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Opis SEO',
      description: 'Opis w Google i przy udostępnianiu. Puste = użyta zostanie Zajawka. Zalecane 120–160 znaków.',
      type: 'text',
      rows: 3,
      validation: (r) => r.max(160).warning('Google zwykle ucina opisy dłuższe niż ok. 160 znaków.'),
    }),
    defineField({
      name: 'coverImage',
      title: 'Okładka',
      description: 'Punkt hotspot wyznacza kadrowanie okładki.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'tags', title: 'Tagi', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] }),
    defineField({ name: 'publishedAt', title: 'Data publikacji', type: 'datetime', initialValue: () => new Date().toISOString() }),
    defineField({
      name: 'contentUpdatedAt',
      title: 'Data aktualizacji treści',
      description: 'Ustaw tylko po istotnej zmianie treści. Puste = data publikacji.',
      type: 'datetime',
    }),
    defineField({ name: 'content', title: 'Treść', type: 'blockContent' }),
    faqField,
  ],
  orderings: [{ title: 'Data publikacji', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', locale: 'locale', categorySlug: 'categoryRef.slug.current', media: 'coverImage' },
    prepare: ({ title, locale, categorySlug, media }) => ({ title, subtitle: `${locale?.toUpperCase() ?? '?'} · ${categorySlug ?? ''}`, media }),
  },
})
