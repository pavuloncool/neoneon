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

  const isLoginPage = pathname.includes('/admin/login')
  if (!isLoginPage) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')
    return (
      <div
        className="min-h-screen bg-[#fafaf8] text-[#0f0f0f] flex"
        style={{ colorScheme: 'light' }}
        data-theme="light"
      >
        <aside className="w-56 shrink-0 border-r border-[#e5e5e0] flex flex-col bg-[#fafaf8]">
          <div className="h-14 flex items-center px-6 border-b border-[#e5e5e0]">
            <Link href="/" className="font-display text-lg tracking-wide text-[#0f0f0f] hover:text-[#c8a96e] transition-colors">
              ← Site
            </Link>
          </div>
          <nav className="flex flex-col p-4 gap-1">
            <p className="text-xs tracking-widest text-[#6b6b6b] uppercase px-2 mb-2 mt-2">Content</p>
            <Link href="/admin" className="text-sm px-2 py-2 text-[#6b6b6b] hover:text-[#0f0f0f] hover:bg-[#e5e5e0]/40 transition-colors rounded-sm">Dashboard</Link>
            <Link href="/admin/articles" className="text-sm px-2 py-2 text-[#6b6b6b] hover:text-[#0f0f0f] hover:bg-[#e5e5e0]/40 transition-colors rounded-sm">Articles</Link>
            <Link href="/admin/articles/new" className="text-sm px-2 py-2 text-[#6b6b6b] hover:text-[#0f0f0f] hover:bg-[#e5e5e0]/40 transition-colors rounded-sm">New Article</Link>
            <Link href="/admin/tags" className="text-sm px-2 py-2 text-[#6b6b6b] hover:text-[#0f0f0f] hover:bg-[#e5e5e0]/40 transition-colors rounded-sm">Tags</Link>
            <p className="text-xs tracking-widest text-[#6b6b6b] uppercase px-2 mb-2 mt-4">Moderation</p>
            <Link href="/admin/comments" className="text-sm px-2 py-2 text-[#6b6b6b] hover:text-[#0f0f0f] hover:bg-[#e5e5e0]/40 transition-colors rounded-sm">Comments</Link>
            <Link href="/admin/contacts" className="text-sm px-2 py-2 text-[#6b6b6b] hover:text-[#0f0f0f] hover:bg-[#e5e5e0]/40 transition-colors rounded-sm">Contacts</Link>
          </nav>
          <div className="mt-auto p-4 border-t border-[#e5e5e0]">
            <p className="text-xs text-[#6b6b6b] truncate px-2">{user.email}</p>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-xs text-[#6b6b6b] hover:text-[#0f0f0f] px-2 py-1 transition-colors">Sign out</button>
            </form>
          </div>
        </aside>
        <main className="flex-1 overflow-auto bg-[#fafaf8]">
          {children}
        </main>
      </div>
    )
  }
  return <>{children}</>
}
