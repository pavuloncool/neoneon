// sanity/schemaTypes/page.ts
// Strona z page buildera: /{locale} (strona główna) albo /{locale}/{slug}.
// Wersje PL/EN łączy wtyczka document-internationalization (jak artykuły).

import { defineArrayMember, defineField, defineType, type SlugValidationContext } from 'sanity'
import { CATEGORIES } from './article'
import { SECTION_TYPES } from './sections'
import { DEFAULT_LOCALE } from '../../lib/locales'
import { APP_RESERVED_SLUGS } from '../../lib/categories'
import { slugTaken } from '../slugConflicts'

// Adresy zajęte przez trasy aplikacji i (do etapu 4c) dotychczasowe kategorie z kodu
export const RESERVED_SLUGS = [...CATEGORIES.map((c) => c.value), ...APP_RESERVED_SLUGS]

// Slug unikalny w obrębie języka — /pl/about i /en/about mogą istnieć jednocześnie
async function isUniqueInLocale(slug: string, context: SlugValidationContext) {
  const { document, getClient } = context
  return !(await slugTaken(getClient, 'page', slug, String(document?.locale ?? DEFAULT_LOCALE), document?._id))
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
        r.custom(async (value, ctx) => {
          if ((ctx.document as { isHome?: boolean })?.isHome) return true
          if (!value?.current) return 'Podaj adres strony'
          if (RESERVED_SLUGS.includes(value.current)) return `Adres „${value.current}” jest zajęty przez kategorię lub funkcję strony`
          const locale = String(ctx.document?.locale ?? DEFAULT_LOCALE)
          if (await slugTaken(ctx.getClient, 'category', value.current, locale, undefined)) return `Adres „${value.current}” ma już kategoria w tym języku`
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
        defineField({ name: 'title', title: 'Tytuł w karcie przeglądarki', description: 'Do 60 znaków. Puste = tytuł strony (na stronie głównej — tytuł domyślny z ustawień).', type: 'string', validation: (r) => r.max(60).warning('Google zwykle ucina tytuły dłuższe niż ok. 60 znaków.') }),
        defineField({ name: 'description', title: 'Opis', description: 'Pokazywany w wynikach wyszukiwania i przy udostępnianiu. Zalecane 120–160 znaków.', type: 'text', rows: 3, validation: (r) => r.max(160).warning('Google zwykle ucina opisy dłuższe niż ok. 160 znaków.') }),
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
