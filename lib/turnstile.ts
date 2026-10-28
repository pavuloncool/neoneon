// lib/turnstile.ts
// Weryfikacja tokena Cloudflare Turnstile po stronie serwera (Siteverify API).
// Token jest jednorazowy i ważny 5 minut — formularz resetuje widget po każdej wysyłce.

import { randomUUID } from 'node:crypto'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TIMEOUT_MS = 10_000

// Adres IP odwiedzającego — Vercel ustawia x-forwarded-for
export function clientIp(request: Request): string | undefined {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined
}

export async function verifyTurnstile(token: unknown, remoteip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('Turnstile: brak TURNSTILE_SECRET_KEY')
    return false
  }
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return false

  // Ten sam idempotency_key przy ponowieniu — Cloudflare nie potraktuje go jako zużytego tokena
  const body = JSON.stringify({ secret, response: token, remoteip, idempotency_key: randomUUID() })

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(SITEVERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] }
      if (!data.success) console.warn('Turnstile: odrzucony token', data['error-codes'])
      return data.success === true
    } catch (error) {
      console.error(`Turnstile: błąd Siteverify (próba ${attempt + 1})`, error)
    }
  }
  return false
}
