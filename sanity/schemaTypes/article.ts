// sanity/schemaTypes/article.ts
// Pola odpowiadają dawnej tabeli `articles` w Supabase.
// _id artykułów zmigrowanych = dawny UUID z Supabase.
// Wersje PL/EN łączy dokument translation.metadata (wtyczka @sanity/document-internationalization).

import { defineField, defineType } from 'sanity'
import { faqField } from './faqField'
import { LEGACY_CATEGORIES } from '../../lib/categories'
import { DEFAULT_LOCALE } from '../../lib/locales'

// Dotychczasowa lista kategorii (pole „Kategoria”, linki, kafelki) — do usunięcia w etapie 4c
export const CATEGORIES = LEGACY_CATEGORIES.map(({ title, value }) => ({ title, value }))

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
      // Wielkie litery w URL-u tworzą duplikaty w Google; proxy.ts i tak przekierowuje na małe litery
      validation: (r) =>
        r.required().custom((slug) =>
          !slug?.current || slug.current === slug.current.toLowerCase() ? true : 'Slug tylko małymi literami'
        ),
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
    // Okres przejściowy: kategoria jako dokument obok dotychczasowego pola. Strona czyta najpierw to pole,
    // a gdy jest puste — „Kategoria” powyżej. Po przeniesieniu danych zastąpi stare pole.
    defineField({
      name: 'categoryRef',
      title: 'Kategoria (dokument)',
      description: 'Kategoria z listy „Kategorie” w tym samym języku.',
      type: 'reference',
      to: [{ type: 'category' }],
      options: {
        disableNew: true,
        filter: ({ document }) => ({ filter: 'locale == $locale', params: { locale: document?.locale ?? DEFAULT_LOCALE } }),
      },
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
    defineField({ name: 'content', title: 'Treść', type: 'blockContent' }),
    faqField,
  ],
  orderings: [{ title: 'Data publikacji', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', locale: 'locale', category: 'category', categorySlug: 'categoryRef.slug.current', media: 'coverImage' },
    prepare: ({ title, locale, category, categorySlug, media }) => ({ title, subtitle: `${locale?.toUpperCase() ?? '?'} · ${categorySlug ?? category ?? ''}`, media }),
  },
})
