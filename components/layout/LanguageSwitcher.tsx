'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({
  dark = false,
  className,
  labels = { pl: 'Polski', en: 'English' },
}: { dark?: boolean; className?: string; labels?: { pl: string; en: string } }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(targetLocale: 'pl' | 'en') {
    if (targetLocale === locale) return

    // Odpowiednik strony w drugim języku (artykuł albo strona z page buildera) — patrz TranslationStore
    const translationPath = sessionStorage.getItem('neoneon_translation_path')
    if (translationPath) {
      router.push(translationPath, { locale: targetLocale })
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
        aria-label={labels.pl}
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
        aria-label={labels.en}
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
