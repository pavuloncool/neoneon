// lib/categories.ts
// Adresy pierwszego poziomu (/{locale}/{slug}) zajęte przez trasy aplikacji — nie może ich mieć ani
// strona, ani kategoria. Kategorie są dokumentami `category` w Sanity (etap 4).
// Importowany też przez schematy Sanity — bez zależności od Next i aliasu „@/”.

export const APP_RESERVED_SLUGS = ['search', 'studio', 'api', 'home']
