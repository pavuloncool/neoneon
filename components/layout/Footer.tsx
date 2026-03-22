import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import NextLink from 'next/link'

export async function Footer() {
  const t = await getTranslations('nav')
  const tf = await getTranslations('footer')
  const year = new Date().getFullYear()
  return (
    <footer className="mt-24 border-t border-border">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-sm text-muted">
          © {year} NEONEON. {tf('allRightsReserved')}
        </p>
        {/* SC 1.3.1 — aria-label odróżnia nawigację stopki */}
        <nav aria-label="Linki w stopce" className="flex gap-6">
          <Link href="/content-writing" className="text-sm text-muted hover:text-ink transition-colors">{t('contentWriting')}</Link>
          <Link href="/ux-strategies" className="text-sm text-muted hover:text-ink transition-colors">{t('uxStrategies')}</Link>
          <Link href="/about" className="text-sm text-muted hover:text-ink transition-colors">{t('about')}</Link>
          <Link href="/contact" className="text-sm text-muted hover:text-ink transition-colors">{t('contact')}</Link>
          {/* SC 1.4.3 / 4.1.2 — link do panelu admina ukryty przed AT i klawiaturą */}
          <NextLink
            href="/login"
            aria-hidden="true"
            tabIndex={-1}
            className="text-sm text-muted/40 hover:text-muted transition-colors select-none"
          >·</NextLink>
        </nav>
      </div>
    </footer>
  )
}
