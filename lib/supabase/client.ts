// lib/supabase/client.ts
// Klient po stronie przeglądarki (Client Components)

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
