// lib/categories.ts
// Kategorie zapisane dotąd w kodzie — zapas na czas przejścia na dokumenty `category` w Sanity
// (porządki techniczne, etap 4). Strona i Studio najpierw szukają dokumentu `category`,
// a gdy go brak — tej listy. Do usunięcia w etapie 4c razem ze starym polem `category` artykułu.
// Importowany też przez schematy Sanity — bez zależności od Next i aliasu „@/”.

export const LEGACY_CATEGORIES = [
  { value: 'content-writing', title: 'Content Writing', messageKey: 'contentWriting' },
  { value: 'ux-strategies', title: 'UX Strategies', messageKey: 'uxStrategies' },
  { value: 'data-visualisation', title: 'Data Visualisation', messageKey: 'dataVisualisation' },
] as const

export type LegacyCategory = (typeof LEGACY_CATEGORIES)[number]

export function legacyCategory(slug: string | null | undefined): LegacyCategory | undefined {
  return LEGACY_CATEGORIES.find((c) => c.value === slug)
}

// Adresy pierwszego poziomu zajęte przez trasy aplikacji — nie może ich mieć ani strona, ani kategoria
export const APP_RESERVED_SLUGS = ['search', 'studio', 'api', 'home']
