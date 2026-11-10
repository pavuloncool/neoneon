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
      const [{ gsap, motionEnabled }, { ScrollTrigger }, { SplitText, SCRAMBLE_LOWER, SCRAMBLE_UPPER }] = await Promise.all([
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
        // Efekt tablicy odjazdów (split-flap): każda litera kilka razy „przeskakuje” przez losowe znaki
        // (obrót w osi X jak klapka), litery ustalają się od lewej do prawej. Szerokość każdej litery
        // zablokowana na czas animacji — linie nie przeskakują. Czytniki ekranu dostają pełny tekst z aria-label.
        const LOWER = SCRAMBLE_LOWER, UPPER = SCRAMBLE_UPPER, DIGITS = '0123456789'
        const pool = (c: string) =>
          /\d/.test(c) ? DIGITS : c !== c.toLowerCase() ? UPPER : c !== c.toUpperCase() ? LOWER : null
        const reveal = (h: HTMLElement) =>
          ctx.add(() => {
            h.setAttribute('aria-label', h.textContent ?? '')
            SplitText.create(h, {
              type: 'words,chars',
              autoSplit: true, // podział po załadowaniu fontu i przy resize
              onSplit(self) {
                const chars = self.chars as HTMLElement[]
                const widths = chars.map((c) => c.getBoundingClientRect().width)
                chars.forEach((c, i) => {
                  c.setAttribute('aria-hidden', 'true')
                  gsap.set(c, { display: 'inline-block', width: widths[i], textAlign: 'center', transformPerspective: 400 })
                })
                gsap.set(h, { opacity: 1 })
                const tl = gsap.timeline({
                  onComplete: () => {
                    self.revert()
                    h.removeAttribute('aria-label')
                    gsap.set(h, { clearProps: 'opacity' })
                  },
                })
                chars.forEach((c, i) => {
                  const final = c.textContent ?? ''
                  const set = pool(final)
                  if (!set) return
                  const flips = 2 + Math.floor(Math.random() * 3)
                  const at = i * 0.012
                  for (let f = 0; f <= flips; f++) {
                    const ch = f === flips ? final : set[Math.floor(Math.random() * set.length)]
                    tl.fromTo(
                      c,
                      { rotationX: -80 },
                      { rotationX: 0, duration: 0.06, ease: 'power1.out', onStart: () => { c.textContent = ch } },
                      at + f * 0.06,
                    )
                  }
                })
                return tl
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
          // Górny margines ogromny: nagłówek „przecina się” z obszarem, gdy jest gdziekolwiek powyżej dolnej
          // krawędzi ekranu − 5% — także gdy został przeskoczony (kotwica, skok na koniec strony).
          // Bez tego zostałby z opacity 0 nad ekranem. Odsłanianie rusza tuż po wejściu w widok:
          // efekt jest widoczny, a czytelnik nie czeka długo na pusty nagłówek.
          { rootMargin: '100000px 0px -5% 0px' },
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
