'use client'

// components/ui/Motion.tsx
// Reużywalne wrappery animacji wejścia (GSAP). API bez zmian względem wersji z Framer Motion.
//
// Stan startowy (opacity/transform) ustawia CSS — styles/globals.css, sekcja „Motion” — tylko gdy
// <html> ma klasę `js` i użytkownik nie prosi o ograniczenie ruchu. Dzięki temu treść nie miga
// przed animacją, a bez JS albo z prefers-reduced-motion jest widoczna od razu.
// Po zakończeniu animacji element dostaje data-motion-done, co wyłącza regułę CSS stanu startowego.

import { useRef } from 'react'
import { gsap, useGSAP, motionEnabled, markMotionReady, FULL_MOTION, REDUCED_MOTION } from '@/lib/gsap'

const EASE = 'power1.out' // zbliżone do cubic-bezier(0.25, 0.1, 0.25, 1) z poprzedniej wersji

function done(el: Element) {
  el.setAttribute('data-motion-done', '')
}

// Animacja wejścia jednego elementu albo listy elementów (stagger)
function useEnter(
  scope: React.RefObject<HTMLDivElement | null>,
  targets: () => Element[],
  vars: gsap.TweenVars,
) {
  useGSAP(
    () => {
      const els = targets()
      if (els.length === 0) return
      // Siatka bezpieczeństwa już zadziałała — CSS niczego nie ukrywa, nie animujemy
      if (!motionEnabled()) {
        els.forEach(done)
        return
      }
      const mm = gsap.matchMedia()
      mm.add(FULL_MOTION, () => {
        gsap.to(els, {
          ...vars,
          // transform: none po animacji — bez stałego stacking contextu / containing blocka
          onComplete: () => {
            els.forEach((el) => {
              done(el)
              gsap.set(el, { clearProps: 'transform' })
            })
          },
        })
        markMotionReady()
      })
      mm.add(REDUCED_MOTION, () => {
        els.forEach(done)
        markMotionReady()
      })
    },
    { scope },
  )
}

// Fade in + slide up — dla nagłówków i bloków tekstu.
// `lcp` — element LCP strony (nie może startować z opacity 0, bo LCP czekałby na hydrację):
//   'dim'   — start z opacity 0.15 (zgaszona rurka neonu, hero),
//   'solid' — start z opacity 1, animowany tylko transform (nagłówek kategorii, okładka artykułu).
export function FadeUp({
  children,
  delay = 0,
  className,
  lcp,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  lcp?: 'dim' | 'solid'
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEnter(ref, () => (ref.current ? [ref.current] : []), { opacity: 1, y: 0, duration: 0.5, delay, ease: EASE })
  return (
    <div ref={ref} data-motion="fade-up" data-motion-lcp={lcp} className={className}>
      {children}
    </div>
  )
}

// Fade in — dla obrazków i elementów bez przesunięcia
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEnter(ref, () => (ref.current ? [ref.current] : []), { opacity: 1, duration: 0.6, delay, ease: 'power2.out' })
  return (
    <div ref={ref} data-motion="fade-in" className={className}>
      {children}
    </div>
  )
}

// Stagger container — dzieci (StaggerItem) animują się kolejno
export function StaggerList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEnter(
    ref,
    () => (ref.current ? Array.from(ref.current.querySelectorAll(':scope > [data-motion="stagger-item"]')) : []),
    { opacity: 1, y: 0, duration: 0.4, ease: EASE, stagger: 0.08 },
  )
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Element w stagger liście — animuje go StaggerList
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div data-motion="stagger-item" className={className}>
      {children}
    </div>
  )
}
