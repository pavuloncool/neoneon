'use client'

import { useEffect } from 'react'

export function TranslationStore({ slug, category }: { slug: string; category: string }) {
  useEffect(() => {
    sessionStorage.setItem('neoneon_translation_slug', slug)
    sessionStorage.setItem('neoneon_translation_category', category)
    return () => {
      sessionStorage.removeItem('neoneon_translation_slug')
      sessionStorage.removeItem('neoneon_translation_category')
    }
  }, [slug, category])

  return null
}
