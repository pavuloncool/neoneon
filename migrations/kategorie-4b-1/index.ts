// migrations/kategorie-4b-1/index.ts
// Porządki techniczne, etap 4b-1: kategorie z kodu → dokumenty `category` w Sanity.
//
//  - tworzy 4 dokumenty `category` (Content Writing / UX Strategies × PL / EN) — nazwy z dokumentów
//    uiStrings (dzisiejsze H1 stron kategorii), slugi 1:1 z adresami, opisy puste, `order` jak w menu;
//  - tworzy 2 dokumenty `translation.metadata` łączące wersje PL ↔ EN (jak wtyczka tłumaczeń);
//  - w każdym artykule (opublikowanym i szkicu) ustawia `categoryRef` na kategorię w jego języku.
//    Pole `category` zostaje bez zmian (usunięcie w etapie 4c).
//  Bez Data Visualisation (brak artykułów — po 4c adres zwróci 404).
//
// Wszystko w JEDNEJ transakcji (atomowo; referencje do kategorii tworzonych w tej samej transakcji).
// Idempotentna: createIfNotExists, a artykuły z ustawionym `categoryRef` są pomijane.
// Patch artykułu z ifRevision — jeśli ktoś zmieni artykuł w trakcie, transakcja się nie wykona.
//
// Dry run (domyślnie):  npx sanity migration run kategorie-4b-1
// Wykonanie:            npx sanity migration run kategorie-4b-1 --no-dry-run   (TYLKO po zgodzie)

import { at, createIfNotExists, defineMigration, patch, set, transaction, type Mutation } from 'sanity/migrate'

type Locale = 'pl' | 'en'
type Slug = 'content-writing' | 'ux-strategies'

// Nazwy = uiStrings-pl / uiStrings-en, pole nav.* (stan z 2026-11-10); kolejność = menu w siteSettings
const CATEGORIES: { slug: Slug; order: number; title: Record<Locale, string> }[] = [
  { slug: 'content-writing', order: 1, title: { pl: 'Tworzenie treści', en: 'Content Writing' } },
  { slug: 'ux-strategies', order: 2, title: { pl: 'Strategie UX', en: 'UX Strategies' } },
]
const LOCALES: Locale[] = ['pl', 'en']

export const categoryId = (slug: string, locale: string) => `category-${slug}-${locale}`
const translationId = (slug: string) => `translation-category-${slug}`

export default defineMigration({
  title: 'Etap 4b-1: dokumenty category PL/EN, powiązania tłumaczeń, categoryRef w artykułach',
  documentTypes: ['article'],

  async *migrate(documents) {
    const mutations: Mutation[] = []

    for (const c of CATEGORIES) {
      for (const locale of LOCALES) {
        mutations.push(
          createIfNotExists({
            _id: categoryId(c.slug, locale),
            _type: 'category',
            title: c.title[locale],
            slug: { _type: 'slug', current: c.slug },
            locale,
            order: c.order,
          })
        )
      }
      mutations.push(
        createIfNotExists({
          _id: translationId(c.slug),
          _type: 'translation.metadata',
          schemaTypes: ['category'],
          translations: LOCALES.map((locale) => ({
            _key: locale,
            _type: 'internationalizedArrayReferenceValue',
            language: locale,
            value: { _type: 'reference', _ref: categoryId(c.slug, locale) },
          })),
        })
      )
    }

    const known = new Set(CATEGORIES.map((c) => c.slug))
    for await (const doc of documents()) {
      const category = doc.category as string | undefined
      const locale = doc.locale as string | undefined
      if (doc.categoryRef) continue // już przeniesiony
      if (!category || !known.has(category as Slug) || !locale || !LOCALES.includes(locale as Locale)) {
        // Nieoczekiwane dane (np. Data Visualisation albo brak języka) — przerwij, zamiast migrować częściowo
        throw new Error(`Artykuł ${doc._id}: nieobsługiwana kategoria „${category}” albo język „${locale}”`)
      }
      mutations.push(
        patch(doc._id, [at('categoryRef', set({ _type: 'reference', _ref: categoryId(category, locale) }))], {
          ifRevision: doc._rev,
        })
      )
    }

    yield transaction(mutations)
  },
})
