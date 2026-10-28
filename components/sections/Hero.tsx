// components/sections/Hero.tsx
// Sekcja „Nagłówek strony”. Wariant `large` = strona główna, `page` = podstrona („O mnie”, „Kontakt”).

import { FadeUp } from '@/components/ui/Motion'
import type { Section } from '@/types'

export function Hero({ section }: { section: Section }) {
  const { variant, eyebrow, heading, headingEmphasis, _key } = section

  if (variant === 'large') {
    const id = `hero-${_key}`
    return (
      /* SC 1.3.6 — aria-labelledby wskazuje na h1 wewnątrz sekcji */
      <section aria-labelledby={id} className="mb-20">
        <FadeUp>
          <h1 id={id} className="font-display text-7xl md:text-8xl font-light leading-none mb-6">
            {heading}
            {headingEmphasis && (
              <>
                <br />
                <em>{headingEmphasis}</em>
              </>
            )}
          </h1>
        </FadeUp>
      </section>
    )
  }

  return (
    <header className="mb-16">
      {eyebrow && <p className="text-xs tracking-widest text-muted uppercase mb-4">{eyebrow}</p>}
      <h1 className="font-display text-6xl md:text-7xl font-light leading-none">{heading}</h1>
    </header>
  )
}
