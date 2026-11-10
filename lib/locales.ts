// lib/locales.ts
// Jedyna definicja języków strony: routing (next-intl), typy, metadane, formatowanie dat i Studio.
// Importowany też przez sanity.config.ts i schematy — bez zależności od Next i aliasu „@/”.

// Kolejność jak dotąd w routingu next-intl (wpływa na negocjację języka przeglądarki)
export const LOCALES = ['en', 'pl'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'pl'

// Do list w Studio: domyślny język pierwszy (PL, EN)
export const LOCALES_DEFAULT_FIRST: Locale[] = [DEFAULT_LOCALE, ...LOCALES.filter((l) => l !== DEFAULT_LOCALE)]

// Nazwy w Studio: skrót (listy artykułów, page builder) i pełna nazwa (wtyczka tłumaczeń)
export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  pl: { short: 'PL', name: 'Polski' },
  en: { short: 'EN', name: 'English' },
}

export const OG_LOCALE: Record<Locale, string> = { pl: 'pl_PL', en: 'en_GB' }

// Formatowanie dat (Intl)
export const DATE_LOCALE: Record<Locale, string> = { pl: 'pl-PL', en: 'en-GB' }

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

// Nieznana wartość = język domyślny
export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'pl' ? 'en' : 'pl'
}
