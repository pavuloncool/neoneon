'use client'

import Image from 'next/image'
import { Link, usePathname } from '@/i18n/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useHydrated } from '@/lib/useHydrated'
import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

// Dane z ustawień strony w Sanity (siteSettings) — przygotowuje je app/[locale]/(blog)/layout.tsx
export interface NavProps {
  links: { href: string; label: string; external: boolean }[]
  logo: { light: string; dark: string; alt: string }
  labels: {
    mainNav: string
    mobileNav: string
    search: string
    menu: string
    themeToggle: string
    languagePl: string
    languageEn: string
  }
}

const glass: React.CSSProperties = {
  background: 'rgba(20,20,20,0.55)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
}

function ThemeToggle({ className, label }: { className?: string; label: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  // Motyw znamy dopiero w przeglądarce — pierwszy render (serwer i hydracja) bez niego, potem właściwy
  const mounted = useHydrated()
  const isDark = mounted && resolvedTheme === 'dark'

  // Zmiana motywu przez View Transitions: nowy motyw „rozlewa się” kołem od przycisku
  // (CSS: ::view-transition-new(root) w globals.css). W callbacku najpierw synchroniczna zmiana klasy
  // na <html> (to łapie snapshot „new”), setTheme() tylko zapisuje preferencję next-themes.
  // Fallback (brak API albo prefers-reduced-motion) = natychmiastowa zmiana.
  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    if (!mounted) return
    const next = isDark ? 'light' : 'dark'
    const root = document.documentElement
    const apply = () => {
      root.classList.toggle('dark', next === 'dark')
      root.style.colorScheme = next
      setTheme(next)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (typeof document.startViewTransition !== 'function' || reduce) {
      apply()
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    root.style.setProperty('--vt-x', `${x}px`)
    root.style.setProperty('--vt-y', `${y}px`)
    root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))}px`)
    // Bez transition-colors na czas przejścia — snapshot „new” nie może być w połowie zmiany kolorów
    root.classList.add('theme-vt')
    const vt = document.startViewTransition(apply)
    vt.finished.finally(() => root.classList.remove('theme-vt'))
  }

  return (
    <button
      onClick={toggle}
      aria-label={label}
      className={cn('flex items-center justify-center', className)}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 1 A9 9 0 0 0 10 19 Z" fill="currentColor"/>
      </svg>
    </button>
  )
}

function Logo({ logo }: { logo: NavProps['logo'] }) {
  const { resolvedTheme } = useTheme()
  // Motyw znamy dopiero w przeglądarce — pierwszy render (serwer i hydracja) bez niego, potem właściwy
  const mounted = useHydrated()
  if (!mounted) return <div className="h-8 w-28" />
  return (
    <Image
      src={resolvedTheme === 'dark' ? logo.dark : logo.light}
      alt={logo.alt}
      width={120}
      height={40}
      className="h-8 w-auto"
      priority
    />
  )
}

// Link wewnętrzny (z prefiksem języka) albo zewnętrzny
function NavLink({ link, className, onClick, children }: { link: NavProps['links'][number]; className: string; onClick?: () => void; children?: React.ReactNode }) {
  if (link.external) {
    return <a href={link.href} className={className} onClick={onClick} target="_blank" rel="noopener noreferrer">{children ?? link.label}</a>
  }
  return <Link href={link.href} className={className} onClick={onClick}>{children ?? link.label}</Link>
}

// Desktop: rolling text — dwie kopie etykiety w masce, druga aria-hidden; hover/focus-visible przesuwa
// je o wysokość linii + złote podkreślenie rośnie od lewej (CSS: .nav-roll w globals.css)
function RollingLabel({ label }: { label: string }) {
  return (
    <span className="nav-roll">
      <span className="nav-roll-track">
        <span>{label}</span>
        <span aria-hidden="true">{label}</span>
      </span>
    </span>
  )
}

export function Nav({ links, logo, labels }: NavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const [menuOpen, setMenuOpen] = useState(false)
  const [pillVisible, setPillVisible] = useState(true)
  const lastY = useRef(0)
  const dialogRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const wasOpen = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 20 || y < lastY.current) setPillVisible(true)
      else if (y > lastY.current + 8) { setPillVisible(false); setMenuOpen(false) }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Zmiana strony zamyka menu (stan pochodny liczony w renderze, bez setState w efekcie)
  const [menuPath, setMenuPath] = useState(pathname)
  if (menuPath !== pathname) {
    setMenuPath(pathname)
    if (menuOpen) setMenuOpen(false)
  }

  // Kurtyna od dołu (od pilla) + linie linków wjeżdżające z maski; zamknięcie = odwrotna timeline.
  // GSAP ładowany dynamicznie, nie statycznym importem: Nav jest w layoucie, a statyczny import wiązał
  // moduł layoutu z chunkiem GSAP — inicjalizacja i hydracja szły wtedy jednym długim taskiem
  // (TBT +~50 ms na artykule). GSAP i tak jest już w cache z animacji strony (Motion).
  // Timeline budowana w czasie bezczynności (GSAP czyta style elementów); przy wcześniejszym otwarciu — na żądanie.
  const buildMenu = useRef<(() => Promise<void>) | null>(null)
  const isOpen = useRef(false)
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    let cancelled = false
    let ctx: gsap.Context | null = null
    let pending: Promise<void> | null = null
    const build = () =>
      (pending ??= import('@/lib/gsap').then(({ gsap }) => {
        if (cancelled || timeline.current) return
        ctx = gsap.context(() => {
          timeline.current = gsap
            .timeline({ paused: true })
            .fromTo(d, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power3.inOut' })
            .fromTo(d.querySelectorAll('[data-menu-line]'), { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 }, '-=0.2')
            .fromTo(d.querySelectorAll('[data-menu-fade]'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, '<0.1')
        }, d)
        // Zbudowana, gdy menu było już otwarte w trybie reduced motion — od razu stan końcowy
        if (isOpen.current && window.matchMedia('(prefers-reduced-motion: reduce)').matches) timeline.current?.progress(1).pause()
      }))
    buildMenu.current = build
    const idle = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback(() => { build() }, { timeout: 3000 })
      : window.setTimeout(() => { build() }, 1500)
    return () => {
      cancelled = true
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle)
      else window.clearTimeout(idle)
      ctx?.revert()
      timeline.current = null
    }
  }, [])

  // Otwieranie/zamykanie: animacja, inert dla wszystkiego poza dialogiem, blokada scrolla, fokus, Esc
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    isOpen.current = menuOpen
    if (!menuOpen && !wasOpen.current) return // stan początkowy — nic do cofania
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Rodzeństwo dialogu (skip link, header, pill, main, footer) — inert na czas otwarcia
    const outside = Array.from(d.parentElement?.children ?? []).filter((el) => el !== d && el.tagName !== 'SCRIPT') as HTMLElement[]

    if (menuOpen) {
      wasOpen.current = true
      let stale = false
      outside.forEach((el) => { el.inert = true })
      document.body.style.overflow = 'hidden'
      // Widoczność od razu (nie w timeline) — fokus może wejść do dialogu w następnej klatce
      d.style.visibility = 'visible'
      if (reduce) {
        if (timeline.current) timeline.current.progress(1).pause()
        else d.style.clipPath = 'none'
      } else {
        buildMenu.current?.().then(() => {
          const tl = timeline.current
          if (stale || !tl) return
          tl.eventCallback('onReverseComplete', null)
          tl.timeScale(1).play()
        })
      }
      // Fokus na pierwszy link w następnej klatce — po zdjęciu inert i ustawieniu widoczności
      const raf = requestAnimationFrame(() => d.querySelector<HTMLElement>('a[href], button')?.focus())

      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); setMenuOpen(false); return }
        if (e.key !== 'Tab') return
        // Pułapka fokusu: Tab z ostatniego → pierwszy, Shift+Tab z pierwszego → ostatni
        const focusable = Array.from(d.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
        const first = focusable[0], last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
      document.addEventListener('keydown', onKey)
      return () => {
        stale = true
        cancelAnimationFrame(raf)
        document.removeEventListener('keydown', onKey)
      }
    }

    outside.forEach((el) => { el.inert = false })
    document.body.style.overflow = ''
    // Po zamknięciu wracają visibility: hidden i clip-path z CSS (.menu-dialog)
    const hide = () => { d.style.visibility = ''; d.style.clipPath = '' }
    const tl = timeline.current
    if (reduce || !tl) { tl?.progress(0).pause(); hide() }
    else { tl.eventCallback('onReverseComplete', hide); tl.timeScale(1.4).reverse() }
    // Powrót fokusu na przycisk otwierający (tylko jeśli fokus był w dialogu — nie przy zmianie strony)
    if (d.contains(document.activeElement)) openerRef.current?.focus()
  }, [menuOpen])

  return (
    <>
      {/* Górny navbar — desktop */}
      <header className="fixed top-0 inset-x-0 z-50 bg-paper/90 dark:bg-ink/90 backdrop-blur-sm border-b border-border dark:border-white/10">
        {/* SC 1.3.1 / 4.1.2 — aria-label odróżnia nawigację desktopową od mobilnej */}
        <nav aria-label={labels.mainNav} className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo logo={logo} />
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <ul className="flex items-center gap-1">
              {links.map((link) => {
                const active = !link.external && pathname?.startsWith(link.href)
                return (
                  <li key={link.href}>
                    {/* Aktywny link zachowuje dotychczasowy styl; pozostałe: rolling text + złote podkreślenie */}
                    <NavLink link={link} className={cn(
                      'text-sm tracking-wide px-3 py-1.5 transition-colors',
                      active ? 'bg-ink text-paper dark:bg-white dark:text-ink' : 'nav-roll-link text-muted hover:text-ink dark:hover:text-white'
                    )}>
                      {active ? link.label : <RollingLabel label={link.label} />}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
            {/* SC 4.1.2 + SC 2.5.8 — aria-label dla linku ikony + padding na min. 24×24 px obszar dotyku */}
            <Link
              href="/search"
              aria-label={labels.search}
              className="text-muted hover:text-ink dark:hover:text-white transition-colors p-1"
            >
              <Search size={16} strokeWidth={1.5} aria-hidden="true"/>
            </Link>
            <ThemeToggle label={labels.themeToggle}/>
            <LanguageSwitcher labels={{ pl: labels.languagePl, en: labels.languageEn }} />
          </div>
        </nav>
      </header>

      {/* Floating pill — mobile */}
      <div
        className="md:hidden fixed inset-x-0 z-50 flex justify-center transition-all duration-300"
        style={{ bottom: pillVisible ? '24px' : '-80px', opacity: pillVisible ? 1 : 0 }}
      >
        <div className="flex items-center gap-6 px-9 py-4 rounded-full" style={glass}>
          <ThemeToggle className="text-white w-6 h-6" label={labels.themeToggle}/>
          <LanguageSwitcher dark labels={{ pl: labels.languagePl, en: labels.languageEn }} />
          {/* SC 4.1.2 — aria-expanded informuje czytnik ekranu o stanie menu */}
          <button
            ref={openerRef}
            onClick={() => setMenuOpen(true)}
            aria-label={labels.menu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            className="w-6 h-6 flex flex-col gap-[5px] items-center justify-center"
          >
            <span className="block w-5 h-px bg-white"/>
            <span className="block w-5 h-px bg-white"/>
            <span className="block w-5 h-px bg-white"/>
          </button>
          {/* SC 4.1.2 + SC 2.5.8 — aria-label dla linku ikony */}
          <Link
            href="/search"
            aria-label={labels.search}
            className="text-white w-6 h-6 flex items-center justify-center"
          >
            <Search size={18} strokeWidth={1.5} aria-hidden="true"/>
          </Link>
        </div>
      </div>

      {/* Menu mobilne — pełnoekranowy dialog. Zawsze w DOM (linki dla SEO, płynna odwrotna animacja);
          zamknięty: visibility hidden (CSS .menu-dialog) + inert. SC 4.1.2: role="dialog" + aria-modal. */}
      <div
        ref={dialogRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={labels.mobileNav}
        inert={!menuOpen}
        className="menu-dialog md:hidden fixed inset-0 z-[60] flex flex-col bg-ink text-white"
      >
        <nav aria-label={labels.mobileNav} className="flex-1 flex flex-col justify-center px-8">
          <ul className="flex flex-col gap-2">
            {links.map((link) => {
              const active = !link.external && pathname?.startsWith(link.href)
              return (
                <li key={link.href} className="overflow-hidden">
                  <span data-menu-line className="block">
                    <NavLink
                      link={link}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'block font-display font-light text-5xl leading-tight py-1 transition-colors',
                        active ? 'text-accent' : 'text-white/90 hover:text-accent focus-visible:text-accent'
                      )}
                    />
                  </span>
                </li>
              )
            })}
          </ul>
        </nav>
        {/* Zamknięcie wewnątrz dialogu, w miejscu pilla (zasięg kciuka) */}
        <div data-menu-fade className="flex justify-center pb-8">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label={t('closeMenu')}
            className="w-12 h-12 rounded-full flex items-center justify-center border border-white/25 text-white hover:border-accent hover:text-accent transition-colors"
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  )
}
