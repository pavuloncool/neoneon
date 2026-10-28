import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { getSiteSettings } from '@/lib/queries'
import { resolveHref } from '@/lib/links'
import type { NavItem } from '@/types'

// Pozycje menu z Sanity → { href, label }; pomija linki bez celu (np. usunięta strona)
function toLinks(items?: NavItem[] | null) {
  return (items ?? []).flatMap((item) => {
    const resolved = resolveHref(item.link)
    return resolved ? [{ ...resolved, label: item.label }] : []
  })
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const settings = await getSiteSettings(locale === 'en' ? 'en' : 'pl')
  const a11y = settings?.a11y ?? {}

  return (
    <>
      {/* SC 2.4.1 — Skip link: pierwszy element strony, ukryty wizualnie, widoczny przy fokusie */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:text-sm focus:rounded"
      >
        {a11y.skipToContent ?? 'Przejdź do treści głównej'}
      </a>
      <Nav
        links={toLinks(settings?.navigation)}
        logo={{
          light: settings?.logoLight?.url ?? '/neoneon-light.webp',
          dark: settings?.logoDark?.url ?? '/neoneon-dark.webp',
          alt: settings?.logoAlt ?? 'neoneon',
        }}
        labels={{
          mainNav: a11y.mainNav ?? 'Główna nawigacja',
          mobileNav: a11y.mobileNav ?? 'Nawigacja mobilna',
          search: a11y.search ?? 'Szukaj',
          menu: a11y.menu ?? 'Otwórz menu nawigacyjne',
          themeToggle: a11y.themeToggle ?? 'Toggle theme',
          languagePl: a11y.languagePl ?? 'Polski',
          languageEn: a11y.languageEn ?? 'English',
        }}
      />
      <main id="main-content" className="pt-14 min-h-screen">
        {children}
      </main>
      <Footer
        text={settings?.footerText ?? '© {year} NEONEON.'}
        links={toLinks(settings?.footerLinks)}
        navLabel={a11y.footerNav ?? 'Linki w stopce'}
      />
    </>
  )
}
