// components/sections/SectionRendererLazy.tsx
// Sekcje page buildera dla trasy [...segments] (podstrony; ta sama trasa obsługuje kategorie i artykuły):
// HeroNeon ładowany osobnym plikiem JS tylko wtedy, gdy strona go renderuje. SSR bez zmian.

import { createPageSections } from './PageSectionsBase'
import { HeroNeon } from './lazy'

export const PageSections = createPageSections(HeroNeon)
