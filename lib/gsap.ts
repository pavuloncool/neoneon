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
  }
}

// Znacznik JS na <html> (ustawiany inline w app/[locale]/layout.tsx). Jeśli siatka bezpieczeństwa
// zdjęła go po 3000 ms, CSS już nie ukrywa elementów — animację wejścia pomijamy.
export function motionEnabled(): boolean {
  return document.documentElement.classList.contains('js')
}

// Wywoływane po faktycznym starcie pierwszej animacji — wyłącza siatkę bezpieczeństwa.
export function markMotionReady(): void {
  window.__motionReady = true
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)'

export { gsap, useGSAP }
