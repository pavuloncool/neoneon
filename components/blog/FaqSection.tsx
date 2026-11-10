// components/blog/FaqSection.tsx
// Widoczna sekcja FAQ na końcu artykułu — z tego samego pola `faq` co FaqJsonLd,
// więc treść dla czytelników i dane strukturalne są zawsze zgodne.
// Natywne <details>: działa bez JS, a odpowiedzi są w HTML (widoczne dla wyszukiwarek).
import type { FaqItem } from '@/types'

export function FaqSection({ faq, heading }: { faq?: FaqItem[] | null; heading: string }) {
  const items = (faq ?? []).filter((item) => item?.question?.trim() && item?.answer?.trim())
  if (items.length === 0) return null

  return (
    <section className="mt-16" aria-labelledby="faq">
      <h2 id="faq" className="font-display text-3xl font-light mb-6 scroll-mt-20">{heading}</h2>
      <div className="divide-y divide-border border-y border-border">
        {items.map((item, i) => (
          <details key={i} className="group/faq py-5">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg leading-snug [&::-webkit-details-marker]:hidden">
              <h3 className="font-medium">{item.question}</h3>
              <span aria-hidden className="mt-0.5 shrink-0 text-2xl font-light leading-none text-muted transition-transform duration-200 group-open/faq:rotate-45 dark:text-white/60">+</span>
            </summary>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted dark:text-white/70">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
