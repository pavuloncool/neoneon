// migrations/kategorie-4b-1-wycofanie/index.ts
// Wycofanie migracji kategorie-4b-1 (tylko gdyby coś poszło źle po jej wykonaniu).
// Jedna transakcja: najpierw usuwa `categoryRef` z artykułów (silne referencje blokują usuwanie
// kategorii), potem 2 dokumenty translation.metadata i 4 dokumenty category utworzone przez 4b-1.
// Pole `category` artykułów nie jest ruszane — strona wraca do zapasowej listy z kodu (stan z 4a).
//
// Dry run:   npx sanity migration run kategorie-4b-1-wycofanie
// Wykonanie: npx sanity migration run kategorie-4b-1-wycofanie --no-dry-run   (TYLKO po zgodzie)

import { at, defineMigration, delete_, patch, transaction, unset, type Mutation } from 'sanity/migrate'

const CREATED_IDS = [
  'translation-category-content-writing',
  'translation-category-ux-strategies',
  'category-content-writing-pl',
  'category-content-writing-en',
  'category-ux-strategies-pl',
  'category-ux-strategies-en',
]

export default defineMigration({
  title: 'Wycofanie 4b-1: usunięcie categoryRef z artykułów i dokumentów utworzonych przez migrację',
  documentTypes: ['article'],
  filter: 'defined(categoryRef)',

  async *migrate(documents) {
    const mutations: Mutation[] = []
    for await (const doc of documents()) {
      mutations.push(patch(doc._id, [at('categoryRef', unset())], { ifRevision: doc._rev }))
    }
    for (const id of CREATED_IDS) mutations.push(delete_(id))
    yield transaction(mutations)
  },
})
