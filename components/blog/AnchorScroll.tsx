'use client'

// components/blog/AnchorScroll.tsx
// Wejście na artykuł z kotwicą (np. #faq): przeglądarka przewija do celu raz, w chwili gdy strona może być
// jeszcze krótsza (obrazy, embedy, fonty dorastają później) — cel ucieka w dół i wejście kończy się w losowym
// miejscu (widoczne na wolniejszych podglądach Vercel). Tu: po każdej zmianie wysokości strony cel jest
// ponownie ustawiany u góry ekranu (z uwzględnieniem scroll-margin), aż użytkownik sam zacznie przewijać
// lub minie 5 s. Bez kotwicy komponent nic nie robi.

import { useEffect } from 'react'

const STOP_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
const MAX_MS = 5000

export function AnchorScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    const target = id ? document.getElementById(id) : null
    if (!target) return

    // 'instant': html ma scroll-behavior: smooth — wielokrotne poprawki nie mogą być animowane
    const align = () => target.scrollIntoView({ block: 'start', behavior: 'instant' })
    const observer = new ResizeObserver(align)
    const stop = () => {
      observer.disconnect()
      window.clearTimeout(timer)
      STOP_EVENTS.forEach((e) => window.removeEventListener(e, stop))
    }
    const timer = window.setTimeout(stop, MAX_MS)
    STOP_EVENTS.forEach((e) => window.addEventListener(e, stop, { passive: true }))
    observer.observe(document.body)
    return stop
  }, [])

  return null
}
