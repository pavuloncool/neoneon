// components/sections/CategoryTiles.tsx
// Sekcja „Kafelki kategorii” (strona główna).

import { Link } from '@/i18n/navigation'
import { FadeUp } from '@/components/ui/Motion'
import type { Section } from '@/types'

export function CategoryTiles({ section }: { section: Section }) {
  const tiles: { _key: string; category: string; title: string }[] = section.tiles ?? []
  if (tiles.length === 0) return null

  return (
    <FadeUp delay={0.25}>
      {/* SC 1.3.6 — aria-label dla sekcji kategorii */}
      <section aria-label={section.ariaLabel ?? undefined} className="grid md:grid-cols-2 gap-px bg-border mb-20">
        {tiles.map((tile) => (
          <Link
            key={tile._key}
            href={`/${tile.category}`}
            className="bg-paper dark:bg-ink dark:border dark:border-white/10 p-10 group hover:bg-ink dark:hover:bg-white transition-colors duration-500"
          >
            {section.eyebrow && (
              <p className="text-xs tracking-widest text-muted group-hover:text-paper/60 dark:group-hover:text-ink/60 mb-3 uppercase transition-colors">{section.eyebrow}</p>
            )}
            <h2 className="font-display text-4xl font-light group-hover:text-paper dark:text-white dark:group-hover:text-ink transition-colors">{tile.title}</h2>
          </Link>
        ))}
      </section>
    </FadeUp>
  )
}
