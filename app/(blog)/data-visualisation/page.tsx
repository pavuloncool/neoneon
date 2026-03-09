// app/(blog)/data-visualisation/page.tsx
import { getArticles } from '@/lib/queries'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { FadeUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Visualisation',
}

export default async function DataVisualisationPage() {
  const articles = await getArticles({ category: 'data-visualisation' })
  const [featured, ...rest] = articles

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <FadeUp>
        <header className="mb-12 pb-12 border-b border-border">
          <p className="text-xs tracking-widest text-muted dark:text-white/60 uppercase mb-3">Category</p>
          <h1 className="font-display text-6xl md:text-7xl font-light leading-none">
            Data Visualisation
          </h1>
        </header>
      </FadeUp>
      {featured && (
        <FadeUp delay={0.1}>
          <div className="mb-16">
            <ArticleCard article={featured} variant="featured" />
          </div>
        </FadeUp>
      )}
      {rest.length > 0 && (
        <StaggerList>
          {rest.map((article) => (
            <StaggerItem key={article.id}>
              <ArticleCard article={article} variant="default" />
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  )
}
