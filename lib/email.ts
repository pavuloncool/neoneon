// lib/email.ts
// Klient Resend tworzony przy pierwszym użyciu. Brak RESEND_API_KEY wyłącza tylko maile
// (ostrzeżenie w logu serwera) — formularze dalej zapisują wpisy w Sanity.

import { Resend } from 'resend'

let resend: Resend | null | undefined

export function getResend(): Resend | null {
  if (resend === undefined) {
    const key = process.env.RESEND_API_KEY
    if (!key) console.warn('Resend: brak RESEND_API_KEY — powiadomienia e-mail wyłączone')
    resend = key ? new Resend(key) : null
  }
  return resend
}
