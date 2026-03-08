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
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const href = `/${article.category}/${article.slug}`
  const date = article.published_at ? formatDate(article.published_at) : ''
  const time = readingTime(article.content)

  if (variant === 'featured') {
    return (
      <motion.article
        className="group border-t border-border py-8"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={href} className="flex flex-col md:flex-row gap-8">
          {article.cover_image_url && (
            <div className="relative shrink-0 w-full md:w-64 aspect-[4/3] overflow-hidden">
              <Image
                src={article.cover_image_url}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 256px"
              />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <p className="text-xs tracking-widest text-muted uppercase mb-3">
              {date} · {time}
            </p>
            <h2 className="font-display text-4xl font-light leading-tight mb-3 group-hover:text-ink transition-colors duration-200">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-muted text-sm leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
            )}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {article.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
          </div>
        </Link>
      </motion.article>
    )
  }

  return (
    <motion.article
      className="group border-t border-border py-6"
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={href} className="flex flex-col md:flex-row gap-6">
        {article.cover_image_url && (
          <div className="relative shrink-0 w-full md:w-48 aspect-[4/3] overflow-hidden">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 192px"
            />
          </div>
        )}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-xs tracking-widest text-muted uppercase mb-2">
              {date} · {time}
            </p>
            <h3 className="font-display text-2xl font-light leading-snug mb-2 group-hover:text-ink transition-colors duration-200">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-muted text-sm leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
            )}
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {article.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
