import type { PortableTextBlock } from '@portabletext/react'

export interface Tag {
  id: string
  name: string
  name_en: string | null
  slug: string
}

export interface Comment {
  id: string
  article_id: string
  author_name: string
  body: string
  approved: boolean
  created_at: string
}

export interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  content: PortableTextBlock[] | null // Portable Text (Sanity)
  category: 'content-writing' | 'ux-strategies' | 'data-visualisation'
  cover_image_url?: string | null
  cover_focal_x?: number | null
  cover_focal_y?: number | null
  status: 'draft' | 'published'
  published_at?: string | null
  created_at: string
  updated_at: string
  tags?: Tag[]
  locale: 'pl' | 'en'
}

export type Category = 'content-writing' | 'ux-strategies' | 'data-visualisation'
