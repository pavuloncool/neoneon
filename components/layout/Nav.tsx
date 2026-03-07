'use client'

// components/layout/Nav.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'

const links = [
  { href: '/content-writing', label: 'Content Writing' },
  { href: '/ux-strategies', label: 'UX Strategies' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper/90 backdrop-blur-sm border-b border-border">
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-display text-xl tracking-wide hover:text-muted transition-colors">
          Your Name
        </Link>

        {/* Desktop: linki + ikona search */}
        <div className="hidden md:flex items-center gap-2">
          <ul className="flex items-center gap-1">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'text-sm tracking-wide px-3 py-1.5 transition-colors duration-300',
                    pathname?.startsWith(href)
                      ? 'bg-ink text-paper'
                      : 'text-muted hover:bg-ink hover:text-paper'
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
              'ml-2 transition-colors',
              pathname === '/search' ? 'text-ink' : 'text-muted hover:text-ink'
            )}
          >
            <Search size={16} strokeWidth={1.5} />
          </Link>
        </div>

        {/* Mobile: ikona search + hamburger */}
        <div className="md:hidden flex items-center gap-4">
          <Link href="/search" aria-label="Search" className="text-muted hover:text-ink transition-colors">
            <Search size={16} strokeWidth={1.5} />
          </Link>
          <button
            className="flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={cn('block w-5 h-px bg-ink transition-transform duration-300', menuOpen && 'translate-y-2 rotate-45')} />
            <span className={cn('block w-5 h-px bg-ink transition-opacity duration-300', menuOpen && 'opacity-0')} />
            <span className={cn('block w-5 h-px bg-ink transition-transform duration-300', menuOpen && '-translate-y-2 -rotate-45')} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-paper border-b border-border"
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
                        ? 'bg-ink text-paper'
                        : 'text-muted hover:bg-ink hover:text-paper'
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
