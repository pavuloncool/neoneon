// Strona główna — dokument `page` z zaznaczonym „Strona główna” (page builder w Studio)
import { notFound } from 'next/navigation'
import { getHomePage, getSiteSettings } from '@/lib/queries'
import { PageSections } from '@/components/sections/SectionRenderer'
import { JsonLd } from '@/components/seo/JsonLd'
import { pageMetadata } from '@/lib/metadata'
import { SITE_NAME, SITE_URL, localeUrl } from '@/lib/site'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(await getHomePage(locale), locale)
}

export default async function HomePage({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }) {
  const { locale } = await params
  const [page, settings] = await Promise.all([getHomePage(locale), getSiteSettings(locale)])
  if (!page) notFound()
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: localeUrl(locale),
          inLanguage: locale,
          description: page.seo?.description ?? settings?.description ?? undefined,
          publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        }}
      />
      <PageSections page={page} locale={locale} />
    </>
  )
}
