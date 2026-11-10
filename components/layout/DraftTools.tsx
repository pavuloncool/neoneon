'use client'

// components/layout/DraftTools.tsx
// Narzędzia trybu podglądu (Visual Editing z Presentation Tool + baner „Podgląd szkiców”).
// Renderowane tylko gdy draftMode().isEnabled (app/[locale]/layout.tsx) i ładowane dynamicznie:
// statyczny import ciągnąłby @sanity/ui, @sanity/visual-editing i framer-motion (~270 KB gzip)
// do paczki JS każdej publicznej strony, nawet gdy komponent się nie renderuje.

import dynamic from 'next/dynamic'

const VisualEditing = dynamic(
  () => import('next-sanity/visual-editing').then((m) => m.VisualEditing),
  { ssr: false },
)

const DraftModeBanner = dynamic(
  () => import('@/components/layout/DraftModeBanner').then((m) => m.DraftModeBanner),
  { ssr: false },
)

export function DraftTools() {
  return (
    <>
      <VisualEditing />
      <DraftModeBanner />
    </>
  )
}
