// migrations/kategorie-4c-wycofanie/index.ts
// Wycofanie migracji kategorie-4c: odtwarza stare pola tekstowe `category` z referencji
// (categoryRef = category-{slug}-{język} → category = {slug}) w artykułach, linkach i kafelkach.
// Działa tylko dla identyfikatorów kategorii utworzonych w 4b-1; inne = przerwanie bez zapisu.
// Uwaga: stary kod (przed 4c) i tak działa bez tych pól (coalesce), ale jego Studio wymaga pola
// `category` w artykule — stąd to wycofanie przy powrocie do kodu sprzed 4c.
//
// Dry run:   npx sanity migration run kategorie-4c-wycofanie
// Wykonanie: npx sanity migration run kategorie-4c-wycofanie --no-dry-run   (TYLKO po zgodzie)

import { at, defineMigration, patch, set, transaction, type Mutation, type NodePatch } from 'sanity/migrate'

type Ref = { _ref?: string } | undefined
type Keyed = { _key: string }
type Link = { linkType?: string; category?: string; categoryRef?: Ref }
type Section = Keyed & { _type: string; ctaLink?: Link; tiles?: (Keyed & { category?: string; categoryRef?: Ref })[] }
type PathSegment = string | { _key: string }

const SLUG_FROM_ID = /^category-(content-writing|ux-strategies)-(pl|en)$/

export default defineMigration({
  title: 'Wycofanie 4c: odtworzenie pól category z categoryRef',
  documentTypes: ['article', 'siteSettings', 'page'],

  async *migrate(documents) {
    const mutations: Mutation[] = []
    for await (const doc of documents()) {
      const ops: NodePatch[] = []
      const restore = (where: string, value: string | undefined, ref: Ref, path: PathSegment[]) => {
        if (value !== undefined || !ref?._ref) return
        const m = SLUG_FROM_ID.exec(ref._ref)
        if (!m) throw new Error(`${doc._id} (${where}): nieznana kategoria „${ref._ref}”`)
        ops.push(at([...path, 'category'], set(m[1])))
      }
      if (doc._type === 'article') restore('category', doc.category as string | undefined, doc.categoryRef as Ref, [])
      if (doc._type === 'siteSettings') {
        for (const field of ['navigation', 'footerLinks'] as const) {
          for (const item of (doc[field] as (Keyed & { link?: Link })[] | undefined) ?? []) {
            if (item.link?.linkType === 'category') restore(`${field}[${item._key}]`, item.link.category, item.link.categoryRef, [field, { _key: item._key }, 'link'])
          }
        }
      }
      if (doc._type === 'page') {
        for (const section of (doc.sections as Section[] | undefined) ?? []) {
          if (section.ctaLink?.linkType === 'category') restore(`sections[${section._key}].ctaLink`, section.ctaLink.category, section.ctaLink.categoryRef, ['sections', { _key: section._key }, 'ctaLink'])
          for (const tile of section.tiles ?? []) restore(`sections[${section._key}].tiles[${tile._key}]`, tile.category, tile.categoryRef, ['sections', { _key: section._key }, 'tiles', { _key: tile._key }])
        }
      }
      if (ops.length) mutations.push(patch(doc._id, ops, { ifRevision: doc._rev }))
    }
    if (mutations.length) yield transaction(mutations)
  },
})
