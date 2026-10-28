import { Link } from '@/i18n/navigation'

// Dane z ustawień strony w Sanity (siteSettings) — przygotowuje je app/[locale]/(blog)/layout.tsx
export interface FooterProps {
  text: string
  links: { href: string; label: string; external: boolean }[]
  navLabel: string
}

export function Footer({ text, links, navLabel }: FooterProps) {
  const linkClass = 'text-sm text-muted hover:text-ink transition-colors'
  return (
    <footer className="mt-24 border-t border-border">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-sm text-muted">
          {text.replace('{year}', String(new Date().getFullYear()))}
        </p>
        {/* SC 1.3.1 — aria-label odróżnia nawigację stopki */}
        <nav aria-label={navLabel} className="flex gap-6">
          {links.map((link) =>
            link.external ? (
              <a key={link.href} href={link.href} className={linkClass} target="_blank" rel="noopener noreferrer">{link.label}</a>
            ) : (
              <Link key={link.href} href={link.href} className={linkClass}>{link.label}</Link>
            )
          )}
        </nav>
      </div>
    </footer>
  )
}
