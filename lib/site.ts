// lib/site.ts
// Adres produkcyjny i nazwa witryny — źródło dla canonical, hreflang, Open Graph, sitemapy i JSON-LD.

// Stały adres, niezależny od środowiska — podglądy Vercel i localhost też wskazują produkcję jako canonical
export const SITE_URL = 'https://neoneon.online'
export const SITE_NAME = 'neoneon'

export type Locale = 'pl' | 'en'

export const OG_LOCALE: Record<Locale, string> = { pl: 'pl_PL', en: 'en_GB' }

// path bez prefiksu języka: '' = strona główna, '/o-mnie', '/ux-strategies/slug'
export function localeUrl(locale: Locale, path = ''): string {
  return `${SITE_URL}/${locale}${path}`
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'pl' ? 'en' : 'pl'
}
