'use client'

// components/layout/Nav.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
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
      onClick={() => {
        if (!mounted) return
        setTheme(isDark ? 'light' : 'dark')
      }}
      aria-label="Toggle theme"
      className={cn('flex items-center justify-center w-6 h-6 active:opacity-50 transition-opacity', className)}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8" stroke="#0f0f0f" strokeWidth="1.5" className="dark:stroke-[#fafaf8]" />
        <path d="M9 1 A8 8 0 0 0 9 17 Z" fill={isDark ? '#fafaf8' : '#0f0f0f'} />
        <path d="M9 1 A8 8 0 0 1 9 17 Z" fill={isDark ? '#0f0f0f' : '#fafaf8'} />
      </svg>
    </button>
  )
}

export function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper/90 dark:bg-ink/90 backdrop-blur-sm border-b border-border dark:border-white/10 transition-colors duration-300">
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        <Link href="/" className="font-display text-xl tracking-wide hover:text-muted transition-colors">
          Your Name
        </Link>

        {/* Desktop */}
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
          <Link
            href="/search"
            aria-label="Search"
            className={cn(
              'transition-colors',
              pathname === '/search' ? 'text-ink dark:text-paper' : 'text-muted hover:text-ink dark:hover:text-paper'
            )}
          >
            <Search size={16} strokeWidth={1.5} />
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile: theme toggle + search + hamburger */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <Link href="/search" aria-label="Search" className="text-muted hover:text-ink dark:hover:text-paper transition-colors">
            <Search size={16} strokeWidth={1.5} />
          </Link>
          <button
            className="flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={cn('block w-5 h-px bg-ink dark:bg-paper transition-transform duration-300', menuOpen && 'translate-y-2 rotate-45')} />
            <span className={cn('block w-5 h-px bg-ink dark:bg-paper transition-opacity duration-300', menuOpen && 'opacity-0')} />
            <span className={cn('block w-5 h-px bg-ink dark:bg-paper transition-transform duration-300', menuOpen && '-translate-y-2 -rotate-45')} />
          </button>
        </div>
      </nav>

      {/* Mobile menu — bez theme toggle, bo jest już w navbarze */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-paper dark:bg-ink border-b border-border dark:border-white/10"
          >
            <ul className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-1">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'block text-sm tracking-wide px-3 py-2 transition-colors duration-300',
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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
