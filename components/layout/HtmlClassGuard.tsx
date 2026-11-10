'use client'

// components/layout/HtmlClassGuard.tsx
// Przy zmianie języka zmienia się parametr segmentu [locale], więc React montuje layout od nowa i
// ponownie przejmuje <html> (ten sam węzeł DOM): czyści jego atrybuty i ustawia je z propsów.
// Znikają wtedy klasy dodane poza Reactem: `js` (znacznik animacji, inline script) i `dark`/`light`
// oraz style.colorScheme (next-themes przywraca je dopiero w useEffect — po malowaniu → mignięcie).
// Ten komponent montuje się razem z layoutem i przywraca je w useLayoutEffect, czyli przed malowaniem.

import { useLayoutEffect } from 'react'

const THEME_KEY = 'theme' // storageKey next-themes (domyślny)

function resolveTheme(): 'dark' | 'light' {
  let stored: string | null = null
  try { stored = localStorage.getItem(THEME_KEY) } catch {}
  if (stored === 'dark' || stored === 'light') return stored
  if (stored === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  return 'light' // defaultTheme w ThemeProvider
}

export function HtmlClassGuard() {
  useLayoutEffect(() => {
    const html = document.documentElement
    if (!window.__motionFallback && !html.classList.contains('js')) html.classList.add('js')
    if (!html.classList.contains('dark') && !html.classList.contains('light')) {
      const theme = resolveTheme()
      html.classList.add(theme)
      html.style.colorScheme = theme
    }
  }, [])
  return null
}
