// app/(blog)/search/page.tsx

import { searchArticles, getArticles, getAllTags } from '@/lib/queries'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { TagBadge } from '@/components/blog/TagBadge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    tag?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, tag } = await searchParams

  const [tags, articles] = await Promise.all([
    getAllTags(),
    q
      ? searchArticles(q)
      : getArticles({ tag }),
  ])

  const hasQuery = q || tag
  const resultCount = articles.length

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">

      {/* Nagłówek */}
      <header className="mb-12">
        <h1 className="font-display text-5xl font-light mb-8">Search</h1>

        {/* Pole wyszukiwania */}
        <form method="GET" action="/search" className="flex gap-0 max-w-xl">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search articles..."
            className="flex-1 bg-transparent border border-border px-4 py-3 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-ink transition-colors"
          />
          <button
            type="submit"
            className="border border-l-0 border-border px-6 py-3 text-xs tracking-widest uppercase text-muted hover:text-ink hover:border-ink transition-colors"
          >
            Search
          </button>
        </form>
      </header>

      {/* Tagi */}
      {tags.length > 0 && (
        <section className="mb-12">
          <p className="text-xs tracking-widest text-muted uppercase mb-4">Filter by tag</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <TagBadge key={t.id} tag={t} active={t.slug === tag} />
            ))}
          </div>
        </section>
      )}

      {/* Wyniki */}
      {hasQuery && (
        <p className="text-xs tracking-widest text-muted uppercase mb-8">
          {resultCount === 0
            ? 'No results'
            : `${resultCount} result${resultCount === 1 ? '' : 's'}`}
          {q && ` for "${q}"`}
          {tag && ` tagged "${tag}"`}
        </p>
      )}

      {articles.length > 0 ? (
        <div>
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} variant="default" />
          ))}
        </div>
      ) : hasQuery ? (
        <p className="text-muted text-sm">Try a different search term or browse by tag.</p>
      ) : (
        <p className="text-muted text-sm">Enter a search term or select a tag above.</p>
      )}

    </div>
  )
}
