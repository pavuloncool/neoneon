'use client'

// components/layout/SpeedInsightsClient.tsx
// Vercel Speed Insights (metryki Core Web Vitals, bez cookies). Renderowane tylko poza trybem podglądu
// (app/[locale]/layout.tsx, jak Umami). Osobny komponent kliencki, bo beforeSend to funkcja,
// a tej nie da się przekazać z komponentu serwerowego.
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { ComponentProps } from 'react'

type BeforeSend = NonNullable<ComponentProps<typeof SpeedInsights>['beforeSend']>

// Adres strony bez parametrów zapytania (?q=, ?tag=, …) i bez kotwicy — do Vercel trafia sama ścieżka.
const stripQuery: BeforeSend = (event) => {
  try {
    const url = new URL(event.url)
    url.search = ''
    url.hash = ''
    return { ...event, url: url.toString() }
  } catch {
    return null
  }
}

export function SpeedInsightsClient() {
  return <SpeedInsights beforeSend={stripQuery} />
}
