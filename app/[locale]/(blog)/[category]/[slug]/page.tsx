export const dynamic = 'force-dynamic'

import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getArticleBySlug, getCommentsByArticle, getArticleTranslation } from '@/lib/queries'
import { formatDate, readingTime } from '@/lib/utils'
import { TiptapRenderer } from '@/components/blog/TiptapRenderer'
import { TagBadge } from '@/components/blog/TagBadge'
import { CommentForm } from '@/components/blog/CommentForm'
import { FadeUp } from '@/components/ui/Motion'
import { TranslationStore } from '@/components/layout/TranslationStore'
import type { Metadata } from 'next'
import type { Category } from '@/types'

interface ArticlePageProps {
  params: Promise<{ locale: 'pl' | 'en'; category: string; slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const article = await getArticleBySlug(slug, locale)
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
  const { category, slug, locale } = await params

  const validCategories: Category[] = ['content-writing', 'ux-strategies', 'data-visualisation']
  if (!validCategories.includes(category as Category)) notFound()

  const article = await getArticleBySlug(slug, locale)
  if (!article) notFound()
  if (article.category !== category) notFound()

  const comments = await getCommentsByArticle(article.id)
  const t = await getTranslations('comments')

  const targetLocale = locale === 'pl' ? 'en' : 'pl'
  const translation = article.translation_id
    ? await getArticleTranslation(article.translation_id, targetLocale)
    : null

  const categoryLabel =
    article.category === 'content-writing' ? 'Content Writing' :
    article.category === 'ux-strategies' ? 'UX Strategies' : 'Data Visualisation'

  const dateLocale = locale === 'pl' ? 'pl-PL' : 'en-GB'

  return (
    <>
      {translation && (
        <TranslationStore slug={translation.slug} category={translation.category} />
      )}
      <article>
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <FadeUp>
            <header className="mb-10 md:mb-14">
              {article.cover_image_url ? (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-8 md:gap-12 items-start">
                  <div className="relative" style={{ paddingBottom: '125%' }}>
                    <Image src={article.cover_image_url} alt={article.title} fill priority
                      className="object-cover"
                      style={{ objectPosition: `${(article.cover_focal_x ?? 0.5) * 100}% ${(article.cover_focal_y ?? 0.5) * 100}%` }}
                      sizes="(max-width: 768px) 100vw, 45vw" />
                  </div>
                  <div className="flex flex-col justify-center md:pt-4">
                    <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-light leading-[1.02] tracking-tight mb-8">
                      {article.title}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs tracking-widest text-muted dark:text-white/60 uppercase">{categoryLabel}</span>
                      <span className="text-border">·</span>
                      <span className="text-xs text-muted dark:text-white/60">{article.published_at ? formatDate(article.published_at, dateLocale) : ''}</span>
                      <span className="text-border">·</span>
                      <span className="text-xs text-muted dark:text-white/60">{readingTime(article.content, locale)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <span className="text-xs tracking-widest text-muted dark:text-white/60 uppercase">{categoryLabel}</span>
                    <span className="text-border">·</span>
                    <span className="text-xs text-muted dark:text-white/60">{article.published_at ? formatDate(article.published_at, dateLocale) : ''}</span>
                    <span className="text-border">·</span>
                    <span className="text-xs text-muted dark:text-white/60">{readingTime(article.content, locale)}</span>
                  </div>
                  <h1 className="font-display text-5xl md:text-8xl font-light leading-tight mb-6">{article.title}</h1>
                </div>
              )}
              {(article.excerpt || (article.tags && article.tags.length > 0)) && (
                <div className="mt-8 md:mt-10 pt-8 border-t border-border max-w-3xl">
                  {article.excerpt && <p className="text-muted dark:text-white/70 text-lg leading-relaxed mb-5">{article.excerpt}</p>}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
                    </div>
                  )}
                </div>
              )}
            </header>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="max-w-3xl mx-auto">
              {article.content && <TiptapRenderer content={article.content} />}
              <div className="mt-16 pt-8 border-t border-border" />
              <section className="mt-2 pb-8">
                <h2 className="font-display text-3xl font-light mb-8">
                  {comments.length === 0 ? t('sectionZero') : comments.length === 1 ? t('sectionOne') : t('sectionMany', { count: comments.length })}
                </h2>
                {comments.length > 0 && (
                  <ul className="divide-y divide-border mb-4">
                    {comments.map((comment) => (
                      <li key={comment.id} className="py-6">
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-sm font-medium">{comment.author_name}</span>
                          <span className="text-xs text-muted dark:text-white/60">{formatDate(comment.created_at, dateLocale)}</span>
                        </div>
                        <p className="text-sm text-ink dark:text-white/90 leading-relaxed">{comment.body}</p>
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
    </>
  )
}
