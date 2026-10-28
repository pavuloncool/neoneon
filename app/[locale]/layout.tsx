import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { VisualEditing } from 'next-sanity/visual-editing'
import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { cormorant, dmSans, dmMono } from '@/app/fonts'
import { DraftModeBanner } from '@/components/layout/DraftModeBanner'
import { getSiteSettings } from '@/lib/queries'
import type { Metadata } from 'next'

// Domyślne SEO z ustawień strony w Sanity; brakujące pola uzupełnia app/layout.tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings(locale === 'en' ? 'en' : 'pl')
  if (!settings) return {}
  const og = settings.ogImage?.url
    ? { url: settings.ogImage.url, width: settings.ogImage.width ?? undefined, height: settings.ogImage.height ?? undefined, alt: settings.logoAlt ?? 'neoneon' }
    : null
  return {
    ...(settings.siteTitle ? { title: { default: settings.siteTitle, template: settings.titleTemplate ?? '%s' } } : {}),
    ...(settings.description ? { description: settings.description } : {}),
    ...(og ? { openGraph: { type: 'website', url: 'https://neoneon.vercel.app', siteName: 'neoneon', images: [og] } } : {}),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()
  const isDraftMode = (await draftMode()).isEnabled

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body className="bg-paper text-ink antialiased transition-colors duration-300">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        {/* Podgląd szkiców z Presentation Tool w Studio — klikalna edycja treści */}
        {isDraftMode && (
          <>
            <VisualEditing />
            <DraftModeBanner />
          </>
        )}
      </body>
    </html>
  )
}
