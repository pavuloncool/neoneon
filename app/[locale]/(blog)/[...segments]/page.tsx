export const dynamic = 'force-dynamic'

import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getArticleBySlug, getCommentsByArticle, getArticleTranslation, getPage } from '@/lib/queries'
import { PageSections } from '@/components/sections/SectionRenderer'
import { CategoryPage } from '@/components/blog/CategoryPage'
import { resolveCategory } from '@/lib/categoryRoute'
import { legacyCategory } from '@/lib/categories'
import { pageMetadata, seoMetadata } from '@/lib/metadata'
import { SITE_NAME, SITE_URL, localeUrl } from '@/lib/site'
import { DATE_LOCALE, otherLocale, type Locale } from '@/lib/locales'
import { JsonLd } from '@/components/seo/JsonLd'
import { FaqJsonLd } from '@/components/seo/FaqJsonLd'
import { formatDate, readingTime } from '@/lib/utils'
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer'
import { ArticleScroll } from '@/components/blog/ArticleScroll'
import { FaqSection } from '@/components/blog/FaqSection'
import { TagBadge } from '@/components/blog/TagBadge'
import { CommentForm } from '@/components/blog/CommentForm'
import { FadeUp } from '@/components/ui/Motion'
import { TranslationStore } from '@/components/layout/TranslationStore'
import type { Metadata } from 'next'
import { stegaClean } from 'next-sanity'

interface ArticlePageProps {
  params: Promise<{ locale: Locale; segments: string[] }>
  searchParams: Promise<{ tag?: string }>
}

// /{locale}/{slug} = kategoria (dokument `category`, w okresie przejściowym też lista z kodu),
//   a gdy to nie kategoria — strona z page buildera („O mnie”, „Kontakt”, nowe strony); inaczej 404.
//   Walidacja w Studio nie pozwala, by kategoria i strona miały ten sam slug w jednym języku.
// /{locale}/{kategoria}/{slug} = artykuł
function getRouteParams(segments: string[]) {
  if (segments.length !== 2) notFound()
  return { category: segments[0], slug: segments[1] }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, segments } = await params
  if (segments.length === 1) {
    const category = await resolveCategory(locale, segments[0])
    if (category) {
      // Filtr ?tag= nie tworzy osobnych adresów — canonical wskazuje stronę kategorii
      return seoMetadata({
        locale,
        path: `/${category.slug}`,
        altPath: category.altSlug !== null ? `/${category.altSlug}` : null,
        title: category.seoTitle,
        description: category.seoDescription,
      })
    }
    return pageMetadata(await getPage(locale, segments[0]), locale)
  }
  const { slug } = getRouteParams(segments)
  const article = await getArticleBySlug(slug, locale)
  if (!article) return {}
  const translation = await getArticleTranslation(article.id, otherLocale(locale))
  // W podglądzie tytuł i zajawka niosą znaczniki edycji (stega) — w metadanych są zbędne
  const title = stegaClean(article.title)
  return seoMetadata({
    locale,
    path: `/${article.category}/${article.slug}`,
    altPath: translation ? `/${translation.category}/${translation.slug}` : null,
    // Tytuł SEO / Opis SEO są nieobowiązkowe — puste pole = tytuł i zajawka
    title: stegaClean(article.seo_title)?.trim() || title,
    description: stegaClean(article.seo_description)?.trim() || stegaClean(article.excerpt),
    image: article.cover_image_url ? { url: article.cover_image_url, alt: title } : null,
    article: { publishedTime: article.published_at, modifiedTime: article.updated_at },
  })
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const { locale, segments } = await params

  if (segments.length === 1) {
    const category = await resolveCategory(locale, segments[0])
    if (category) return <CategoryPage category={category} locale={locale} tag={(await searchParams).tag} />
    const page = await getPage(locale, segments[0])
    if (!page) notFound()
    return <PageSections page={page} locale={locale} />
  }

  const { category, slug } = getRouteParams(segments)

  const article = await getArticleBySlug(slug, locale)
  if (!article) notFound()
  if (article.category !== category) notFound()

  const comments = await getCommentsByArticle(article.id)
  const t = await getTranslations('comments')
  const tArticle = await getTranslations('article')

  const targetLocale = otherLocale(locale)
  const translation = await getArticleTranslation(article.id, targetLocale)

  // Nazwa z dokumentu `category`; bez referencji — dotychczasowa nazwa z kodu
  const categoryLabel = article.category_title ?? legacyCategory(article.category)?.title ?? article.category

  const dateLocale = DATE_LOCALE[locale]

  return (
    <>
      {translation && (
        <TranslationStore path={`/${translation.category}/${translation.slug}`} />
      )}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: stegaClean(article.title),
          description: stegaClean(article.excerpt) ?? undefined,
          image: article.cover_image_url ?? undefined,
          datePublished: article.published_at ?? undefined,
          dateModified: article.updated_at ?? undefined,
          inLanguage: locale,
          url: localeUrl(locale, `/${article.category}/${article.slug}`),
          mainEntityOfPage: localeUrl(locale, `/${article.category}/${article.slug}`),
          author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        }}
      />
      <FaqJsonLd faq={article.faq} />
      <article>
        {/* Pasek postępu czytania + odsłanianie nagłówków h2 */}
        <ArticleScroll />
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
          <FadeUp lcp="solid">
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
            <div className="max-w-3xl mx-auto" data-article-body="">
              {article.content && <PortableTextRenderer content={article.content} />}
              <FaqSection faq={article.faq} heading={tArticle('faqHeading')} />
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
