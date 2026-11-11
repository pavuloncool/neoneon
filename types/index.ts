import type { PortableTextBlock } from '@portabletext/react'
import type { SanityLink } from '@/lib/links'
import type { Locale } from '@/lib/locales'

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
  seo_title?: string | null // puste → title
  seo_description?: string | null // puste → excerpt
  content: PortableTextBlock[] | null // Portable Text (Sanity)
  category: string // slug dokumentu `category`
  category_title?: string | null // nazwa z dokumentu `category`
  cover_image_url?: string | null
  cover_focal_x?: number | null
  cover_focal_y?: number | null
  status: 'draft' | 'published'
  published_at?: string | null
  created_at: string
  updated_at: string | null // data modyfikacji: contentUpdatedAt, a bez niej publishedAt
  tags?: Tag[]
  faq?: FaqItem[] | null
  locale: Locale
}

export interface FaqItem {
  question: string
  answer: string
}

// Dokument `category` w Sanity (strona kategorii /{locale}/{slug})
export interface CategoryDoc {
  id: string
  title: string
  slug: string
  description?: string | null
  seo_title?: string | null // puste → title
  seo_description?: string | null // puste → description
}

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

// Sekcje page buildera (sanity/schemaTypes/sections) w kształcie z PAGE_PROJECTION w lib/queries.ts
export type Section =
  | HeroSection
  | CategoryTilesSection
  | RecentArticlesSection
  | TextImageSection
  | FeatureGridSection
  | ContactFormSection
  | RichTextSection

export interface CategoryTilesSection {
  _type: 'categoryTiles'
  _key: string
  ariaLabel?: string | null
  eyebrow?: string | null
  tiles?: { _key: string; category: string; title: string }[] | null
}

export interface RecentArticlesSection {
  _type: 'recentArticles'
  _key: string
  heading?: string | null
  limit?: number | null
}

export interface TextImageSection {
  _type: 'textImage'
  _key: string
  image?: SanityImage | null
  body?: PortableTextBlock[] | null
  ctaLabel?: string | null
  ctaLink?: SanityLink | null
}

export interface FeatureGridSection {
  _type: 'featureGrid'
  _key: string
  label?: string | null
  items?: { _key: string; title: string; description?: string | null }[] | null
}

export interface ContactFormSection {
  _type: 'contactForm'
  _key: string
  intro?: PortableTextBlock[] | null
}

export interface RichTextSection {
  _type: 'richText'
  _key: string
  body?: PortableTextBlock[] | null
}

// Sekcja „Nagłówek strony” (sanity/schemaTypes/sections — hero)
export interface HeroSection {
  _type: 'hero'
  _key: string
  variant?: 'large' | 'page' | null
  eyebrow?: string | null
  heading: string
  headingEmphasis?: string | null
  // Linia z rotującym słowem pod tytułem (tylko wariant `large`); brak pól = brak linii
  rotatingPrefix?: string | null
  rotatingWords?: string[] | null
}

export interface Page {
  id: string
  title: string
  slug?: string | null
  isHome?: boolean | null
  width?: 'wide' | 'narrow' | null
  sections?: Section[] | null
  seo?: { title?: string | null; description?: string | null; image?: SanityImage | null } | null
}
