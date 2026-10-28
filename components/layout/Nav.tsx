'use client'

import Image from 'next/image'
import { Link, usePathname } from '@/i18n/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
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
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'
  return (
    <button
      onClick={() => mounted && setTheme(isDark ? 'light' : 'dark')}
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
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
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
function NavLink({ link, className, onClick }: { link: NavProps['links'][number]; className: string; onClick?: () => void }) {
  if (link.external) {
    return <a href={link.href} className={className} onClick={onClick} target="_blank" rel="noopener noreferrer">{link.label}</a>
  }
  return <Link href={link.href} className={className} onClick={onClick}>{link.label}</Link>
}

export function Nav({ links, logo, labels }: NavProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pillVisible, setPillVisible] = useState(true)
  const lastY = useRef(0)

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
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink link={link} className={cn(
                    'text-sm tracking-wide px-3 py-1.5 transition-colors',
                    !link.external && pathname?.startsWith(link.href)
                      ? 'bg-ink text-paper dark:bg-white dark:text-ink'
                      : 'text-muted hover:bg-ink hover:text-paper dark:hover:bg-white dark:hover:text-ink'
                  )} />
                </li>
              ))}
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
            onClick={() => setMenuOpen(o => !o)}
            aria-label={labels.menu}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="w-6 h-6 flex flex-col gap-[5px] items-center justify-center"
          >
            <span className={cn('block w-5 h-px bg-white transition-transform duration-200', menuOpen && 'translate-y-[6px] rotate-45')}/>
            <span className={cn('block w-5 h-px bg-white transition-opacity duration-200', menuOpen && 'opacity-0')}/>
            <span className={cn('block w-5 h-px bg-white transition-transform duration-200', menuOpen && '-translate-y-[6px] -rotate-45')}/>
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

      {/* Mobile menu nad pillem */}
      <div
        id="mobile-menu"
        className="md:hidden fixed inset-x-0 z-50 flex justify-center transition-all duration-200"
        style={{
          bottom: '110px',
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        {/* SC 1.3.1 — aria-label odróżnia nawigację mobilną */}
        <nav aria-label={labels.mobileNav} className="w-72 rounded-3xl overflow-hidden" style={glass}>
          {menuOpen && (
            <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)}/>
          )}
          <ul className="flex flex-col p-3">
            {links.map((link) => (
              <li key={link.href}>
                <NavLink
                  link={link}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-center text-sm tracking-wide px-4 py-3.5 rounded-2xl transition-colors',
                    !link.external && pathname?.startsWith(link.href)
                      ? 'bg-white/25 text-white'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  )}
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
