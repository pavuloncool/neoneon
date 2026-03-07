import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Nagłówki — szeryfowa, elegancka (klasa: font-display)
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        // Body — bezszeryfowa, czytelna (klasa: font-sans)
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        // Mono — kod (klasa: font-mono)
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        ink: '#0f0f0f',
        paper: '#fafaf8',
        muted: '#6b6b6b',
        accent: '#c8a96e',       // złoto — subtelny akcent
        border: '#e5e5e0',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#0f0f0f',
            fontFamily: 'var(--font-dm-sans)',
            'h1, h2, h3, h4': {
              fontFamily: 'var(--font-cormorant)',
              fontWeight: '600',
            },
            a: {
              color: '#0f0f0f',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            },
            'a:hover': {
              color: '#c8a96e',
            },
            blockquote: {
              borderLeftColor: '#c8a96e',
              fontStyle: 'italic',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.25rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
