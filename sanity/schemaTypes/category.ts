// sanity/schemaTypes/category.ts
// Kategoria artykułów: /{locale}/{slug}. Wersje PL/EN łączy wtyczka document-internationalization
// (jak artykuły i strony). Zmiana sluga opublikowanej kategorii jest możliwa tylko przez akcję
// „Opublikuj (zmiana adresu)” (sanity/actions/categoryPublish.tsx): stary slug trafia do `previousSlugs`,
// a strona przekierowuje stare adresy (kategorii i jej artykułów) na nowe — 308.

import { defineField, defineType } from 'sanity'
import { DEFAULT_LOCALE } from '../../lib/locales'
import { APP_RESERVED_SLUGS } from '../../lib/categories'
import { publishedSlug, slugTaken } from '../slugConflicts'

// Początek komunikatu walidacji przy zmianie sluga bez akcji publikacji — akcja rozpoznaje po nim,
// że jedynym błędem jest właśnie zmiana adresu, i wtedy pozwala opublikować (dopisując stary slug).
export const SLUG_CHANGE_MESSAGE = 'Zmiana adresu opublikowanej kategorii'

// Unikalność sluga sprawdza walidacja pola (z polskim komunikatem, w obrębie języka i z poprzednimi adresami),
// więc domyślne sprawdzenie Sanity („Slug is already in use”, bez podziału na języki) jest wyłączone.
const skipDefaultUniqueCheck = () => true

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
        'Kategoria będzie pod /pl/{slug} lub /en/{slug}. Zmiana sluga zmienia adresy strony kategorii i wszystkich jej artykułów — po publikacji przyciskiem „Opublikuj (zmiana adresu)” stare adresy przekierowują (308) na nowe.',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 64, isUnique: skipDefaultUniqueCheck },
      validation: (r) =>
        r.required().custom(async (value, ctx) => {
          const slug = value?.current
          if (!slug) return true
          // Wielkie litery w URL-u tworzą duplikaty w Google; proxy.ts i tak przekierowuje na małe litery
          if (slug !== slug.toLowerCase()) return 'Slug tylko małymi literami'
          if (APP_RESERVED_SLUGS.includes(slug)) return `Adres „${slug}” jest zajęty przez funkcję strony`
          // Opublikowana kategoria: zmiana sluga jest dozwolona tylko wtedy, gdy stary slug jest w `previousSlugs`
          // (wtedy strona przekierowuje stare adresy). Dopisuje go akcja publikacji — bez niej błąd blokuje publikację.
          const published = await publishedSlug(ctx.getClient, ctx.document?._id)
          const previous = ((ctx.document as { previousSlugs?: string[] })?.previousSlugs ?? [])
          if (published && published !== slug && !previous.includes(published)) {
            return `${SLUG_CHANGE_MESSAGE} z „${published}” na „${slug}”: użyj przycisku „Opublikuj (zmiana adresu)” — stary adres trafi do poprzednich adresów i będzie przekierowany (308). Bez zmiany adresu: przywróć „${published}”.`
          }
          const locale = String(ctx.document?.locale ?? DEFAULT_LOCALE)
          if (await slugTaken(ctx.getClient, 'category', slug, locale, ctx.document?._id)) {
            return 'Ten adres jest już używany przez inną kategorię w tym języku (obecny lub poprzedni adres).'
          }
          if (await slugTaken(ctx.getClient, 'page', slug, locale, undefined)) return `Adres „${slug}” ma już strona w tym języku`
          return true
        }),
    }),
    defineField({
      name: 'previousSlugs',
      title: 'Poprzednie adresy',
      description: 'Dawne slugi tej kategorii — strona przekierowuje je (308) na obecny adres. Uzupełnia je akcja „Opublikuj (zmiana adresu)”.',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
      group: 'content',
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
