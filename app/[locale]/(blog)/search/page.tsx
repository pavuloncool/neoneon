import { searchArticles, getArticles, getAllTags } from '@/lib/queries'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { TagBadge } from '@/components/blog/TagBadge'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

interface SearchPageProps {
  params: Promise<{ locale: 'pl' | 'en' }>
  searchParams: Promise<{ q?: string; tag?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'search' })
  return { title: t('heading') }
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params
  const { q, tag } = await searchParams
  const t = await getTranslations('search')

  const [tags, articles] = await Promise.all([
    getAllTags(),
    q ? searchArticles(q, locale) : getArticles({ tag, locale }),
  ])

  const hasQuery = q || tag
  const resultCount = articles.length

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <header className="mb-12">
        <h1 className="font-display text-5xl font-light mb-8 text-ink dark:text-white">{t('heading')}</h1>
        <form method="GET" className="flex gap-0 max-w-xl">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder={t('placeholder')}
            className="flex-1 bg-transparent border border-border dark:border-white/30 px-4 py-3 text-sm text-ink dark:text-white placeholder:text-muted/50 dark:placeholder:text-white/30 focus:outline-none focus:border-ink dark:focus:border-white transition-colors"
          />
          <button
            type="submit"
            className="border border-l-0 border-border dark:border-white/30 px-6 py-3 text-xs tracking-widest uppercase text-muted dark:text-white/60 hover:bg-ink hover:text-paper hover:border-ink dark:hover:bg-white dark:hover:text-[#0f0f0f] dark:hover:border-white transition-colors"
          >
            {t('button')}
          </button>
        </form>
      </header>

      {tags.length > 0 && (
        <section className="mb-12">
          <p className="text-xs tracking-widest text-muted dark:text-white/50 uppercase mb-4">{t('filterByTag')}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tg) => <TagBadge key={tg.id} tag={tg} active={tg.slug === tag} />)}
          </div>
        </section>
      )}

      {hasQuery && (
        <p className="text-xs tracking-widest text-muted dark:text-white/50 uppercase mb-8">
          {resultCount === 0 ? t('noResults') : `${resultCount} ${resultCount === 1 ? t('result') : t('results')}`}
          {q && ` for "${q}"`}
          {tag && ` tagged "${tag}"`}
        </p>
      )}

      {articles.length > 0 ? (
        <div>{articles.map((article) => <ArticleCard key={article.id} article={article} variant="default" locale={locale} />)}</div>
      ) : hasQuery ? (
        <p className="text-muted dark:text-white/50 text-sm">{t('tryDifferent')}</p>
      ) : (
        <p className="text-muted dark:text-white/50 text-sm">{t('enterTerm')}</p>
      )}
    </div>
  )
}
