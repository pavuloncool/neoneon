// migrations/kategorie-4b-2/index.ts
// Porządki techniczne, etap 4b-2: kategorie w linkach i kafelkach → referencje do dokumentów `category`.
//
//  - siteSettings: każdy link „Kategoria” w menu (navigation) i stopce (footerLinks) dostaje `categoryRef`;
//  - page: przycisk sekcji „Tekst ze zdjęciem” (ctaLink) prowadzący do kategorii i każdy kafelek sekcji
//    „Kafelki kategorii” dostają `categoryRef`.
//  Referencja = kategoria o tym samym slugu w języku dokumentu (category-{slug}-{locale}, z etapu 4b-1).
//  Obejmuje opublikowane dokumenty i szkice. Stare pole `category` zostaje (usunięcie w etapie 4c).
//
// Wszystko w JEDNEJ transakcji, każdy dokument z ifRevision. Idempotentna: miejsca z ustawionym
// `categoryRef` są pomijane. Nieznana kategoria albo język = przerwanie bez zapisu.
//
// Dry run (domyślnie):  npx sanity migration run kategorie-4b-2
// Wykonanie:            npx sanity migration run kategorie-4b-2 --no-dry-run   (TYLKO po zgodzie)

import { at, defineMigration, patch, set, transaction, type Mutation, type NodePatch } from 'sanity/migrate'

const KNOWN = new Set(['content-writing', 'ux-strategies']) // kategorie utworzone w 4b-1
const LOCALES = new Set(['pl', 'en'])

type Link = { linkType?: string; category?: string; categoryRef?: unknown }
type Keyed = { _key: string }
type NavItem = Keyed & { link?: Link }
type Tile = Keyed & { category?: string; categoryRef?: unknown }
type Section = Keyed & { _type: string; ctaLink?: Link; tiles?: Tile[] }
type PathSegment = string | { _key: string }

export default defineMigration({
  title: 'Etap 4b-2: categoryRef w linkach (menu, stopka, CTA) i kafelkach kategorii',
  documentTypes: ['siteSettings', 'page'],

  async *migrate(documents) {
    const mutations: Mutation[] = []

    for await (const doc of documents()) {
      const locale = doc.locale as string | undefined
      const ops: NodePatch[] = []

      const ref = (where: string, slug: string | undefined, path: PathSegment[]) => {
        if (!slug || !KNOWN.has(slug) || !locale || !LOCALES.has(locale)) {
          throw new Error(`${doc._id} (${where}): nieobsługiwana kategoria „${slug}” albo język „${locale}”`)
        }
        ops.push(at([...path, 'categoryRef'], set({ _type: 'reference', _ref: `category-${slug}-${locale}` })))
      }

      if (doc._type === 'siteSettings') {
        for (const field of ['navigation', 'footerLinks'] as const) {
          for (const item of (doc[field] as NavItem[] | undefined) ?? []) {
            const link = item.link
            if (link?.linkType !== 'category' || link.categoryRef) continue
            ref(`${field}[${item._key}]`, link.category, [field, { _key: item._key }, 'link'])
          }
        }
      }

      if (doc._type === 'page') {
        for (const section of (doc.sections as Section[] | undefined) ?? []) {
          if (section._type === 'textImage' && section.ctaLink?.linkType === 'category' && !section.ctaLink.categoryRef) {
            ref(`sections[${section._key}].ctaLink`, section.ctaLink.category, ['sections', { _key: section._key }, 'ctaLink'])
          }
          if (section._type === 'categoryTiles') {
            for (const tile of section.tiles ?? []) {
              if (tile.categoryRef) continue
              ref(`sections[${section._key}].tiles[${tile._key}]`, tile.category, ['sections', { _key: section._key }, 'tiles', { _key: tile._key }])
            }
          }
        }
      }

      if (ops.length) mutations.push(patch(doc._id, ops, { ifRevision: doc._rev }))
    }

    if (mutations.length) yield transaction(mutations)
  },
})
