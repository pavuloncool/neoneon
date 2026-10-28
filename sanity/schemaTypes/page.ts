// sanity/schemaTypes/page.ts
// Strona z page buildera: /{locale} (strona główna) albo /{locale}/{slug}.
// Wersje PL/EN łączy wtyczka document-internationalization (jak artykuły).

import { defineArrayMember, defineField, defineType, type SlugValidationContext } from 'sanity'
import { CATEGORIES } from './article'
import { SECTION_TYPES } from './sections'

// Adresy zajęte przez kategorie i trasy aplikacji
export const RESERVED_SLUGS = [...CATEGORIES.map((c) => c.value), 'search', 'studio', 'api', 'home']

// Slug unikalny w obrębie języka — /pl/about i /en/about mogą istnieć jednocześnie
async function isUniqueInLocale(slug: string, context: SlugValidationContext) {
  const { document, getClient } = context
  const id = (document?._id ?? '').replace(/^drafts\./, '')
  return getClient({ apiVersion: '2025-02-19' }).fetch<boolean>(
    '!defined(*[_type == "page" && slug.current == $slug && locale == $locale && !(_id in [$id, $draft])][0]._id)',
    { slug, locale: document?.locale ?? 'pl', id, draft: `drafts.${id}` }
  )
}

export const page = defineType({
  name: 'page',
  title: 'Strona',
  type: 'document',
  groups: [
    { name: 'content', title: 'Treść', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Nazwa strony (w Studio)', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({
      // Ustawiane przez wtyczkę document-internationalization (languageField: 'locale')
      name: 'locale',
      title: 'Język',
      type: 'string',
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'isHome',
      title: 'Strona główna',
      description: 'Zaznacz tylko dla jednej strony w każdym języku.',
      type: 'boolean',
      initialValue: false,
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Adres (slug)',
      description: 'Strona będzie pod /pl/{slug} lub /en/{slug}.',
      type: 'slug',
      group: 'content',
      hidden: ({ document }) => Boolean(document?.isHome),
      options: { source: 'title', maxLength: 64, isUnique: isUniqueInLocale },
      validation: (r) =>
        r.custom((value, ctx) => {
          if ((ctx.document as { isHome?: boolean })?.isHome) return true
          if (!value?.current) return 'Podaj adres strony'
          if (RESERVED_SLUGS.includes(value.current)) return `Adres „${value.current}” jest zajęty przez kategorię lub funkcję strony`
          return true
        }),
    }),
    defineField({
      name: 'width',
      title: 'Szerokość treści',
      type: 'string',
      options: { list: [{ title: 'Szeroka', value: 'wide' }, { title: 'Wąska', value: 'narrow' }], layout: 'radio', direction: 'horizontal' },
      initialValue: 'narrow',
      group: 'content',
    }),
    defineField({
      name: 'sections',
      title: 'Sekcje',
      description: 'Kolejność ustawisz, przeciągając sekcje.',
      type: 'array',
      group: 'content',
      of: SECTION_TYPES.map((type) => defineArrayMember({ type })),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({ name: 'title', title: 'Tytuł w karcie przeglądarki', description: 'Puste = tytuł domyślny z ustawień strony.', type: 'string' }),
        defineField({ name: 'description', title: 'Opis', type: 'text', rows: 3 }),
        defineField({ name: 'image', title: 'Obrazek do udostępnień', type: 'image' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', locale: 'locale', isHome: 'isHome' },
    prepare: ({ title, slug, locale, isHome }) => ({
      title,
      subtitle: `${String(locale ?? '').toUpperCase()} · ${isHome ? 'strona główna' : `/${slug ?? ''}`}`,
    }),
  },
})
