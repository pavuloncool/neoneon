// migrations/kategorie-4b-2-wycofanie/index.ts
// Wycofanie migracji kategorie-4b-2 (tylko gdyby coś poszło źle po jej wykonaniu).
// Jedna transakcja: usuwa `categoryRef` z linków w siteSettings (menu, stopka) i z ctaLink / kafelków
// w page — opublikowanych i szkiców. Stare pole `category` nie jest ruszane, więc strona wraca do stanu
// sprzed 4b-2. Dokumenty `category` zostają (należą do 4b-1).
//
// Dry run:   npx sanity migration run kategorie-4b-2-wycofanie
// Wykonanie: npx sanity migration run kategorie-4b-2-wycofanie --no-dry-run   (TYLKO po zgodzie)

import { at, defineMigration, patch, transaction, unset, type Mutation, type NodePatch } from 'sanity/migrate'

type Keyed = { _key: string }
type NavItem = Keyed & { link?: { categoryRef?: unknown } }
type Section = Keyed & { _type: string; ctaLink?: { categoryRef?: unknown }; tiles?: (Keyed & { categoryRef?: unknown })[] }

export default defineMigration({
  title: 'Wycofanie 4b-2: usunięcie categoryRef z linków i kafelków',
  documentTypes: ['siteSettings', 'page'],

  async *migrate(documents) {
    const mutations: Mutation[] = []
    for await (const doc of documents()) {
      const ops: NodePatch[] = []
      if (doc._type === 'siteSettings') {
        for (const field of ['navigation', 'footerLinks'] as const) {
          for (const item of (doc[field] as NavItem[] | undefined) ?? []) {
            if (item.link?.categoryRef) ops.push(at([field, { _key: item._key }, 'link', 'categoryRef'], unset()))
          }
        }
      }
      if (doc._type === 'page') {
        for (const section of (doc.sections as Section[] | undefined) ?? []) {
          if (section.ctaLink?.categoryRef) ops.push(at(['sections', { _key: section._key }, 'ctaLink', 'categoryRef'], unset()))
          for (const tile of section.tiles ?? []) {
            if (tile.categoryRef) ops.push(at(['sections', { _key: section._key }, 'tiles', { _key: tile._key }, 'categoryRef'], unset()))
          }
        }
      }
      if (ops.length) mutations.push(patch(doc._id, ops, { ifRevision: doc._rev }))
    }
    if (mutations.length) yield transaction(mutations)
  },
})
