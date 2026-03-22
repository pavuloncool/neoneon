'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ dark = false, className }: { dark?: boolean; className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(targetLocale: 'pl' | 'en') {
    if (targetLocale === locale) return

    const translationSlug = sessionStorage.getItem('neoneon_translation_slug')
    const translationCategory = sessionStorage.getItem('neoneon_translation_category')

    if (translationSlug && translationCategory) {
      router.push(`/${translationCategory}/${translationSlug}`, { locale: targetLocale })
      return
    }

    router.push(pathname, { locale: targetLocale })
  }

  return (
    <div className={cn('flex items-center gap-0 text-xs tracking-widest', className)}>
      {/* SC 4.1.2 + SC 2.5.8 — aria-pressed informuje o aktywnym języku; py-1 = min. 24 px obszar dotyku */}
      <button
        onClick={() => switchTo('pl')}
        aria-pressed={locale === 'pl'}
        aria-label="Polski"
        className={cn(
          'px-1.5 py-1 transition-colors duration-200',
          locale === 'pl'
            ? dark ? 'text-white font-medium' : 'text-ink dark:text-white font-medium'
            : dark ? 'text-white/50 hover:text-white' : 'text-muted hover:text-ink dark:hover:text-white'
        )}
      >
        PL
      </button>
      <span className={dark ? 'text-white/20' : 'text-border dark:text-white/20'} aria-hidden="true">|</span>
      <button
        onClick={() => switchTo('en')}
        aria-pressed={locale === 'en'}
        aria-label="English"
        className={cn(
          'px-1.5 py-1 transition-colors duration-200',
          locale === 'en'
            ? dark ? 'text-white font-medium' : 'text-ink dark:text-white font-medium'
            : dark ? 'text-white/50 hover:text-white' : 'text-muted hover:text-ink dark:hover:text-white'
        )}
      >
        EN
      </button>
    </div>
  )
}
