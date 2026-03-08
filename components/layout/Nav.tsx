'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'

const links = [
  { href: '/content-writing', label: 'Content Writing' },
  { href: '/ux-strategies', label: 'UX Strategies' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const glass: React.CSSProperties = {
  background: 'rgba(20,20,20,0.55)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
}

function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'
  return (
    <button
      onClick={() => mounted && setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className={cn('flex items-center justify-center', className)}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 1 A9 9 0 0 0 10 19 Z" fill="currentColor"/>
      </svg>
    </button>
  )
}

export function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pillVisible, setPillVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 20 || y < lastY.current) setPillVisible(true)
      else if (y > lastY.current + 8) setPillVisible(false)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Górny navbar — tylko logo na mobile */}
      <header className="fixed top-0 inset-x-0 z-50 bg-paper/90 dark:bg-ink/90 backdrop-blur-sm border-b border-border dark:border-white/10">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-wide hover:text-muted transition-colors">
            Your Name
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <ul className="flex items-center gap-1">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={cn(
                    'text-sm tracking-wide px-3 py-1.5 transition-colors',
                    pathname?.startsWith(href)
                      ? 'bg-ink text-paper dark:bg-paper dark:text-ink'
                      : 'text-muted hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink'
                  )}>{label}</Link>
                </li>
              ))}
            </ul>
            <Link href="/search" className="text-muted hover:text-ink dark:hover:text-paper transition-colors">
              <Search size={16} strokeWidth={1.5}/>
            </Link>
            <ThemeToggle/>
          </div>
        </nav>
      </header>

      {/* Mobile: floating pill — wrapper flex+center rozwiązuje problem bez transform */}
      <div
        className="md:hidden fixed inset-x-0 z-50 flex justify-center transition-all duration-300"
        style={{ bottom: pillVisible ? '24px' : '-80px', opacity: pillVisible ? 1 : 0 }}
      >
        <div className="flex items-center gap-7 px-9 py-4 rounded-full" style={glass}>
          <ThemeToggle className="text-white w-6 h-6"/>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            className="w-6 h-6 flex flex-col gap-[5px] items-center justify-center"
          >
            <span className={cn('block w-5 h-px bg-white transition-transform duration-200', menuOpen && 'translate-y-[6px] rotate-45')}/>
            <span className={cn('block w-5 h-px bg-white transition-opacity duration-200', menuOpen && 'opacity-0')}/>
            <span className={cn('block w-5 h-px bg-white transition-transform duration-200', menuOpen && '-translate-y-[6px] -rotate-45')}/>
          </button>
          <Link href="/search" className="text-white w-6 h-6 flex items-center justify-center">
            <Search size={18} strokeWidth={1.5}/>
          </Link>
        </div>
      </div>

      {/* Mobile: menu nad pillem — ten sam wrapper trick */}
      <div
        className="md:hidden fixed inset-x-0 z-50 flex justify-center transition-all duration-200"
        style={{
          bottom: '110px',
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? 'translateY(0)' : 'translateY(12px)',
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        <div className="w-72 rounded-3xl overflow-hidden" style={glass}>
          {/* Backdrop klikalny — zamknij menu */}
          {menuOpen && (
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setMenuOpen(false)}
            />
          )}
          <ul className="flex flex-col p-3">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-center text-sm tracking-wide px-4 py-3.5 rounded-2xl transition-colors',
                    pathname?.startsWith(href)
                      ? 'bg-white/25 text-white'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
