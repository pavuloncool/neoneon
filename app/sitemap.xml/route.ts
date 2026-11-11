import { resolveRouteData } from 'next/dist/build/webpack/loaders/metadata/resolve-route-data'
import { getSitemapData } from '@/lib/queries'
import { buildSitemap } from '@/lib/sitemap'

// Sitemapa generowana przy zapytaniu, z cache na CDN Vercel (godzina świeża, potem doba stale-while-revalidate).
// Wcześniej app/sitemap.ts z `revalidate = 3600`: Vercel serwował treść z builda jako plik statyczny
// (pathType „static”, bez wywołań funkcji) i nigdy jej nie regenerował — sitemapa zmieniała się tylko przy wdrożeniu.
// Konwencja sitemap.ts nie pozwala ustawić nagłówka (Next wpisuje na stałe max-age=0), stąd zwykła trasa.
export const dynamic = 'force-dynamic'

export async function GET() {
  // Ten sam serializer, którego Next używa dla sitemap.ts — treść XML bez zmian
  const xml = resolveRouteData(buildSitemap(await getSitemapData()), 'sitemap')
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
