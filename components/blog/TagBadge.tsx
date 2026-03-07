// components/blog/TagBadge.tsx

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

interface TagBadgeProps {
  tag: Tag
  active?: boolean
  className?: string
}

export function TagBadge({ tag, active = false, className }: TagBadgeProps) {
  return (
    <Link
      href={`/search?tag=${tag.slug}`}
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
