// sanity/schemaTypes/category.ts
// Kategoria artykułów: /{locale}/{slug}. Wersje PL/EN łączy wtyczka document-internationalization
// (jak artykuły i strony). Slug musi zostać taki jak dotychczasowy adres kategorii — zmiana slugu
// to zmiana adresu zaindeksowanego w Google.

import { defineField, defineType, type SlugValidationContext } from 'sanity'
import { DEFAULT_LOCALE } from '../../lib/locales'
import { APP_RESERVED_SLUGS } from '../../lib/categories'
import { publishedSlug, slugTaken } from '../slugConflicts'

// Slug unikalny wśród kategorii w obrębie języka
async function isUniqueCategorySlug(slug: string, context: SlugValidationContext) {
  const { document, getClient } = context
  return !(await slugTaken(getClient, 'category', slug, String(document?.locale ?? DEFAULT_LOCALE), document?._id))
}

// Pole `categoryRef` (artykuł, link, kafelek): tylko kategorie w języku edytowanego dokumentu
export const categoryRefField = () =>
  defineField({
    name: 'categoryRef',
    title: 'Kategoria',
    description: 'Kategoria z listy „Kategorie” w tym samym języku.',
    type: 'reference',
    to: [{ type: 'category' }],
    options: {
      disableNew: true,
      filter: ({ document }) => ({ filter: 'locale == $locale', params: { locale: document?.locale ?? DEFAULT_LOCALE } }),
    },
  })

export const category = defineType({
  name: 'category',
  title: 'Kategoria',
  type: 'document',
  groups: [
    { name: 'content', title: 'Treść', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Nazwa', description: 'Nagłówek strony kategorii i etykieta nad artykułem.', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Adres (slug)',
      description:
        'Kategoria będzie pod /pl/{slug} lub /en/{slug}. Zmiana sluga zmienia adresy strony kategorii i wszystkich artykułów tej kategorii — dlatego po publikacji jest zablokowana.',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 64, isUnique: isUniqueCategorySlug },
      validation: (r) =>
        r.required().custom(async (value, ctx) => {
          const slug = value?.current
          if (!slug) return true
          // Wielkie litery w URL-u tworzą duplikaty w Google; proxy.ts i tak przekierowuje na małe litery
          if (slug !== slug.toLowerCase()) return 'Slug tylko małymi literami'
          if (APP_RESERVED_SLUGS.includes(slug)) return `Adres „${slug}” jest zajęty przez funkcję strony`
          // Opublikowana kategoria: zmiana sluga zmieniłaby adresy jej strony i wszystkich artykułów (404 bez
          // przekierowań). Błąd walidacji blokuje „Opublikuj”. Zmiana z przekierowaniami — etap 6.
          const published = await publishedSlug(ctx.getClient, ctx.document?._id)
          if (published && published !== slug) {
            return `Nie można zmienić adresu opublikowanej kategorii: zmieniłyby się adresy strony kategorii i wszystkich jej artykułów (stare adresy zwracałyby 404). Przywróć „${published}”.`
          }
          const locale = String(ctx.document?.locale ?? DEFAULT_LOCALE)
          if (await slugTaken(ctx.getClient, 'page', slug, locale, undefined)) return `Adres „${slug}” ma już strona w tym języku`
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
    defineField({ name: 'description', title: 'Opis', description: 'Nieobowiązkowy. Puste Opis SEO = ten opis.', type: 'text', rows: 3, group: 'content' }),
    defineField({ name: 'order', title: 'Kolejność', description: 'Mniejsza liczba = wyżej na listach w Studio.', type: 'number', group: 'content', validation: (r) => r.integer() }),
    // Nieobowiązkowe, jak w artykule: puste = w wynikach wyszukiwania idzie Nazwa / Opis
    defineField({
      name: 'seoTitle',
      title: 'Tytuł SEO',
      description: 'Tytuł w Google i w karcie przeglądarki. Puste = użyta zostanie Nazwa. Końcówka z „Ustawień strony” (np. „| neoneon”) dopisze się sama.',
      type: 'string',
      group: 'seo',
      validation: (r) => r.max(60).warning('Google zwykle ucina tytuły dłuższe niż ok. 60 znaków (razem z końcówką).'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Opis SEO',
      description: 'Opis w Google i przy udostępnianiu. Puste = użyty zostanie Opis. Zalecane 120–160 znaków.',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (r) => r.max(160).warning('Google zwykle ucina opisy dłuższe niż ok. 160 znaków.'),
    }),
  ],
  orderings: [{ title: 'Kolejność', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }, { field: 'title', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', slug: 'slug.current', locale: 'locale' },
    prepare: ({ title, slug, locale }) => ({ title, subtitle: `${String(locale ?? '').toUpperCase()} · /${slug ?? ''}` }),
  },
})
