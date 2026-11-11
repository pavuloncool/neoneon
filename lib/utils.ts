// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toPlainText } from '@portabletext/react'

// shadcn/ui helper — łączy klasy Tailwinda bez konfliktów
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Escapowanie danych od użytkownika wstawianych do HTML (np. treść maili)
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Strefa czasowa dat na stronie — stała, niezależna od serwera (Vercel: UTC) i przeglądarki.
// Bez niej artykuł opublikowany np. 23:55 czasu polskiego miał datę z poprzedniego dnia,
// a karta artykułu (komponent kliencki) mogła się różnić między serwerem a przeglądarką.
export const SITE_TIME_ZONE = 'Europe/Warsaw'

// Formatowanie daty: "12 stycznia 2025" / "12 January 2025"
export function formatDate(dateString: string, locale: string = 'pl-PL'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: SITE_TIME_ZONE,
  })
}

// Szacowany czas czytania w minutach (słowa / 200 wpm) — content to Portable Text z Sanity.
// Tekst („5 min czytania” / „5 min read”) z tłumaczeń: article.readingTime.
export function readingMinutes(content: unknown): number {
  return readingMinutesFromText(Array.isArray(content) ? toPlainText(content) : '')
}

// To samo dla gotowego tekstu (listy artykułów: pt::text(content) z GROQ — ten sam tekst co toPlainText)
export function readingMinutesFromText(text: string | null | undefined): number {
  const words = (text ?? '').split(/\s+/).filter(Boolean).length
  return Math.ceil(words / 200)
}
