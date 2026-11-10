'use client'

// components/blog/ArticleScroll.tsx
// Stonowany ruch w artykule:
//  - złoty pasek postępu czytania (ScrollTrigger scrub, scaleX) — dekoracja, aria-hidden;
//  - nagłówki h2 w treści odsłaniane linia po linii z maski przy wejściu w widok (raz).
// Bez scramble i migotania w treści.
//
// Wydajność (artykuł to długi DOM): GSAP, ScrollTrigger i SplitText ładowane dynamicznie w czasie
// bezczynności — nie konkurują z okładką (LCP) i nie wydłużają taska hydracji (TBT). Nagłówki obserwuje
// IntersectionObserver (bez wymuszania układu), SplitText dzieli dopiero nagłówek, który wchodzi w widok.
// Ukrywane są tylko nagłówki poniżej ekranu i dopiero z JS — bez JS / przy błędzie wszystko jest widoczne.
// Reduced motion: pasek zostaje (sterowany scrollem, nie animacja), nagłówki bez efektu.

import { useEffect, useRef } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export function ArticleScroll() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const body = document.querySelector<HTMLElement>('[data-article-body]')
    const el = bar.current
    if (!body || !el) return
    let cancelled = false
    let cleanup: (() => void) | null = null

    const setup = async () => {
      const [{ gsap, motionEnabled }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import('@/lib/gsap'),
        import('@/lib/gsap-scroll'),
        import('@/lib/gsap-text'),
      ])
      if (cancelled) return
      let io: IntersectionObserver | null = null

      const ctx = gsap.context(() => {
        gsap.to(el, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: body, start: 'top top+=57', end: 'bottom bottom', scrub: 0.3 },
        })
      })

      if (motionEnabled() && !window.matchMedia(REDUCED_MOTION).matches) {
        const reveal = (h: HTMLElement) =>
          ctx.add(() => {
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
                  onComplete: () => {
                    // revert() cofa też tę animację — stan końcowy = oryginał, DOM wraca do czystego h2
                    self.revert()
                    gsap.set(h, { clearProps: 'opacity' })
                  },
                })
              },
            })
          })

        // Tylko nagłówki w całości poniżej ekranu (nikt ich jeszcze nie widział — ukrycie nie miga)
        const below = Array.from(body.querySelectorAll<HTMLElement>('h2[data-reveal]')).filter(
          (h) => h.getBoundingClientRect().top > window.innerHeight,
        )
        gsap.set(below, { opacity: 0 })
        io = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              if (!e.isIntersecting) continue
              io?.unobserve(e.target)
              reveal(e.target as HTMLElement)
            }
          },
          // Górny margines ogromny: nagłówek „przecina się” z obszarem, gdy jest gdziekolwiek powyżej linii
          // 88% wysokości ekranu — także gdy został przeskoczony (kotwica, skok na koniec strony).
          // Bez tego zostałby z opacity 0 nad ekranem.
          { rootMargin: '100000px 0px -12% 0px' },
        )
        below.forEach((h) => io!.observe(h))
      }

      cleanup = () => {
        io?.disconnect()
        ctx.revert()
        ScrollTrigger.refresh()
      }
    }

    const idle = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(() => { setup() }, { timeout: 2000 })
      : window.setTimeout(() => { setup() }, 800)

    return () => {
      cancelled = true
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      cleanup?.()
    }
  }, [])

  return (
    <div
      ref={bar}
      aria-hidden="true"
      className="reading-progress fixed left-0 right-0 top-[57px] z-40 h-[2px] bg-accent"
    />
  )
}
