'use client'

// components/ui/Turnstile.tsx
// Niewidoczny widget Cloudflare Turnstile (appearance: interaction-only) — pokazuje się
// tylko, gdy Cloudflare uzna ruch za podejrzany. Token trafia do formularza przez onToken
// i jest weryfikowany na serwerze (lib/turnstile.ts). Dopóki widget jest niewidoczny,
// kontener nie zajmuje miejsca — formularz umieszcza go razem z przyciskiem w kontenerze bez `gap`.

import Script from 'next/script'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { IS_PRODUCTION } from '@/lib/site'

interface TurnstileApi {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

export interface TurnstileHandle {
  reset: () => void
}

interface TurnstileProps {
  onToken: (token: string | null) => void
  ref?: React.Ref<TurnstileHandle>
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
// Brak klucza poza produkcją: formularz dostaje umowny token, a serwer bez sekretu pomija weryfikację
const SKIP_TOKEN = 'turnstile-skipped'

export function Turnstile({ onToken, ref }: TurnstileProps) {
  const locale = useLocale()
  const container = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  const [ready, setReady] = useState(false)
  const [interactive, setInteractive] = useState(false)
  const t = useTranslations('form')

  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  useEffect(() => {
    if (SITE_KEY) return
    if (IS_PRODUCTION) {
      console.error('Turnstile: brak NEXT_PUBLIC_TURNSTILE_SITE_KEY — formularz wyłączony')
      return
    }
    console.warn('Turnstile: brak NEXT_PUBLIC_TURNSTILE_SITE_KEY — weryfikacja pominięta (poza produkcją)')
    onTokenRef.current(SKIP_TOKEN)
  }, [])

  useEffect(() => {
    if (!ready || !container.current || !window.turnstile) return
    if (!SITE_KEY) return
    const api = window.turnstile
    const id = api.render(container.current, {
      sitekey: SITE_KEY,
      appearance: 'interaction-only',
      theme: 'auto',
      language: locale,
      'refresh-expired': 'auto',
      callback: (token: string) => onTokenRef.current(token),
      'expired-callback': () => onTokenRef.current(null),
      'error-callback': () => onTokenRef.current(null),
      'before-interactive-callback': () => setInteractive(true),
    })
    widgetId.current = id
    return () => {
      api.remove(id)
      widgetId.current = null
    }
  }, [ready, locale])

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current(SITE_KEY || IS_PRODUCTION ? null : SKIP_TOKEN)
      if (widgetId.current) window.turnstile?.reset(widgetId.current)
    },
  }), [])

  if (!SITE_KEY) {
    // Na produkcji przycisk zostaje nieaktywny (brak tokena) i formularz mówi dlaczego
    return IS_PRODUCTION ? <p className="text-xs text-red-500 mb-4">{t('unavailable')}</p> : null
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={container} className={interactive ? 'mb-4' : undefined} />
    </>
  )
}
