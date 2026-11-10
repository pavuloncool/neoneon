'use client'

// components/blog/ArticleScroll.tsx
// Stonowany ruch w artykule (ScrollTrigger):
//  - złoty pasek postępu czytania (scrub, scaleX) — dekoracja, aria-hidden;
//  - nagłówki h2 w treści odsłaniane linia po linii z maski przy wejściu w widok (raz).
// Bez scramble i migotania w treści. Reduced motion: pasek zostaje (to wskaźnik sterowany scrollem,
// nie animacja), nagłówki od razu w stanie końcowym.

import { useRef } from 'react'
import { gsap, useGSAP, motionEnabled, FULL_MOTION, REDUCED_MOTION } from '@/lib/gsap'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { SplitText } from '@/lib/gsap-text'

export function ArticleScroll() {
  const bar = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const body = document.querySelector<HTMLElement>('[data-article-body]')
    if (!body || !bar.current) return

    gsap.to(bar.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: body, start: 'top top+=57', end: 'bottom bottom', scrub: 0.3 },
    })

    const headings = Array.from(body.querySelectorAll<HTMLElement>('h2[data-reveal]'))
    const done = (h: HTMLElement) => h.setAttribute('data-reveal-done', '')
    if (!motionEnabled()) {
      headings.forEach(done)
      return
    }

    const mm = gsap.matchMedia()
    mm.add(REDUCED_MOTION, () => headings.forEach(done))
    mm.add(FULL_MOTION, () => {
      headings.forEach((h) => {
        SplitText.create(h, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true, // podział linii po załadowaniu fontu i przy resize
          onSplit(self) {
            gsap.set(h, { opacity: 1 })
            return gsap.from(self.lines, {
              yPercent: 100,
              duration: 0.7,
              ease: 'power3.out',
              stagger: 0.08,
              scrollTrigger: { trigger: h, start: 'top 88%', once: true },
              onComplete: () => {
                // revert() cofa też tę animację — stan końcowy jest identyczny z oryginałem, więc DOM wraca
                // do czystego h2 (kopiowanie, wyszukiwanie w stronie)
                self.revert()
                done(h)
              },
            })
          },
        })
      })
      // Linie mogły zmienić wysokości po podziale — przelicz pozycje triggerów
      ScrollTrigger.refresh()
    })
  })

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="reading-progress fixed left-0 right-0 top-[57px] z-40 h-[2px] bg-accent"
    />
  )
}
