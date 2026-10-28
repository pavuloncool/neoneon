'use client'

// components/ui/Turnstile.tsx
// Niewidoczny widget Cloudflare Turnstile (appearance: interaction-only) — pokazuje się
// tylko, gdy Cloudflare uzna ruch za podejrzany. Token trafia do formularza przez onToken
// i jest weryfikowany na serwerze (lib/turnstile.ts). Dopóki widget jest niewidoczny,
// kontener nie zajmuje miejsca — formularz umieszcza go razem z przyciskiem w kontenerze bez `gap`.

import Script from 'next/script'
import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useLocale } from 'next-intl'

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

export function Turnstile({ onToken, ref }: TurnstileProps) {
  const locale = useLocale()
  const container = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  const [ready, setReady] = useState(false)
  const [interactive, setInteractive] = useState(false)

  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  useEffect(() => {
    if (!ready || !container.current || !window.turnstile) return
    if (!SITE_KEY) {
      console.error('Turnstile: brak NEXT_PUBLIC_TURNSTILE_SITE_KEY')
      return
    }
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
      onTokenRef.current(null)
      if (widgetId.current) window.turnstile?.reset(widgetId.current)
    },
  }), [])

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
