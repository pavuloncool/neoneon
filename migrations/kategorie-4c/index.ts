// migrations/kategorie-4c/index.ts
// Porządki techniczne, etap 4c: usunięcie starych pól tekstowych kategorii (lista z kodu).
//  - article: pole `category`;
//  - siteSettings: `link.category` w menu (navigation) i stopce (footerLinks);
//  - page: `ctaLink.category` w sekcji „Tekst ze zdjęciem” i `category` w kafelkach „Kafelki kategorii”.
// Opublikowane dokumenty i szkice. Kod od etapu 4c już tych pól nie czyta.
//
// Zabezpieczenie: każde usuwane pole musi mieć obok `categoryRef` = category-{stara wartość}-{język}
// (stan po 4b-1 i 4b-2). Inaczej przerwanie bez zapisu.
// Jedna transakcja, każdy dokument z ifRevision. Idempotentna: miejsca bez starego pola są pomijane.
//
// Dry run (domyślnie):  npx sanity migration run kategorie-4c
// Wykonanie:            npx sanity migration run kategorie-4c --no-dry-run   (TYLKO po zgodzie)

import { at, defineMigration, patch, transaction, unset, type Mutation, type NodePatch } from 'sanity/migrate'

type Ref = { _ref?: string } | undefined
type Link = { linkType?: string; category?: string; categoryRef?: Ref }
type Keyed = { _key: string }
type NavItem = Keyed & { link?: Link }
type Tile = Keyed & { category?: string; categoryRef?: Ref }
type Section = Keyed & { _type: string; ctaLink?: Link; tiles?: Tile[] }
type PathSegment = string | { _key: string }

export default defineMigration({
  title: 'Etap 4c: usunięcie starych pól tekstowych kategorii (artykuły, linki, kafelki)',
  documentTypes: ['article', 'siteSettings', 'page'],

  async *migrate(documents) {
    const mutations: Mutation[] = []

    for await (const doc of documents()) {
      const locale = doc.locale as string | undefined
      const ops: NodePatch[] = []

      const drop = (where: string, value: string | undefined, ref: Ref, path: PathSegment[]) => {
        if (value === undefined) return
        const expected = `category-${value}-${locale}`
        if (ref?._ref !== expected) {
          throw new Error(`${doc._id} (${where}): stara wartość „${value}”, a categoryRef „${ref?._ref}” (oczekiwano „${expected}”)`)
        }
        ops.push(at([...path, 'category'], unset()))
      }

      if (doc._type === 'article') {
        drop('category', doc.category as string | undefined, doc.categoryRef as Ref, [])
      }
      if (doc._type === 'siteSettings') {
        for (const field of ['navigation', 'footerLinks'] as const) {
          for (const item of (doc[field] as NavItem[] | undefined) ?? []) {
            drop(`${field}[${item._key}]`, item.link?.category, item.link?.categoryRef, [field, { _key: item._key }, 'link'])
          }
        }
      }
      if (doc._type === 'page') {
        for (const section of (doc.sections as Section[] | undefined) ?? []) {
          if (section.ctaLink) {
            drop(`sections[${section._key}].ctaLink`, section.ctaLink.category, section.ctaLink.categoryRef, ['sections', { _key: section._key }, 'ctaLink'])
          }
          for (const tile of section.tiles ?? []) {
            drop(`sections[${section._key}].tiles[${tile._key}]`, tile.category, tile.categoryRef, ['sections', { _key: section._key }, 'tiles', { _key: tile._key }])
          }
        }
      }

      if (ops.length) mutations.push(patch(doc._id, ops, { ifRevision: doc._rev }))
    }

    if (mutations.length) yield transaction(mutations)
  },
})
