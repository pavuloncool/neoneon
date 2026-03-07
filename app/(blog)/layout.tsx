import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      <main className="pt-14 min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
