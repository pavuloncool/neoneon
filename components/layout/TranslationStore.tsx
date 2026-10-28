'use client'

import { useEffect } from 'react'

// Zapamiętuje adres odpowiednika bieżącej strony w drugim języku (bez prefiksu języka,
// np. '/about' albo '/ux-strategies/slug'). Czyta go LanguageSwitcher.
export function TranslationStore({ path }: { path: string }) {
  useEffect(() => {
    sessionStorage.setItem('neoneon_translation_path', path)
    return () => {
      sessionStorage.removeItem('neoneon_translation_path')
    }
  }, [path])

  return null
}
