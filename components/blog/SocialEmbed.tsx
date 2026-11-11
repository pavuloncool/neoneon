'use client'

// components/blog/SocialEmbed.tsx
// Post z Instagrama lub X osadzony z samego linku. Skrypt serwisu zamienia
// <blockquote> w pełny post (z dopasowaną wysokością); bez JS zostaje zwykły link.

import { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

const SCRIPTS = {
  instagram: 'https://www.instagram.com/embed.js',
  x: 'https://platform.twitter.com/widgets.js',
} as const

type EmbedWindow = Window & {
  instgrm?: { Embeds: { process: () => void } }
  twttr?: { widgets: { load: (el?: HTMLElement) => void } }
}

function process(provider: keyof typeof SCRIPTS, el: HTMLElement) {
  const win = window as EmbedWindow
  if (provider === 'instagram') win.instgrm?.Embeds.process()
  else win.twttr?.widgets.load(el)
}

export function SocialEmbed({ provider, permalink }: { provider: keyof typeof SCRIPTS; permalink: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const t = useTranslations('embed')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const id = `embed-script-${provider}`
    const existing = document.getElementById(id)
    if (existing) {
      // Skrypt już jest (inny embed na stronie albo nawigacja klienta) — przetwórz nowe posty
      if (existing.dataset.loaded) process(provider, el)
      else existing.addEventListener('load', () => process(provider, el), { once: true })
      return
    }
    const script = document.createElement('script')
    script.id = id
    script.src = SCRIPTS[provider]
    script.async = true
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      process(provider, el)
    }, { once: true })
    document.body.appendChild(script)
  }, [provider])

  return (
    <div ref={ref} className="embed-container social-embed">
      {provider === 'instagram' ? (
        <blockquote className="instagram-media" data-instgrm-permalink={permalink} data-instgrm-version="14">
          <a href={permalink} target="_blank" rel="noopener noreferrer">{t('viewOnInstagram')}</a>
        </blockquote>
      ) : (
        <blockquote className="twitter-tweet" data-dnt="true">
          <a href={permalink} target="_blank" rel="noopener noreferrer">{t('viewOnX')}</a>
        </blockquote>
      )}
    </div>
  )
}
