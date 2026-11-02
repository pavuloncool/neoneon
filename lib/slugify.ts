// lib/slugify.ts
// Zamienia tekst nagłówka na identyfikator kotwicy, np.
// "Kto jest kim w podcastowej kampanii" -> "kto-jest-kim-w-podcastowej-kampanii"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l') // "ł" nie rozkłada się w normalizacji NFD
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // usuwa pozostałe znaki diakrytyczne
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}
