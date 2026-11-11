// components/sections/PageSectionsBase.tsx
// Renderuje sekcje strony z page buildera (dokument `page` w Sanity) w zadanej kolejności.
// Bez importu HeroNeon: komponent przekazuje createPageSections(HeroNeon). Strona główna używa
// SectionRenderer.tsx (statyczny HeroNeon — element LCP), trasa [...segments] — SectionRendererLazy.tsx
// (HeroNeon ładowany osobno, więc kategorie, artykuły i podstrony nie pobierają jego kodu).

import { Fragment, type ComponentType } from 'react'
import { ContactForm } from '@/components/blog/lazy'
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer'
import { TranslationStore } from '@/components/layout/TranslationStore'
import { getPageTranslation } from '@/lib/queries'
import { CategoryTiles } from './CategoryTiles'
import { FeatureGrid } from './FeatureGrid'
import { Hero } from './Hero'
import type { HeroNeonProps } from './HeroNeon'
import { RecentArticles } from './RecentArticles'
import { SimpleText } from './SimpleText'
import { TextImage } from './TextImage'
import type { Page, Section } from '@/types'
import { otherLocale, type Locale } from '@/lib/locales'

type HeroNeonComponent = ComponentType<HeroNeonProps>

function renderSection(section: Section, locale: Locale, heroNeon: HeroNeonComponent) {
  switch (section._type) {
    case 'hero':
      return <Hero section={section} HeroNeon={heroNeon} />
    case 'categoryTiles':
      return <CategoryTiles section={section} />
    case 'recentArticles':
      return <RecentArticles section={section} locale={locale} />
    case 'textImage':
      return <TextImage section={section} />
    case 'featureGrid':
      return <FeatureGrid section={section} />
    case 'contactForm':
      return (
        <ContactForm>
          <SimpleText value={section.intro} />
        </ContactForm>
      )
    case 'richText':
      return section.body?.length ? (
        <div className="mb-16">
          <PortableTextRenderer content={section.body} />
        </div>
      ) : null
    default:
      return null
  }
}

export function createPageSections(heroNeon: HeroNeonComponent) {
  return async function PageSections({ page, locale }: { page: Page; locale: Locale }) {
    // Odpowiednik strony w drugim języku dla przełącznika języka (adresy mogą się różnić,
    // np. /pl/o-mnie ↔ /en/about). Bez tłumaczenia — strona główna drugiego języka.
    const translation = await getPageTranslation(page.id, otherLocale(locale))
    const translationPath = translation ? (translation.isHome ? '/' : `/${translation.slug ?? ''}`) : '/'

    return (
      <div className={page.width === 'wide' ? 'max-w-5xl mx-auto px-6 py-16' : 'max-w-3xl mx-auto px-6 py-16'}>
        <TranslationStore path={translationPath} />
        {(page.sections ?? []).map((section) => (
          <Fragment key={section._key}>{renderSection(section, locale, heroNeon)}</Fragment>
        ))}
      </div>
    )
  }
}
