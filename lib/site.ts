// lib/site.ts
// Adres produkcyjny i nazwa witryny — źródło dla canonical, hreflang, Open Graph, sitemapy i JSON-LD.

const DEFAULT_SITE_URL = 'https://neoneon.online'

// Adres z NEXT_PUBLIC_SITE_URL (na Vercel: Production i Preview = https://neoneon.online, więc podglądy
// też wskazują produkcję jako canonical). Brak zmiennej = adres domyślny + ostrzeżenie w logu serwera.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')
if (!process.env.NEXT_PUBLIC_SITE_URL && typeof window === 'undefined') {
  console.warn(`NEXT_PUBLIC_SITE_URL: brak zmiennej — używam ${DEFAULT_SITE_URL}`)
}
export const SITE_NAME = 'neoneon'

// Adresy e-mail formularzy (Resend): nadawca musi być w domenie zweryfikowanej w Resend
export const FORM_FROM_EMAIL = 'formularz@neoneon.online'
export const CONTACT_EMAIL = 'ask@neoneon.online'

export type Locale = 'pl' | 'en'

export const OG_LOCALE: Record<Locale, string> = { pl: 'pl_PL', en: 'en_GB' }

// path bez prefiksu języka: '' = strona główna, '/o-mnie', '/ux-strategies/slug'
export function localeUrl(locale: Locale, path = ''): string {
  return `${SITE_URL}/${locale}${path}`
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'pl' ? 'en' : 'pl'
}
