// app/(blog)/[category]/[slug]/page.tsx

import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getArticleBySlug, getCommentsByArticle } from '@/lib/queries'
import { formatDate, readingTime } from '@/lib/utils'
import { TiptapRenderer } from '@/components/blog/TiptapRenderer'
import { TagBadge } from '@/components/blog/TagBadge'
import { CommentForm } from '@/components/blog/CommentForm'
import { FadeUp } from '@/components/ui/Motion'
import type { Metadata } from 'next'
import type { Category } from '@/types'

interface ArticlePageProps {
  params: Promise<{
    category: string
    slug: string
  }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params

  const validCategories: Category[] = ['content-writing', 'ux-strategies']
  if (!validCategories.includes(category as Category)) notFound()

  const article = await getArticleBySlug(slug)
  if (!article) notFound()
  if (article.category !== category) notFound()

  const comments = await getCommentsByArticle(article.id)

  return (
    <article>
      <div className="max-w-5xl mx-auto px-6 py-16">

        <FadeUp>
          <header className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xs tracking-widest text-muted uppercase">
                {article.category === 'content-writing' ? 'Content Writing' : 'UX Strategies'}
              </span>
              <span className="text-border">·</span>
              <span className="text-xs text-muted">
                {article.published_at ? formatDate(article.published_at) : ''}
              </span>
              <span className="text-border">·</span>
              <span className="text-xs text-muted">
                {readingTime(article.content)}
              </span>
            </div>

            {article.cover_image_url ? (
              <div className="grid grid-cols-[1fr_1.2fr] gap-12 items-start">
                <div className="relative mt-4">
                  <div className="absolute -top-3 -left-3 w-full h-full border border-border" />
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={article.cover_image_url}
                      alt={article.title}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center pt-8">
                  <h1 className="font-display text-5xl md:text-6xl font-light leading-tight mb-6">
                    {article.title}
                  </h1>
                  {article.excerpt && (
                    <p className="text-muted text-lg leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <TagBadge key={tag.id} tag={tag} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl">
                <h1 className="font-display text-5xl md:text-7xl font-light leading-tight mb-6">
                  {article.title}
                </h1>
                {article.excerpt && (
                  <p className="text-muted text-lg leading-relaxed mb-6">
                    {article.excerpt}
                  </p>
                )}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </header>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="max-w-3xl mx-auto">
            {article.content && (
              <TiptapRenderer content={article.content} />
            )}

            <div className="mt-16 pt-8 border-t border-border" />

            <section className="mt-2">
              <h2 className="font-display text-3xl font-light mb-8">
                {comments.length > 0
                  ? `${comments.length} comment${comments.length === 1 ? '' : 's'}`
                  : 'Comments'}
              </h2>

              {comments.length > 0 && (
                <ul className="divide-y divide-border mb-4">
                  {comments.map((comment) => (
                    <li key={comment.id} className="py-6">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm font-medium">{comment.author_name}</span>
                        <span className="text-xs text-muted">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-ink leading-relaxed">{comment.body}</p>
                    </li>
                  ))}
                </ul>
              )}

              <CommentForm articleId={article.id} />
            </section>
          </div>
        </FadeUp>
      </div>
    </article>
  )
}
