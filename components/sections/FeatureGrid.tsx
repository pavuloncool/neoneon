// components/sections/FeatureGrid.tsx
// Sekcja „Siatka obszarów” („O mnie”: Obszary działania).

import type { Section } from '@/types'

export function FeatureGrid({ section }: { section: Section }) {
  const items: { _key: string; title: string; description?: string }[] = section.items ?? []

  return (
    <section className="border-t border-border pt-12">
      {section.label && <p className="text-xs tracking-widest text-muted uppercase mb-8">{section.label}</p>}
      <div className="grid md:grid-cols-2 gap-px bg-border">
        {items.map((item) => (
          <div key={item._key} className="bg-paper dark:bg-ink text-ink dark:text-paper p-8">
            <h3 className="font-display text-xl font-light mb-2">{item.title}</h3>
            {item.description && <p className="text-sm text-muted leading-relaxed">{item.description}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
