// components/sections/Hero.tsx
// Sekcja „Nagłówek strony”. Wariant `large` = strona główna (HeroNeon — zapłon neonu),
// `page` = podstrona („O mnie”, „Kontakt”).

import { getLocale, getTranslations } from 'next-intl/server'
import { HeroNeon } from './HeroNeon'
import type { HeroSection, Section } from '@/types'

// Wartości demo rotującej linii — tylko lokalnie przy NEXT_PUBLIC_HERO_ROTATING_DEMO=1,
// gdy sekcja w Sanity nie ma jeszcze własnych pól. USUNĄĆ przed merge do main.
const ROTATING_DEMO = {
  pl: { prefix: 'Piszę o', words: ['strategii treści', 'projektowaniu UX', 'wyszukiwaniu z AI'] },
  en: { prefix: 'Writing about', words: ['content strategy', 'UX design', 'AI-powered search'] },
}

export async function Hero({ section }: { section: Section }) {
  const { variant, eyebrow, heading, headingEmphasis, _key } = section as HeroSection

  if (variant === 'large') {
    const locale = (await getLocale()) === 'en' ? 'en' : 'pl'
    const t = await getTranslations('home')
    const { rotatingPrefix, rotatingWords } = section as HeroSection
    const demo = process.env.NEXT_PUBLIC_HERO_ROTATING_DEMO === '1' && !rotatingWords?.length ? ROTATING_DEMO[locale] : null
    return (
      <HeroNeon
        id={`hero-${_key}`}
        heading={heading}
        headingEmphasis={headingEmphasis}
        rotatingPrefix={demo ? demo.prefix : rotatingPrefix}
        rotatingWords={demo ? demo.words : rotatingWords}
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
