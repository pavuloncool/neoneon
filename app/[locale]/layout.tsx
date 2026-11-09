import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import Script from 'next/script'
import { routing } from '@/i18n/routing'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { cormorant, dmSans, dmMono } from '@/app/fonts'
import { DraftTools } from '@/components/layout/DraftTools'
import { getSiteSettings } from '@/lib/queries'
import { OG_LOCALE, SITE_NAME, SITE_URL, localeUrl } from '@/lib/site'
import type { Metadata } from 'next'

const MOTION_BOOTSTRAP =
  "(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(window.__motionReady!==true){d.classList.remove('js');window.__motionFallback=true}},3000)})()"

// Domyślne SEO z ustawień strony w Sanity; brakujące pola uzupełnia app/layout.tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'pl'
  const settings = await getSiteSettings(lang)
  if (!settings) return {}
  const og = settings.ogImage?.url
    ? { url: settings.ogImage.url, width: settings.ogImage.width ?? undefined, height: settings.ogImage.height ?? undefined, alt: settings.logoAlt ?? 'neoneon' }
    : null
  return {
    ...(settings.siteTitle ? { title: { default: settings.siteTitle, template: settings.titleTemplate ?? '%s' } } : {}),
    ...(settings.description ? { description: settings.description } : {}),
    ...(og ? { openGraph: { type: 'website', url: localeUrl(lang), siteName: SITE_NAME, locale: OG_LOCALE[lang], images: [og] } } : {}),
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
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        {/* Znacznik JS przed hydracją — CSS ustawia stany startowe animacji tylko pod html.js.
            Siatka bezpieczeństwa: jeśli GSAP nie wystartował w 3 s, zdejmujemy znacznik i treść jest widoczna. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOTSTRAP }} />
      </head>
      <body className="bg-paper text-ink antialiased transition-colors duration-300">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        {/* Podgląd szkiców z Presentation Tool w Studio — klikalna edycja treści */}
        {isDraftMode && <DraftTools />}
        {/* Umami — analityka bez cookies; data-domains pomija podglądy Vercel i localhost */}
        {!isDraftMode && umamiWebsiteId && (
          <Script
            src="/stats/script.js"
            data-website-id={umamiWebsiteId}
            data-host-url="/stats"
            data-domains={new URL(SITE_URL).hostname}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
