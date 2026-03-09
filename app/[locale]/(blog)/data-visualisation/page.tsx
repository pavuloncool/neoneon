import { getArticles, getAllTags } from '@/lib/queries'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { TagBadge } from '@/components/blog/TagBadge'
import { FadeUp } from '@/components/ui/Motion'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'nav' })
  return { title: t('dataVisualisation') }
}

interface PageProps {
  params: Promise<{ locale: 'pl' | 'en' }>
  searchParams: Promise<{ tag?: string }>
}

export default async function DataVisualisationPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { tag } = await searchParams
  const tn = await getTranslations('nav')
  const tc = await getTranslations('category')

  const [articles, tags] = await Promise.all([
    getArticles({ category: 'data-visualisation', locale, tag }),
    getAllTags(),
  ])

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <FadeUp>
        <header className="mb-12 pb-12 border-b border-border">
          <p className="text-xs tracking-widest text-muted dark:text-white/60 uppercase mb-3">{tc('label')}</p>
          <h1 className="font-display text-6xl md:text-7xl font-light leading-none">{tn('dataVisualisation')}</h1>
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
                  href={tg.slug === tag ? '/data-visualisation' : `/data-visualisation?tag=${tg.slug}`}
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
