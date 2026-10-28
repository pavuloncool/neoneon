// sanity/env.ts
// Wspólna konfiguracja Sanity — używana przez Studio, frontend i skrypty.

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'n81gbqh8'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

// Data wersji API Sanity — zmieniać świadomie, nie automatycznie
export const apiVersion = '2025-02-19'
