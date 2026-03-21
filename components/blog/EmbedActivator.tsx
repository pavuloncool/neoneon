'use client'

// components/blog/EmbedActivator.tsx
// Client Component odpowiedzialny wyłącznie za uruchamianie skryptów embedów
// (Instagram, Twitter itp.) po załadowaniu strony po stronie klienta.
// Oddzielony od TiptapRenderer, aby uniknąć błędu hydratacji.

import { useEffect } from 'react'

export function EmbedActivator() {
  useEffect(() => {
    const container = document.querySelector('.article-body')
    if (!container) return

    // Skrypty wstrzyknięte przez dangerouslySetInnerHTML nie są wykonywane
    // przez przeglądarkę. Zastępujemy każdy <script> nowym węzłem,
    // co wymusza jego wykonanie.
    container.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script')
      oldScript.getAttributeNames().forEach((attr) =>
        newScript.setAttribute(attr, oldScript.getAttribute(attr)!)
      )
      newScript.textContent = oldScript.textContent
      oldScript.replaceWith(newScript)
    })

    // Jeśli Instagram embed.js był już załadowany wcześniej (np. z cache),
    // ręcznie wywołujemy przetworzenie embedów.
    const win = window as Window & { instgrm?: { Embeds: { process: () => void } } }
    win.instgrm?.Embeds.process()
  }, [])

  return null
}
