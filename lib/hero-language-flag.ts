'use client'

// lib/hero-language-flag.ts
// Flaga „zmiana języka na stronie z hero” — module-level store (nawigacja next-intl jest kliencka,
// moduł przeżywa zmianę języka). Bez przechowywania starego tekstu: hero w nowym języku robi
// scramble z losowych znaków do nowego tytułu zamiast pełnej sekwencji zapłonu.

let expectedPath: string | null = null

// Ustawiane przez LanguageSwitcher tylko wtedy, gdy bieżąca strona ma hero
export function setHeroLanguageFlag(targetLocale: string, path: string) {
  const clean = path === '/' ? '' : path
  expectedPath = `/${targetLocale}${clean}`
}

// Odczyt + wyczyszczenie (zawsze). true tylko gdy hero zamontował się na oczekiwanej stronie.
export function consumeHeroLanguageFlag(currentPath: string): boolean {
  const match = expectedPath !== null && decodeURI(currentPath).replace(/\/$/, '') === expectedPath.replace(/\/$/, '')
  expectedPath = null
  return match
}
