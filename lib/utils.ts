// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// shadcn/ui helper — łączy klasy Tailwinda bez konfliktów
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatowanie daty: "12 stycznia 2025" / "12 January 2025"
export function formatDate(dateString: string, locale: string = 'pl-PL'): string {
  return new Date(dateString).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Szacowany czas czytania (słowa / 200 wpm)
export function readingTime(content: unknown, locale: string = 'pl'): string {
  const text = JSON.stringify(content ?? '')
  const words = text.split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return locale === 'pl' ? `${minutes} min czytania` : `${minutes} min read`
}

// Slug z tytułu
export function slugify(text: string): string {
  const map: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
    'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  }
  return text
    .split('')
    .map((char) => map[char] ?? char)
    .join('')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
