// components/layout/Footer.tsx

import Link from 'next/link'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-border">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-sm text-muted">
          © {year} Your Name. All rights reserved.
        </p>
        <nav className="flex gap-6">
          <Link href="/content-writing" className="text-sm text-muted hover:text-ink transition-colors">
            Content Writing
          </Link>
          <Link href="/ux-strategies" className="text-sm text-muted hover:text-ink transition-colors">
            UX Strategies
          </Link>
          <Link href="/about" className="text-sm text-muted hover:text-ink transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-sm text-muted hover:text-ink transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
}
