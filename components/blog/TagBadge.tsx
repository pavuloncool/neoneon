// components/blog/TagBadge.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

interface TagBadgeProps {
  tag: Tag
  active?: boolean
  href?: string
  className?: string
}

export function TagBadge({ tag, active = false, href, className }: TagBadgeProps) {
  const resolvedHref = href ?? `/search?tag=${tag.slug}`

  return (
    <Link
      href={resolvedHref}
      className={cn(
        'inline-block text-xs tracking-widest uppercase px-3 py-1 border transition-colors duration-200',
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-border text-muted hover:border-ink hover:text-ink',
        className
      )}
    >
      {tag.name}
    </Link>
  )
}
