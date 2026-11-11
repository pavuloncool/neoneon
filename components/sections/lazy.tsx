'use client'

// components/sections/lazy.tsx
// HeroNeon jako osobny plik JS (next/dynamic z SSR) — dla trasy [...segments], patrz SectionRendererLazy.tsx.

import dynamic from 'next/dynamic'

export const HeroNeon = dynamic(() => import('./HeroNeon').then((m) => m.HeroNeon))
