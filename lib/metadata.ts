// lib/metadata.ts
// Metadane (tytuł, opis, obrazek do udostępnień) stron z page buildera.

import type { Metadata } from 'next'
import type { Page } from '@/types'

export function pageMetadata(page: Page | null): Metadata {
  if (!page?.seo) return {}
  const { title, description, image } = page.seo
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(image?.url
      ? { openGraph: { images: [{ url: image.url, width: image.width ?? undefined, height: image.height ?? undefined }] } }
      : {}),
  }
}
