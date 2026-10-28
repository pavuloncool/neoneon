// components/sections/RecentArticles.tsx
// Sekcja „Najnowsze artykuły” (strona główna).

import { getArticles } from '@/lib/queries'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/utils'
import { FadeUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import type { Section } from '@/types'

export async function RecentArticles({ section, locale }: { section: Section; locale: 'pl' | 'en' }) {
  const recent = await getArticles({ limit: section.limit ?? 6, locale })
  if (recent.length === 0) return null

  const id = `recent-${section._key}`
  const dateLocale = locale === 'pl' ? 'pl-PL' : 'en-GB'

  return (
    /* SC 1.3.6 — aria-labelledby wskazuje na nagłówek sekcji */
    <section aria-labelledby={id}>
      <FadeUp delay={0.35}>
        <h3 id={id} className="text-xs tracking-widest text-muted uppercase mb-4">{section.heading}</h3>
      </FadeUp>
      <StaggerList>
        {recent.map((article) => {
          const dateIso = article.published_at ?? article.created_at
          return (
            <StaggerItem key={article.id}>
              {/* SC 1.3.1 — aria-label łączy tytuł i datę w jedną czytelną nazwę linku */}
              <Link
                href={`/${article.category}/${article.slug}`}
                aria-label={`${article.title}, ${formatDate(dateIso, dateLocale)}`}
                className="flex flex-col md:flex-row md:items-baseline justify-between px-4 py-5 gap-2 group border-t border-border hover:bg-ink dark:hover:bg-white transition-colors duration-300"
              >
                <span className="font-display text-2xl font-light group-hover:text-paper dark:group-hover:text-ink transition-colors duration-300">{article.title}</span>
                {/* SC 1.3.1 — <time> z atrybutem datetime dla czytników ekranu i robotów */}
                <time
                  dateTime={dateIso}
                  className="text-sm text-muted group-hover:text-paper/60 dark:group-hover:text-ink/60 shrink-0 transition-colors duration-300"
                >
                  {formatDate(dateIso, dateLocale)}
                </time>
              </Link>
            </StaggerItem>
          )
        })}
      </StaggerList>
    </section>
  )
}
