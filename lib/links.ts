// lib/links.ts
// Link z Sanity (typ `link`) → adres na stronie. Adresy wewnętrzne są bez prefiksu języka —
// dodaje go Link z next-intl (@/i18n/navigation).

export interface SanityLink {
  linkType?: 'page' | 'category' | 'search' | 'external'
  category?: string
  url?: string
  page?: { slug?: string | null; isHome?: boolean | null } | null
}

export interface ResolvedLink {
  href: string
  external: boolean
}

export function resolveHref(link?: SanityLink | null): ResolvedLink | null {
  switch (link?.linkType) {
    case 'page':
      if (!link.page) return null
      return { href: link.page.isHome ? '/' : `/${link.page.slug ?? ''}`, external: false }
    case 'category':
      return link.category ? { href: `/${link.category}`, external: false } : null
    case 'search':
      return { href: '/search', external: false }
    case 'external':
      return link.url ? { href: link.url, external: true } : null
    default:
      return null
  }
}

// Projekcja GROQ dla pola typu `link`
export const LINK_PROJECTION = `{ linkType, category, url, "page": page->{ "slug": slug.current, isHome } }`
