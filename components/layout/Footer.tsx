import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

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
        <nav className="flex gap-6">
          <Link href="/content-writing" className="text-sm text-muted hover:text-ink transition-colors">{t('contentWriting')}</Link>
          <Link href="/ux-strategies" className="text-sm text-muted hover:text-ink transition-colors">{t('uxStrategies')}</Link>
          <Link href="/data-visualisation" className="text-sm text-muted hover:text-ink transition-colors">{t('dataVisualisation')}</Link>
          <Link href="/about" className="text-sm text-muted hover:text-ink transition-colors">{t('about')}</Link>
          <Link href="/contact" className="text-sm text-muted hover:text-ink transition-colors">{t('contact')}</Link>
          <Link href="/login" className="text-sm text-muted/40 hover:text-muted transition-colors">·</Link>
        </nav>
      </div>
    </footer>
  )
}
