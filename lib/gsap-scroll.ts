'use client'

// lib/gsap-scroll.ts
// ScrollTrigger — osobny moduł, importowany tylko przez komponenty artykułu.

import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { ScrollTrigger }
