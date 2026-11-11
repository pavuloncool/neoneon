import type { MetadataRoute } from 'next'
import { getSitemapData } from '@/lib/queries'
import { buildSitemap } from '@/lib/sitemap'

// Odświeżana co godzinę — nowe artykuły trafiają do sitemapy bez ponownego wdrożenia
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(await getSitemapData())
}
