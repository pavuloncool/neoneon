import type { Metadata } from 'next'
import '@/styles/globals.css'

// Tytuł domyślny i szablon tytułów pochodzą z ustawień strony w Sanity
// (generateMetadata w app/[locale]/layout.tsx); tu tylko wartości awaryjne.
export const metadata: Metadata = {
  description: 'Writing about online content strategy, UX design and digital communication that work for AI-powered search engines.',
  openGraph: {
    type: 'website',
    url: 'https://neoneon.vercel.app',
    siteName: 'neoneon',
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

// Root layout — minimal shell wymagany przez Next.js.
// Lang i body są ustawiane w [locale]/layout.tsx, który ma dostęp do locale.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}
