// migrations/etap5-uistrings-nav-wycofanie/index.ts
// Wycofanie etap5-uistrings-nav: przywraca obiekt `nav` w uiStrings z wartościami sprzed migracji
// (kopia: higiena/backup-przed-5). Ma sens tylko razem z powrotem do kodu sprzed etapu 5.
//
// Dry run:   npx sanity migration run etap5-uistrings-nav-wycofanie
// Wykonanie: npx sanity migration run etap5-uistrings-nav-wycofanie --no-dry-run   (TYLKO po zgodzie)

import { at, defineMigration, patch, set, transaction, type Mutation } from 'sanity/migrate'

const NAV: Record<string, Record<string, string>> = {
  'uiStrings-pl': { contentWriting: 'Tworzenie treści', uxStrategies: 'Strategie UX', dataVisualisation: 'Data Visualisation' },
  'uiStrings-en': { contentWriting: 'Content Writing', uxStrategies: 'UX Strategies', dataVisualisation: 'Data Visualisation' },
}

export default defineMigration({
  title: 'Wycofanie etapu 5: przywrócenie nav.* w uiStrings',
  documentTypes: ['uiStrings'],
  filter: '!defined(nav)',

  async *migrate(documents) {
    const mutations: Mutation[] = []
    for await (const doc of documents()) {
      const nav = NAV[doc._id]
      if (nav) mutations.push(patch(doc._id, [at('nav', set(nav))], { ifRevision: doc._rev }))
    }
    if (mutations.length) yield transaction(mutations)
  },
})
