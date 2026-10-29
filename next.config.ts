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
