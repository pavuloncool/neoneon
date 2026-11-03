import localFont from 'next/font/local'

// Pliki w styles/fonts/ (Google Fonts przycięte do latin + latin-ext) — build nie pobiera fontów z sieci

// Tylko używane warianty: 300 — tytuły (font-display font-light), 300 kursywa — druga linia nagłówka strony głównej,
// 600 — nagłówki w treści (.article-body), 700 — pogrubienie w tych nagłówkach (<strong> w <h2>)
export const cormorant = localFont({
  src: [
    { path: '../styles/fonts/cormorant-garamond-300.woff2', weight: '300', style: 'normal' },
    { path: '../styles/fonts/cormorant-garamond-300-italic.woff2', weight: '300', style: 'italic' },
    { path: '../styles/fonts/cormorant-garamond-600.woff2', weight: '600', style: 'normal' },
    { path: '../styles/fonts/cormorant-garamond-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})

export const dmSans = localFont({
  src: [
    { path: '../styles/fonts/dm-sans-300.woff2', weight: '300', style: 'normal' },
    { path: '../styles/fonts/dm-sans-400.woff2', weight: '400', style: 'normal' },
    { path: '../styles/fonts/dm-sans-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const dmMono = localFont({
  src: [
    { path: '../styles/fonts/dm-mono-400.woff2', weight: '400', style: 'normal' },
    { path: '../styles/fonts/dm-mono-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-dm-mono',
  display: 'swap',
  // Tylko bloki kodu w artykułach — bez preloadu, pobierany dopiero gdy strona go użyje
  preload: false,
})
