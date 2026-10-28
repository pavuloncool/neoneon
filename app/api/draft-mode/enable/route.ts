// app/api/draft-mode/enable/route.ts
// Włącza podgląd szkiców (Draft Mode). Wywołuje go Presentation Tool w Studio z jednorazowym
// sekretem, który weryfikujemy w Sanity — bez zalogowania do Studio nie da się go włączyć.

import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/sanity/lib/client'

export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
})
