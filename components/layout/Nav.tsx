'use client'

// components/layout/Nav.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'

const links = [
  { href: '/content-writing', label: 'Content Writing' },
  { href: '/ux-strategies', label: 'UX Strategies' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      onClick={() => { if (!mounted) return; setTheme(isDark ? 'light' : 'dark') }}
      aria-label="Toggle theme"
      className={cn('flex items-center justify-center active:opacity-50 transition-opacity', className)}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 1 A9 9 0 0 0 10 19 Z" fill="currentColor" />
      </svg>
    </button>
  )
}

// Hook: ukrywa bar przy scroll w dół, pokazuje przy górze
function useScrollVisibility() {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 20) { setVisible(true) }
      else if (y < lastY.current) { setVisible(true) }
      else if (y > lastY.current + 8) { setVisible(false) }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return visible
}

export function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const bottomVisible = useScrollVisibility()

  return (
    <>
      {/* ── Górny navbar: tylko logo ─────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-paper/90 dark:bg-ink/90 backdrop-blur-sm border-b border-border dark:border-white/10 transition-colors duration-300">
        <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-wide hover:text-muted transition-colors">
            Your Name
          </Link>

          {/* Desktop: pełna nawigacja */}
          <div className="hidden md:flex items-center gap-3">
            <ul className="flex items-center gap-1">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'text-sm tracking-wide px-3 py-1.5 transition-colors duration-300',
                      pathname?.startsWith(href)
                        ? 'bg-ink text-paper dark:bg-paper dark:text-ink'
                        : 'text-muted hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/search" aria-label="Search"
              className={cn('transition-colors', pathname === '/search' ? 'text-ink dark:text-paper' : 'text-muted hover:text-ink dark:hover:text-paper')}
            >
              <Search size={16} strokeWidth={1.5} />
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* ── Floating bottom pill: tylko mobile ───────────── */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300"
        style={{ transform: `translateX(-50%) translateY(${bottomVisible ? '0' : '100px'})`, opacity: bottomVisible ? 1 : 0 }}
      >
        <div className="flex items-center gap-6 px-8 py-3.5 rounded-full bg-ink/85 dark:bg-paper/85 backdrop-blur-md shadow-lg shadow-black/20">
          {/* Lewo: dark/light toggle */}
          <ThemeToggle className="text-paper dark:text-ink w-6 h-6" />

          {/* Środek: hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="flex flex-col gap-[5px] items-center justify-center w-6 h-6"
          >
            <span className={cn('block w-5 h-px bg-paper dark:bg-ink transition-transform duration-300', menuOpen && 'translate-y-[6px] rotate-45')} />
            <span className={cn('block w-5 h-px bg-paper dark:bg-ink transition-opacity duration-300', menuOpen && 'opacity-0')} />
            <span className={cn('block w-5 h-px bg-paper dark:bg-ink transition-transform duration-300', menuOpen && '-translate-y-[6px] -rotate-45')} />
          </button>

          {/* Prawo: search */}
          <Link href="/search" aria-label="Search" className="text-paper dark:text-ink flex items-center justify-center w-6 h-6">
            <Search size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* ── Mobile menu (nad pillem) ──────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            {/* Menu card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-64 rounded-2xl bg-paper dark:bg-ink border border-border dark:border-white/10 shadow-xl overflow-hidden"
            >
              <ul className="flex flex-col p-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'block text-sm tracking-wide px-4 py-3 rounded-xl transition-colors duration-200',
                        pathname?.startsWith(href)
                          ? 'bg-ink text-paper dark:bg-paper dark:text-ink'
                          : 'text-ink dark:text-paper hover:bg-ink/10 dark:hover:bg-paper/10'
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
