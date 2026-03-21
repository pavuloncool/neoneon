'use client'
// components/blog/ArticleCard.tsx
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatDate, readingTime } from '@/lib/utils'
import { TagBadge } from '@/components/blog/TagBadge'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'featured'
  locale?: string
}

export function ArticleCard({ article, variant = 'default', locale = 'pl' }: ArticleCardProps) {
  const href = `/${article.category}/${article.slug}`
  const date = article.published_at ? formatDate(article.published_at, locale === 'pl' ? 'pl-PL' : 'en-GB') : ''
  const time = readingTime(article.content, locale)

  if (variant === 'featured') {
    return (
      <motion.article className="group py-8" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
        <Link href={href} className="flex flex-col md:flex-row gap-8">
          {article.cover_image_url && (
            <div className="relative shrink-0 w-full md:w-64 aspect-[4/3] overflow-hidden">
              <Image src={article.cover_image_url} alt={article.title} fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 256px" />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-widest text-muted dark:text-white/60 group-hover:text-ink/50 dark:group-hover:text-ink/50 mb-3 transition-colors duration-300">
              {date} · {time}
            </p>
            <h2 className="font-display text-4xl font-light leading-tight mb-3 text-ink dark:text-white group-hover:text-ink dark:group-hover:text-ink transition-colors duration-300">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-muted dark:text-white/60 group-hover:text-ink/60 dark:group-hover:text-ink/60 text-sm leading-relaxed line-clamp-3 transition-colors duration-300">
                {article.excerpt}
              </p>
            )}
          </div>
        </Link>
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
          </div>
        )}
      </motion.article>
    )
  }

  return (
    <motion.article
      className="group border-t border-border dark:border-white/10 py-6 px-4 -mx-4 hover:bg-ink dark:hover:bg-white transition-colors duration-300"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={href} className="flex flex-col md:flex-row gap-6">
        {article.cover_image_url && (
          <div className="relative shrink-0 w-full md:w-48 aspect-[4/3] overflow-hidden">
            <Image src={article.cover_image_url} alt={article.title} fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 192px" />
          </div>
        )}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-xs tracking-widest text-muted dark:text-white/60 group-hover:text-paper/60 dark:group-hover:text-ink/50 mb-2 transition-colors duration-300">
              {date} · {time}
            </p>
            <h3 className="font-display text-2xl font-light leading-snug mb-2 text-ink dark:text-white group-hover:text-paper dark:group-hover:text-ink transition-colors duration-300">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-muted dark:text-white/60 group-hover:text-paper/70 dark:group-hover:text-ink/60 text-sm leading-relaxed line-clamp-2 transition-colors duration-300">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </Link>
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {article.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
        </div>
      )}
    </motion.article>
  )
}
