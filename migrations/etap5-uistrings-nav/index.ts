// migrations/etap5-uistrings-nav/index.ts
// Etap 5: usuwa z dokumentów uiStrings obiekt `nav` (Content Writing / UX Strategies /
// Data Visualisation). Nazwy kategorii są w dokumentach `category`, pola zniknęły ze schematu.
// Jedna transakcja, każdy dokument z ifRevision. Przerywa, jeśli w `nav` jest coś poza 3 kluczami.
//
// Dry run:   npx sanity migration run etap5-uistrings-nav
// Wykonanie: npx sanity migration run etap5-uistrings-nav --no-dry-run   (TYLKO po zgodzie)

import { at, defineMigration, patch, transaction, unset, type Mutation } from 'sanity/migrate'

const KEYS = ['contentWriting', 'uxStrategies', 'dataVisualisation']

export default defineMigration({
  title: 'Etap 5: usunięcie nav.* (nazwy kategorii) z uiStrings',
  documentTypes: ['uiStrings'],
  filter: 'defined(nav)',

  async *migrate(documents) {
    const mutations: Mutation[] = []
    for await (const doc of documents()) {
      const nav = (doc as { nav?: Record<string, unknown> }).nav ?? {}
      const extra = Object.keys(nav).filter((k) => !k.startsWith('_') && !KEYS.includes(k))
      if (extra.length) throw new Error(`${doc._id}: nieoczekiwane pola w nav: ${extra.join(', ')}`)
      mutations.push(patch(doc._id, [at('nav', unset())], { ifRevision: doc._rev }))
    }
    if (mutations.length) yield transaction(mutations)
  },
})
