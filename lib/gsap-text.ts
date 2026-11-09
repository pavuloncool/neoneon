'use client'

// lib/gsap-text.ts
// Pluginy tekstowe GSAP (SplitText, ScrambleText). Osobny moduł, importowany tylko przez komponenty,
// które ich używają (hero) — reszta stron nie płaci za nie w paczce JS.

import { gsap } from '@/lib/gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(SplitText, ScrambleTextPlugin)

// Znaki „szumu” przy scramble — z polskimi diakrytykami, żeby PL i EN wyglądały spójnie.
// Osobno małe i wielkie: wielkie litery są szersze, więc słowo pisane małymi „puchłoby” i przenosiło się
// do następnej linii. scrambleChars() dobiera zestaw do słowa.
export const SCRAMBLE_LOWER = 'ąćęłńóśźżabcdefghijklmnopqrstuvwxyz'
export const SCRAMBLE_UPPER = 'ĄĆĘŁŃÓŚŹŻABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const scrambleChars = (word: string) =>
  word === word.toUpperCase() && word !== word.toLowerCase() ? SCRAMBLE_UPPER : SCRAMBLE_LOWER

export { SplitText }
