'use client'

// lib/gsap.ts
// Jedno miejsce rejestracji GSAP i pluginów. Komponenty importują stąd, nie z 'gsap' bezpośrednio.
// Pluginy (SplitText, ScrambleText, ScrollTrigger, DrawSVG) dopisujemy tu w etapach, które ich używają —
// żeby nie powiększać paczki JS, zanim są potrzebne.

import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

declare global {
  interface Window {
    __motionReady?: boolean
    __motionFallback?: boolean
  }
}

// Znacznik JS na <html> (ustawiany inline w app/[locale]/layout.tsx).
// - Siatka bezpieczeństwa zdjęła go po 3000 ms (__motionFallback) → CSS nie ukrywa elementów,
//   animację wejścia pomijamy.
// - React nadpisuje className <html> przy zmianie języka (nowe params layoutu [locale]) i znacznik
//   znika, choć siatka nie zadziałała → przywracamy go. Wywołania są w layout effect (useGSAP),
//   więc przed malowaniem — bez mignięcia.
export function motionEnabled(): boolean {
  if (window.__motionFallback) return false
  const html = document.documentElement
  if (!html.classList.contains('js')) html.classList.add('js')
  return true
}

// Wywoływane po faktycznym starcie pierwszej animacji — wyłącza siatkę bezpieczeństwa.
export function markMotionReady(): void {
  window.__motionReady = true
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)'

export { gsap, useGSAP }
