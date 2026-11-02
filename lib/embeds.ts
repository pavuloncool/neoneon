// lib/embeds.ts
// Zamienia zwykły link (skopiowany z paska adresu lub „Udostępnij”) na dane do osadzenia.
// Używane w Studio (walidacja pola „Media”) i na stronie (PortableTextRenderer).

export type EmbedProvider = 'youtube' | 'vimeo' | 'instagram' | 'tiktok' | 'x' | 'spotify' | 'soundcloud'

export type ParsedEmbed =
  // Zwykły iframe; aspect = proporcje (np. 16/9) albo stała wysokość w px
  | { kind: 'iframe'; provider: EmbedProvider; src: string; aspect?: string; height?: number; maxWidth?: number }
  // Posty, które renderuje skrypt serwisu (wysokość dopasowuje się do treści)
  | { kind: 'script'; provider: 'instagram' | 'x'; permalink: string }

export const EMBED_PROVIDER_NAMES: Record<EmbedProvider, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  x: 'X (Twitter)',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
}

// "1h2m3s" / "90s" / "90" → sekundy
function parseYoutubeTime(t: string | null): number | undefined {
  if (!t) return undefined
  if (/^\d+$/.test(t)) return Number(t)
  const m = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!m) return undefined
  const s = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
  return s || undefined
}

export function parseEmbedUrl(input: string | undefined | null): ParsedEmbed | null {
  if (!input) return null
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www\.|m\.|mobile\.)/, '')
  const parts = url.pathname.split('/').filter(Boolean)

  // YouTube: watch?v=, youtu.be/, /shorts/, /live/, /embed/
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com' || host === 'music.youtube.com') {
    let id: string | null = null
    if (host === 'youtu.be') id = parts[0] ?? null
    else if (parts[0] === 'watch') id = url.searchParams.get('v')
    else if (['shorts', 'live', 'embed', 'v'].includes(parts[0])) id = parts[1] ?? null
    if (!id || !/^[\w-]{11}$/.test(id)) return null
    const start = parseYoutubeTime(url.searchParams.get('t') ?? url.searchParams.get('start'))
    const isShort = parts[0] === 'shorts'
    return {
      kind: 'iframe',
      provider: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${id}${start ? `?start=${start}` : ''}`,
      aspect: isShort ? '9 / 16' : '16 / 9',
      maxWidth: isShort ? 360 : undefined,
    }
  }

  // Vimeo: vimeo.com/123456 lub vimeo.com/123456/abcdef (prywatny link z hashem)
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const idx = parts.findIndex((p) => /^\d+$/.test(p))
    if (idx === -1) return null
    const hash = parts[idx + 1] && /^[a-f0-9]+$/.test(parts[idx + 1]) ? parts[idx + 1] : url.searchParams.get('h')
    return {
      kind: 'iframe',
      provider: 'vimeo',
      src: `https://player.vimeo.com/video/${parts[idx]}${hash ? `?h=${hash}` : ''}`,
      aspect: '16 / 9',
    }
  }

  // Instagram: /p/KOD, /reel/KOD, /tv/KOD (także z nazwą konta na początku)
  if (host === 'instagram.com') {
    const idx = parts.findIndex((p) => ['p', 'reel', 'reels', 'tv'].includes(p))
    const code = idx !== -1 ? parts[idx + 1] : undefined
    if (!code) return null
    const type = parts[idx] === 'reels' ? 'reel' : parts[idx]
    return { kind: 'script', provider: 'instagram', permalink: `https://www.instagram.com/${type}/${code}/` }
  }

  // TikTok: tiktok.com/@konto/video/123…
  if (host === 'tiktok.com') {
    const idx = parts.indexOf('video')
    const id = idx !== -1 ? parts[idx + 1] : undefined
    if (!id || !/^\d+$/.test(id)) return null
    return { kind: 'iframe', provider: 'tiktok', src: `https://www.tiktok.com/embed/v2/${id}`, height: 740, maxWidth: 340 }
  }

  // X / Twitter: /konto/status/123…
  if (host === 'x.com' || host === 'twitter.com') {
    const idx = parts.indexOf('status')
    const id = idx !== -1 ? parts[idx + 1] : undefined
    if (!id || !/^\d+$/.test(id)) return null
    return { kind: 'script', provider: 'x', permalink: `https://twitter.com/${parts[0]}/status/${id}` }
  }

  // Spotify: utwór, album, playlista, odcinek, podcast (także z prefiksem /intl-pl/)
  if (host === 'open.spotify.com') {
    const p = parts[0]?.startsWith('intl-') ? parts.slice(1) : parts
    const offset = p[0] === 'embed' ? 1 : 0
    const [type, id] = [p[offset], p[offset + 1]]
    if (!['track', 'album', 'playlist', 'episode', 'show', 'artist'].includes(type) || !id) return null
    return {
      kind: 'iframe',
      provider: 'spotify',
      src: `https://open.spotify.com/embed/${type}/${id}`,
      height: type === 'track' || type === 'episode' ? 152 : 352,
    }
  }

  // SoundCloud: dowolny link do utworu lub playlisty
  if (host === 'soundcloud.com' && parts.length >= 2) {
    const clean = `https://soundcloud.com/${parts.join('/')}`
    return {
      kind: 'iframe',
      provider: 'soundcloud',
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(clean)}&visual=true`,
      height: parts[1] === 'sets' ? 450 : 300,
    }
  }

  return null
}
