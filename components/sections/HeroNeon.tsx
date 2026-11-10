'use client'

// components/sections/HeroNeon.tsx
// Hero strony głównej: „zapłon neonu”.
//  1) ScrambleText osobno na zwykłej części tytułu i na kursywie (nigdy na całym h1 — nie nadpisuje <em>),
//     zwykła część rozjaśnia się 0.15 → 1, kursywa zostaje „zgaszona”;
//  2) po scramble SplitText dzieli kursywę na znaki → jeden przebieg zapłonu (litery w losowej kolejności)
//     (w ciemnym motywie razem z poświatą — pseudo-element ::after, animowana tylko jego opacity przez --glow);
//  3) potem linia z rotującym słowem (3 cykle, przycisk pauzy — SC 2.2.2).
// Dostępność: h1 ma aria-label z pełnym tekstem, animowane span-y są aria-hidden.
// Stan startowy (opacity 0.15) ustawia CSS pod html.js — h1 jest malowany od razu (LCP).

import { Fragment, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { gsap, useGSAP, motionEnabled, markMotionReady, FULL_MOTION, REDUCED_MOTION } from '@/lib/gsap'
import { SplitText, scrambleChars } from '@/lib/gsap-text'
import { consumeHeroLanguageFlag } from '@/lib/hero-language-flag'

const ROTATION_CYCLES = 3
const WORD_HOLD = 1.8 // s — jak długo słowo stoi przed zmianą

export interface HeroNeonProps {
  id: string
  heading: string
  headingEmphasis?: string | null
  rotatingPrefix?: string | null
  rotatingWords?: string[] | null
  labels: { pause: string; resume: string }
}

type RotationState = 'idle' | 'running' | 'paused' | 'done'

// Każde słowo w osobnym spanie (cel scramble); spacje zostają zwykłym tekstem między nimi
function Words({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span data-hero-word={w}>{w}</span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}

export function HeroNeon({ id, heading, headingEmphasis, rotatingPrefix, rotatingWords, labels }: HeroNeonProps) {
  const root = useRef<HTMLElement>(null)
  const rotation = useRef<gsap.core.Timeline | null>(null)
  const [rotationState, setRotationState] = useState<RotationState>('idle')

  const words = (rotatingWords ?? []).map((w) => w.trim()).filter(Boolean)
  const hasRotation = Boolean(rotatingPrefix) && words.length > 1
  const fullTitle = headingEmphasis ? `${heading} ${headingEmphasis}` : heading

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const h1 = el.querySelector<HTMLElement>('h1')!
      const head = el.querySelector<HTMLElement>('[data-hero="heading"]')!
      const emphWrap = el.querySelector<HTMLElement>('[data-hero="emphasis-wrap"]')
      const emph = el.querySelector<HTMLElement>('[data-hero="emphasis"]')
      const word = el.querySelector<HTMLElement>('[data-hero="word"]')
      const finish = () => el.setAttribute('data-hero-done', '')
      // Zmiana języka na stronie z hero (flaga z LanguageSwitcher) — zawsze czyszczona przy montażu
      const languageSwitch = consumeHeroLanguageFlag(window.location.pathname)

      // Siatka bezpieczeństwa już zdjęła html.js — stan końcowy bez animacji
      if (!motionEnabled()) {
        finish()
        return
      }

      const mm = gsap.matchMedia()

      mm.add(REDUCED_MOTION, () => {
        finish()
        markMotionReady()
      })

      mm.add(FULL_MOTION, (ctx) => {
        markMotionReady()

        // Rotujące słowo — startuje dopiero po zapłonie (jeden dominujący efekt naraz)
        const startRotation = ctx.add('startRotation', () => {
          if (!hasRotation || !word) return
          const n = words.length
          const tl = gsap.timeline({ onComplete: () => setRotationState('done') })
          for (let step = 1; step <= ROTATION_CYCLES * n - 1; step++) {
            const next = words[step % n]
            tl.to(word, { yPercent: 100, duration: 0.35, ease: 'power2.in' }, `+=${WORD_HOLD}`)
              .call(() => { word.textContent = next })
              .set(word, { yPercent: -100 })
              .to(word, { yPercent: 0, duration: 0.45, ease: 'power2.out' })
              // krótkie mrugnięcie neonu przy zmianie
              .to(word, { opacity: 0.35, duration: 0.05, repeat: 1, yoyo: true })
          }
          rotation.current = tl
          setRotationState('running')
        })

        const done = ctx.add('done', () => {
          gsap.set(h1, { clearProps: 'height' })
          finish()
          startRotation()
        })

        // Zapłon kursywy: SplitText po scramble; animacja tworzona i zwracana w onSplit,
        // więc przy ponownym podziale (fonty, resize) GSAP przenosi jej postęp.
        const ignite = ctx.add('ignite', () => {
          if (!emph || !emphWrap) return done()
          SplitText.create(emph, {
            type: 'chars',
            aria: 'none', // kontener jest aria-hidden, nazwę daje aria-label na h1
            autoSplit: true,
            onSplit(self) {
              const chars = self.chars
              const tl = gsap.timeline({
                onComplete: () => {
                  // revert() cofa też tę animację (wraca opacity sprzed zapłonu) — stan końcowy ustawiamy jawnie
                  self.revert()
                  gsap.set(emph, { opacity: 1 })
                  gsap.set(emphWrap, { '--glow': 1 })
                  done()
                },
              })
              // Jeden przebieg błysku od lewej do prawej: każda litera (od „zgaszonego” 0.3, w którym kursywa
              // kończy scramble) rozbłyska, krótko przygasa i zostaje w pełnym świetle — raz. Błysk obejmuje
              // naraz 1–2 litery (mały obszar, jeden błysk na literę — SC 2.3.1).
              const EACH = 0.09
              const letter = 0.1 + 0.09 + 0.22 // rozbłysk + przygaśnięcie + pełne światło
              const pass = letter + EACH * Math.max(chars.length - 1, 0)
              tl.set(emph, { opacity: 1 })
                .fromTo(chars, { opacity: 0.3 }, {
                  keyframes: [
                    { opacity: 1, duration: 0.1, ease: 'power2.out' },
                    { opacity: 0.4, duration: 0.09, ease: 'power1.in' },
                    { opacity: 1, duration: 0.22, ease: 'power1.out' },
                  ],
                  stagger: { each: EACH, from: 'start' },
                }, 0)
                // poświata (tylko dark; w light pseudo-element ma display: none) narasta razem z przebiegiem
                .fromTo(emphWrap, { '--glow': 0 }, { '--glow': 1, duration: pass, ease: 'power1.in' }, 0)
              return tl
            },
          })
        })

        // Scramble osobno na każdym słowie — spacje i łamanie wierszy zostają (inaczej na mobile
        // cały tytuł staje się jednym „słowem” i wychodzi poza ekran). Szerokość słowa zablokowana
        // na czas scramble — losowe znaki nie przestawiają wierszy.
        const scrambleWords = (tl: gsap.core.Timeline, container: HTMLElement, at: number, duration: number) =>
          container.querySelectorAll<HTMLElement>('[data-hero-word]').forEach((w) => {
            const text = w.dataset.heroWord!
            gsap.set(w, { display: 'inline-block', width: w.getBoundingClientRect().width, whiteSpace: 'nowrap' })
            tl.to(w, { duration, ease: 'none', scrambleText: { text, chars: scrambleChars(text), revealDelay: 0.3, speed: 0.5 } }, at)
              .set(w, { clearProps: 'display,width,whiteSpace' })
          })

        // Start po załadowaniu fontów — wysokość h1 mierzona w docelowym kroju (bez skoków CLS)
        const start = ctx.add('start', () => {
          if (!motionEnabled()) {
            finish()
            return
          }
          gsap.set(h1, { height: h1.offsetHeight })
          if (languageSwitch) {
            // Po zmianie języka: krótki scramble z losowych znaków do nowego tytułu, bez fazy
            // zgaszonej rurki i bez migotania
            const tl = gsap.timeline({ onComplete: () => done() })
            scrambleWords(tl, head, 0, 0.6)
            if (emph) scrambleWords(tl, emph, 0.1, 0.6)
            return
          }
          const tl = gsap.timeline({ onComplete: () => ignite() })
          scrambleWords(tl, head, 0, 1.3)
          tl.to(head, { opacity: 1, duration: 1.3, ease: 'power1.in' }, 0)
          if (emph) {
            scrambleWords(tl, emph, 0.25, 1.1)
            tl.to(emph, { opacity: 0.3, duration: 1.1 }, 0.25)
          }
        })

        // Ponowny zapłon kursywy po przejściu na ciemny motyw (tylko opacity, bez scramble),
        // jeśli hero jest w widoku i sekwencja startowa się zakończyła
        const reignite = ctx.add('reignite', () => {
          if (!emph || !emphWrap || !el.hasAttribute('data-hero-done')) return
          const r = h1.getBoundingClientRect()
          if (r.bottom <= 0 || r.top >= window.innerHeight) return
          // Jeden przebieg, bez przygaśnięć: kursywa i poświata zapalają się płynnie
          gsap.timeline()
            .fromTo(emph, { opacity: 0.3 }, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 0)
            .fromTo(emphWrap, { '--glow': 0 }, { '--glow': 1, duration: 0.6, ease: 'power1.inOut' }, 0)
        })
        const html = document.documentElement
        let wasDark = html.classList.contains('dark')
        const themeObserver = new MutationObserver(() => {
          const isDark = html.classList.contains('dark')
          if (isDark && !wasDark) reignite()
          wasDark = isDark
        })
        themeObserver.observe(html, { attributes: true, attributeFilter: ['class'] })

        if (languageSwitch) {
          // Nowy tytuł od razu w pełnym świetle (bez stanu 0.15) — scramble zaczyna od losowych znaków
          gsap.set([head, emph].filter(Boolean), { opacity: 1 })
          if (emphWrap) gsap.set(emphWrap, { '--glow': 1 })
          // Przed pierwszym malowaniem słowa wypełnione losowymi znakami — nowy tytuł nie mignie
          // gotowy, zanim ruszy scramble (start jest po malowaniu). Revert kontekstu przywraca tekst.
          el.querySelectorAll<HTMLElement>('[data-hero-word]').forEach((w) => {
            const text = w.dataset.heroWord!
            const pool = scrambleChars(text)
            const noise = Array.from(text, () => pool[Math.floor(Math.random() * pool.length)]).join('')
            // szerokość docelowego słowa zablokowana przed podmianą (scrambleWords zdejmie blokadę na końcu)
            gsap.set(w, { display: 'inline-block', width: w.getBoundingClientRect().width, whiteSpace: 'nowrap' })
            w.textContent = noise
          })
        }

        let started = false
        const once = () => { if (!started) { started = true; start() } }
        // Start dopiero po pierwszym malowaniu (rAF + setTimeout) — pomiary słów i style nie wydłużają
        // interakcji, która wyrenderowała hero (np. zmiana języka → INP)
        const afterPaint = () => requestAnimationFrame(() => window.setTimeout(once, 0))
        document.fonts.ready.then(afterPaint)
        const fallback = window.setTimeout(once, 1000)
        return () => {
          window.clearTimeout(fallback)
          themeObserver.disconnect()
        }
      })
    },
    { scope: root },
  )

  function toggleRotation() {
    const tl = rotation.current
    if (!tl) return
    if (tl.paused()) {
      tl.resume()
      setRotationState('running')
    } else {
      tl.pause()
      setRotationState('paused')
    }
  }

  return (
    /* SC 1.3.6 — aria-labelledby wskazuje na h1 wewnątrz sekcji */
    <section ref={root} aria-labelledby={id} data-hero-root="" className="mb-20">
      {/* Pełny tytuł w aria-label; animowane span-y aria-hidden (scramble/split nie psują odczytu) */}
      <h1 id={id} aria-label={fullTitle} className="font-display text-7xl md:text-8xl font-light leading-none mb-6">
        <span aria-hidden="true" data-hero="heading"><Words text={heading} /></span>
        {headingEmphasis && (
          <>
            <br />
            <em className="hero-emph" data-hero="emphasis-wrap" data-text={headingEmphasis}>
              <span aria-hidden="true" data-hero="emphasis"><Words text={headingEmphasis} /></span>
            </em>
          </>
        )}
      </h1>

      {hasRotation && (
        <div className="flex items-baseline gap-3">
          {/* SC 4.1.3 — zmiany słowa nie są ogłaszane; pełna lista w tekście dla czytników */}
          <p aria-live="off" className="font-display text-2xl md:text-3xl font-light leading-tight">
            <span aria-hidden="true">
              {rotatingPrefix}{' '}
              {/* Maska: wszystkie słowa w jednej komórce siatki (niewidoczne) rezerwują szerokość najdłuższego */}
              <span className="hero-word-mask">
                {words.map((w) => (
                  <span key={w} className="invisible">{w}</span>
                ))}
                <span data-hero="word" className="hero-word">{words[0]}</span>
              </span>
            </span>
            <span className="sr-only">{rotatingPrefix} {words.join(', ')}</span>
          </p>
          {(rotationState === 'running' || rotationState === 'paused') && (
            /* SC 2.2.2 — ruch dłuższy niż 5 s da się wstrzymać */
            <button
              type="button"
              onClick={toggleRotation}
              aria-label={rotationState === 'paused' ? labels.resume : labels.pause}
              className="p-1 text-muted hover:text-ink dark:hover:text-white transition-colors"
            >
              {rotationState === 'paused'
                ? <Play size={14} strokeWidth={1.5} aria-hidden="true" />
                : <Pause size={14} strokeWidth={1.5} aria-hidden="true" />}
            </button>
          )}
        </div>
      )}
    </section>
  )
}
