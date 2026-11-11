// components/sections/SectionRenderer.tsx
// Sekcje page buildera dla strony głównej: HeroNeon importowany statycznie (element LCP — kod w paczce trasy).

import { createPageSections } from './PageSectionsBase'
import { HeroNeon } from './HeroNeon'

export const PageSections = createPageSections(HeroNeon)
