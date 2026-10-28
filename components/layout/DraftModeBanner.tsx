'use client'

// components/layout/DraftModeBanner.tsx
// Widoczny tylko w trybie podglądu poza Presentation Tool (np. gdy podgląd został w karcie) —
// przypomina, że widać szkice, i pozwala z niego wyjść.

import { useIsPresentationTool } from 'next-sanity/hooks'

export function DraftModeBanner() {
  const isPresentationTool = useIsPresentationTool()
  if (isPresentationTool !== false) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-3 bg-ink text-paper dark:bg-white dark:text-ink text-xs px-4 py-2 shadow-lg">
      <span>Podgląd szkiców</span>
      {/* Zwykły <a>: trasa API musi przeładować całą stronę (Link pokazałby layout z cache routera) */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/draft-mode/disable" className="underline underline-offset-2">
        Wyłącz
      </a>
    </div>
  )
}
