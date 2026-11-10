// components/sections/Hero.tsx
// Sekcja „Nagłówek strony”. Wariant `large` = strona główna (HeroNeon — zapłon neonu),
// `page` = podstrona („O mnie”, „Kontakt”).

import { getLocale, getTranslations } from 'next-intl/server'
import { HeroNeon } from './HeroNeon'
import type { HeroSection, Section } from '@/types'

export async function Hero({ section }: { section: Section }) {
  const { variant, eyebrow, heading, headingEmphasis, _key } = section as HeroSection

  if (variant === 'large') {
    const locale = await getLocale()
    const t = await getTranslations('home')
    const { rotatingPrefix, rotatingWords } = section as HeroSection
    return (
      // key={locale}: przy zmianie języka nowy montaż (sekwencja scramble), a nie tylko podmiana propsów
      <HeroNeon
        key={locale}
        id={`hero-${_key}`}
        heading={heading}
        headingEmphasis={headingEmphasis}
        rotatingPrefix={rotatingPrefix}
        rotatingWords={rotatingWords}
        labels={{ pause: t('rotatingPause'), resume: t('rotatingResume') }}
      />
    )
  }

  return (
    <header className="mb-16">
      {eyebrow && <p className="text-xs tracking-widest text-muted uppercase mb-4">{eyebrow}</p>}
      <h1 className="font-display text-6xl md:text-7xl font-light leading-none">{heading}</h1>
    </header>
  )
}
