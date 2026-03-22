import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* SC 2.4.1 — Skip link: pierwszy element strony, ukryty wizualnie, widoczny przy fokusie */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:text-sm focus:rounded"
      >
        Przejdź do treści głównej
      </a>
      <Nav />
      <main id="main-content" className="pt-14 min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
