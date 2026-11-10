// components/sections/SectionRenderer.tsx
// Renderuje sekcje strony z page buildera (dokument `page` w Sanity) w zadanej kolejności.

import { Fragment } from 'react'
import { ContactForm } from '@/components/blog/lazy'
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer'
import { TranslationStore } from '@/components/layout/TranslationStore'
import { getPageTranslation } from '@/lib/queries'
import { CategoryTiles } from './CategoryTiles'
import { FeatureGrid } from './FeatureGrid'
import { Hero } from './Hero'
import { RecentArticles } from './RecentArticles'
import { SimpleText } from './SimpleText'
import { TextImage } from './TextImage'
import type { Page, Section } from '@/types'
import { otherLocale, type Locale } from '@/lib/locales'

function renderSection(section: Section, locale: Locale) {
  switch (section._type) {
    case 'hero':
      return <Hero section={section} />
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

export async function PageSections({ page, locale }: { page: Page; locale: Locale }) {
  // Odpowiednik strony w drugim języku dla przełącznika języka (adresy mogą się różnić,
  // np. /pl/o-mnie ↔ /en/about). Bez tłumaczenia — strona główna drugiego języka.
  const translation = await getPageTranslation(page.id, otherLocale(locale))
  const translationPath = translation ? (translation.isHome ? '/' : `/${translation.slug ?? ''}`) : '/'

  return (
    <div className={page.width === 'wide' ? 'max-w-5xl mx-auto px-6 py-16' : 'max-w-3xl mx-auto px-6 py-16'}>
      <TranslationStore path={translationPath} />
      {(page.sections ?? []).map((section) => (
        <Fragment key={section._key}>{renderSection(section, locale)}</Fragment>
      ))}
    </div>
  )
}
