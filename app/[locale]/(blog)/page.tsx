// Strona główna — dokument `page` z zaznaczonym „Strona główna” (page builder w Studio)
import { notFound } from 'next/navigation'
import { getHomePage } from '@/lib/queries'
import { PageSections } from '@/components/sections/SectionRenderer'
import { pageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(await getHomePage(locale))
}

export default async function HomePage({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }) {
  const { locale } = await params
  const page = await getHomePage(locale)
  if (!page) notFound()
  return <PageSections page={page} locale={locale} />
}
