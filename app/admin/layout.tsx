// app/admin/layout.tsx

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? ''

  // Nie sprawdzaj auth na stronie logowania
  const isLoginPage = pathname.includes('/admin/login')

  if (!isLoginPage) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')

    return (
      <div className="min-h-screen bg-paper flex">
        <aside className="w-56 shrink-0 border-r border-border flex flex-col">
          <div className="h-14 flex items-center px-6 border-b border-border">
            <Link href="/" className="font-display text-lg tracking-wide hover:text-accent transition-colors">
              ← Site
            </Link>
          </div>
          <nav className="flex flex-col p-4 gap-1">
            <p className="text-xs tracking-widest text-muted uppercase px-2 mb-2 mt-2">Content</p>
            <Link href="/admin" className="text-sm px-2 py-2 text-muted hover:text-ink hover:bg-border/40 transition-colors rounded-sm">
              Dashboard
            </Link>
            <Link href="/admin/articles" className="text-sm px-2 py-2 text-muted hover:text-ink hover:bg-border/40 transition-colors rounded-sm">
              Articles
            </Link>
            <Link href="/admin/articles/new" className="text-sm px-2 py-2 text-muted hover:text-ink hover:bg-border/40 transition-colors rounded-sm">
              New Article
            </Link>
            <Link href="/admin/tags" className="text-sm px-2 py-2 text-muted hover:text-ink hover:bg-border/40 transition-colors rounded-sm">
              Tags
            </Link>
            <p className="text-xs tracking-widest text-muted uppercase px-2 mb-2 mt-4">Moderation</p>
            <Link href="/admin/comments" className="text-sm px-2 py-2 text-muted hover:text-ink hover:bg-border/40 transition-colors rounded-sm">
              Comments
            </Link>
            <Link href="/admin/contacts" className="text-sm px-2 py-2 text-muted hover:text-ink hover:bg-border/40 transition-colors rounded-sm">
              Contacts
            </Link>
          </nav>
          <div className="mt-auto p-4 border-t border-border">
            <p className="text-xs text-muted truncate px-2">{user.email}</p>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-xs text-muted hover:text-ink px-2 py-1 transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    )
  }

  // Strona logowania — bez sidebar
  return <>{children}</>
}
