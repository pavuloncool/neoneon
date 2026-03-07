// app/admin/articles/page.tsx

import { getAdminArticles } from '@/lib/queries'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles()

  return (
    <div className="p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-4xl font-light">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="text-xs tracking-widest uppercase px-6 py-3 border border-ink text-ink hover:bg-ink hover:text-paper transition-colors duration-200"
        >
          New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-muted text-sm">No articles yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center justify-between py-4">
              <div className="flex-1 min-w-0 pr-8">
                <p className="text-sm text-ink truncate">{article.title}</p>
                <p className="text-xs text-muted mt-0.5">
                  {article.category} · {formatDate(article.published_at ?? article.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className={`text-xs tracking-widest uppercase ${article.status === 'published' ? 'text-accent' : 'text-muted'}`}>
                  {article.status}
                </span>
                <Link href={`/admin/articles/${article.id}`} className="text-xs text-muted hover:text-ink transition-colors">
                  Edit →
                </Link>
                <Link href={`/${article.category}/${article.slug}`} target="_blank" className="text-xs text-muted hover:text-ink transition-colors">
                  View ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
