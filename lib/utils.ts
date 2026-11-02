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

// Formatowanie daty: "12 stycznia 2025" / "12 January 2025"
export function formatDate(dateString: string, locale: string = 'pl-PL'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Szacowany czas czytania (słowa / 200 wpm) — content to Portable Text z Sanity
export function readingTime(content: unknown, locale: string = 'pl'): string {
  const text = Array.isArray(content) ? toPlainText(content) : ''
  const words = text.split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(words / 200)
  return locale === 'pl' ? `${minutes} min czytania` : `${minutes} min read`
}
