// components/blog/CategoryPage.tsx
// Strona kategorii /{locale}/{slug} (trasa [...segments]) — lista artykułów z filtrem tagów.
// Znaczniki i klasy 1:1 z dawnych tras content-writing/, ux-strategies/, data-visualisation/.

import { getArticles, getAllTags } from '@/lib/queries'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { TagBadge } from '@/components/blog/TagBadge'
import { FadeUp } from '@/components/ui/Motion'
import { getTranslations } from 'next-intl/server'
import { TranslationStore } from '@/components/layout/TranslationStore'
import type { ResolvedCategory } from '@/lib/categoryRoute'
import type { Locale } from '@/lib/locales'

interface CategoryPageProps {
  category: ResolvedCategory
  locale: Locale
  tag?: string
}

export async function CategoryPage({ category, locale, tag }: CategoryPageProps) {
  const tc = await getTranslations('category')
  const path = `/${category.slug}`

  const [articles, tags] = await Promise.all([
    getArticles({ category: category.slug, locale, tag }),
    getAllTags(),
  ])

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Przełącznik języka: odpowiednik kategorii z powiązania tłumaczeń (slugi PL/EN mogą się różnić) */}
      {category.altSlug !== null && <TranslationStore path={`/${category.altSlug}`} />}
      <FadeUp lcp="solid">
        <header className="mb-12 pb-12 border-b border-border">
          <p className="text-xs tracking-widest text-muted dark:text-white/60 uppercase mb-3">{tc('label')}</p>
          <h1 className="font-display text-6xl md:text-7xl font-light leading-none">{category.title}</h1>
        </header>
      </FadeUp>
      {tags.length > 0 && (
        <FadeUp delay={0.1}>
          <section className="mb-10">
            <p className="text-xs tracking-widest text-muted uppercase mb-4">{tc('filterByTag')}</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tg) => (
                <TagBadge
                  key={tg.id}
                  tag={tg}
                  active={tg.slug === tag}
                  href={tg.slug === tag ? path : `${path}?tag=${tg.slug}`}
                />
              ))}
            </div>
          </section>
        </FadeUp>
      )}
      {articles.length > 0 ? (
        <div>{articles.map((article) => <ArticleCard key={article.id} article={article} variant="default" locale={locale} />)}</div>
      ) : (
        <p className="text-muted text-sm">{tc('noArticles')}</p>
      )}
    </div>
  )
}
