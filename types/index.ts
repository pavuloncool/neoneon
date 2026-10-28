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

// ── Treść strony (page builder, ustawienia) ──────────────────

export interface SanityImage {
  url: string
  alt?: string | null
  width?: number | null
  height?: number | null
  hotspot?: { x: number; y: number } | null
}

export interface NavItem {
  label: string
  link: import('@/lib/links').SanityLink | null
}

export interface SiteSettings {
  siteTitle?: string | null
  titleTemplate?: string | null
  description?: string | null
  ogImage?: SanityImage | null
  logoLight?: SanityImage | null
  logoDark?: SanityImage | null
  logoAlt?: string | null
  navigation?: NavItem[] | null
  footerText?: string | null
  footerLinks?: NavItem[] | null
  a11y?: {
    skipToContent?: string | null
    mainNav?: string | null
    mobileNav?: string | null
    footerNav?: string | null
    search?: string | null
    menu?: string | null
    themeToggle?: string | null
    languagePl?: string | null
    languageEn?: string | null
  } | null
}

export type Section = { _type: string; _key: string } & Record<string, any>

export interface Page {
  id: string
  title: string
  slug?: string | null
  isHome?: boolean | null
  width?: 'wide' | 'narrow' | null
  sections?: Section[] | null
  seo?: { title?: string | null; description?: string | null; image?: SanityImage | null } | null
}
