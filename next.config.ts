import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // Dawne polskie adresy sprzed page buildera (zaindeksowane w Google) → nowe slugi
  async redirects() {
    return [
      { source: '/pl/about', destination: '/pl/o-mnie', permanent: true },
      { source: '/pl/contact', destination: '/pl/kontakt', permanent: true },
    ]
  },
  // Umami (analityka bez cookies) serwowana z własnej domeny — mniej blokowana przez adblockery
  async rewrites() {
    return [
      { source: '/stats/script.js', destination: 'https://cloud.umami.is/script.js' },
      { source: '/stats/api/send', destination: 'https://cloud.umami.is/api/send' },
    ]
  },
  // Poza produkcją (podglądy Vercel, lokalne buildy) — noindex na każdej odpowiedzi
  async headers() {
    if (process.env.VERCEL_ENV === 'production') return []
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
  images: {
    remotePatterns: [
      {
        // Sanity CDN (obrazy artykułów)
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
