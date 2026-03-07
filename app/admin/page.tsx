// app/admin/page.tsx

import { getAdminArticles, getPendingComments } from '@/lib/queries'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [articles, pendingComments] = await Promise.all([
    getAdminArticles(),
    getPendingComments(),
  ])

  const published = articles.filter((a) => a.status === 'published').length
  const drafts = articles.filter((a) => a.status === 'draft').length

  return (
    <div className="p-10 max-w-4xl">
      <h1 className="font-display text-4xl font-light mb-10">Dashboard</h1>

      {/* Statystyki */}
      <div className="grid grid-cols-3 gap-px bg-border mb-12">
        {[
          { label: 'Published', value: published },
          { label: 'Drafts', value: drafts },
          { label: 'Pending comments', value: pendingComments.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-paper px-6 py-8">
            <p className="text-3xl font-display font-light mb-1">{value}</p>
            <p className="text-xs tracking-widest text-muted uppercase">{label}</p>
          </div>
        ))}
      </div>

      {/* Szybkie akcje */}
      <div className="flex gap-4 mb-12">
        <Link
          href="/admin/articles/new"
          className="text-xs tracking-widest uppercase px-6 py-3 border border-ink text-ink hover:bg-ink hover:text-paper transition-colors duration-200"
        >
          New article
        </Link>
        {pendingComments.length > 0 && (
          <Link
            href="/admin/comments"
            className="text-xs tracking-widest uppercase px-6 py-3 border border-border text-muted hover:border-ink hover:text-ink transition-colors duration-200"
          >
            Review comments ({pendingComments.length})
          </Link>
        )}
      </div>

      {/* Ostatnie artykuły */}
      <section>
        <p className="text-xs tracking-widest text-muted uppercase mb-4">Recent articles</p>
        <div className="flex flex-col divide-y divide-border">
          {articles.slice(0, 8).map((article) => (
            <div key={article.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-ink">{article.title}</p>
                <p className="text-xs text-muted mt-0.5">{article.category}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs tracking-widest uppercase ${article.status === 'published' ? 'text-accent' : 'text-muted'}`}>
                  {article.status}
                </span>
                <Link
                  href={`/admin/articles/${article.id}`}
                  className="text-xs text-muted hover:text-ink transition-colors"
                >
                  Edit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
