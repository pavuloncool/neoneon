import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import '@/styles/globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'neoneon — Content Writing & UX Strategies',
    template: '%s | neoneon',
  },
  description: 'Writing about online content strategy, UX design and digital communication that work for AI-powered search engines.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://neoneon.vercel.app',
    siteName: 'neoneon',
    title: 'neoneon — Content Writing & UX Strategies',
    description: 'Writing about online content strategy, UX design and digital communication that work for AI-powered search engines.',
    images: [
      {
        url: 'https://neoneon.vercel.app/neoneon-og.jpeg',
        width: 1200,
        height: 630,
        alt: 'neoneon',
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink antialiased transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
