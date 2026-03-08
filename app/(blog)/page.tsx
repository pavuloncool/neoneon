// app/(blog)/page.tsx
import { getArticles } from '@/lib/queries'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { FadeUp, StaggerList, StaggerItem } from '@/components/ui/Motion'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Name — Content Writing & UX Strategies',
}

export default async function HomePage() {
  const recent = await getArticles({ limit: 6 })

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <section className="mb-20">
        <FadeUp>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-none mb-6">
            Writing<br />
            <em>that works.</em>
          </h1>
        </FadeUp>
        <FadeUp delay={0.15}>
          <p className="text-muted text-lg max-w-xl">
            Exploring the intersection of content strategy and user experience design.
          </p>
        </FadeUp>
      </section>

      <FadeUp delay={0.25}>
        <section className="grid md:grid-cols-2 gap-px bg-border mb-20">
          <Link href="/content-writing" className="bg-paper dark:bg-ink dark:border dark:border-white/10 p-10 group hover:bg-ink dark:hover:bg-white transition-colors duration-500">
            <p className="text-xs tracking-widest text-muted group-hover:text-paper/60 dark:group-hover:text-ink/60 mb-3 uppercase transition-colors">Category</p>
            <h2 className="font-display text-4xl font-light group-hover:text-paper dark:text-white dark:group-hover:text-ink transition-colors">Content Writing</h2>
          </Link>
          <Link href="/ux-strategies" className="bg-paper dark:bg-ink dark:border dark:border-white/10 p-10 group hover:bg-ink dark:hover:bg-white transition-colors duration-500">
            <p className="text-xs tracking-widest text-muted group-hover:text-paper/60 dark:group-hover:text-ink/60 mb-3 uppercase transition-colors">Category</p>
            <h2 className="font-display text-4xl font-light group-hover:text-paper dark:text-white dark:group-hover:text-ink transition-colors">UX Strategies</h2>
          </Link>
        </section>
      </FadeUp>

      {recent.length > 0 && (
        <section>
          <FadeUp delay={0.35}>
            <h3 className="text-xs tracking-widest text-muted uppercase mb-4">Recent</h3>
          </FadeUp>
          <StaggerList>
            {recent.map((article) => (
              <StaggerItem key={article.id}>
                <Link
                  href={`/${article.category}/${article.slug}`}
                  className="flex flex-col md:flex-row md:items-baseline justify-between px-4 py-5 gap-2 group border-t border-border hover:bg-ink dark:hover:bg-white transition-colors duration-300"
                >
                  <span className="font-display text-2xl font-light group-hover:text-paper dark:group-hover:text-ink transition-colors duration-300">
                    {article.title}
                  </span>
                  <span className="text-sm text-muted group-hover:text-paper/60 dark:group-hover:text-ink/60 shrink-0 transition-colors duration-300">
                    {article.published_at ? formatDate(article.published_at) : ''}
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>
        </section>
      )}
    </div>
  )
}
