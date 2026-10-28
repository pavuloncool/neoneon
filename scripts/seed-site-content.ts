// scripts/seed-site-content.ts
// Dane startowe page buildera: ustawienia strony, teksty interfejsu i strony (główna, „O mnie”,
// „Kontakt”) w PL i EN — dokładnie obecne teksty z messages/*.json i kodu, żeby po przejściu
// na Sanity strona wyglądała identycznie.
//
//   node --experimental-strip-types scripts/seed-site-content.ts --dry-run   # tylko raport
//   node --experimental-strip-types scripts/seed-site-content.ts             # tworzy brakujące dokumenty
//   node --experimental-strip-types scripts/seed-site-content.ts --overwrite # nadpisuje (UWAGA: kasuje zmiany ze Studio)
//
// Wymaga w .env.local: SANITY_API_WRITE_TOKEN (Editor).

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@sanity/client'
import { UI_STRING_GROUPS } from '../sanity/uiStringFields.ts'

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const OVERWRITE = args.includes('--overwrite')

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, '.env.local'), 'utf8').split('\n')
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')])
)
if (!env.SANITY_API_WRITE_TOKEN) throw new Error('Brak SANITY_API_WRITE_TOKEN w .env.local')

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'n81gbqh8',
  dataset: env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2025-02-19',
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

type Locale = 'pl' | 'en'
type Doc = { _id: string; _type: string } & Record<string, unknown>
type Messages = Record<string, Record<string, string>>
const messages: Record<Locale, Messages> = {
  pl: JSON.parse(fs.readFileSync(path.join(root, 'messages/pl.json'), 'utf8')),
  en: JSON.parse(fs.readFileSync(path.join(root, 'messages/en.json'), 'utf8')),
}

// ── pomocnicze ───────────────────────────────────────────────
let keyCounter = 0
const key = () => `k${(keyCounter++).toString(36)}`
const ref = (id: string) => ({ _type: 'reference', _ref: id })
const paragraphs = (texts: string[]) =>
  texts.map((text) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] }))
const pageLink = (id: string) => ({ _type: 'link', linkType: 'page', page: ref(id) })
const categoryLink = (category: string) => ({ _type: 'link', linkType: 'category', category })
const navItem = (label: string, link: object) => ({ _type: 'navItem', _key: key(), label, link })

const assetCache = new Map<string, string>()
async function uploadImage(file: string) {
  if (assetCache.has(file)) return assetCache.get(file)!
  let id = `image-dryrun-${assetCache.size}`
  if (!DRY_RUN) {
    const asset = await client.assets.upload('image', fs.readFileSync(path.join(root, 'public', file)), { filename: file })
    id = asset._id
  }
  assetCache.set(file, id)
  return id
}
const image = async (file: string, alt?: string) => ({ _type: 'image', asset: ref(await uploadImage(file)), ...(alt ? { alt } : {}) })

// ── teksty spoza messages/*.json (dotąd wpisane w kod) ──────
const A11Y: Record<Locale, Record<string, string>> = {
  pl: {
    skipToContent: 'Przejdź do treści głównej',
    mainNav: 'Główna nawigacja',
    mobileNav: 'Nawigacja mobilna',
    footerNav: 'Linki w stopce',
    search: 'Szukaj',
    menu: 'Otwórz menu nawigacyjne',
    themeToggle: 'Przełącz motyw',
    languagePl: 'Polski',
    languageEn: 'English',
  },
  en: {
    skipToContent: 'Skip to main content',
    mainNav: 'Main navigation',
    mobileNav: 'Mobile navigation',
    footerNav: 'Footer links',
    search: 'Search',
    menu: 'Open navigation menu',
    themeToggle: 'Toggle theme',
    languagePl: 'Polski',
    languageEn: 'English',
  },
}
const CATEGORIES_LABEL: Record<Locale, string> = { pl: 'Kategorie', en: 'Categories' }
const SITE_TITLE = 'neoneon — Content Writing & UX Strategies'
const SITE_DESCRIPTION = 'Writing about online content strategy, UX design and digital communication that work for AI-powered search engines.'
const AUTHOR = 'Paweł Kuligowski'

// ── dokumenty ────────────────────────────────────────────────
async function buildDocs(locale: Locale): Promise<Doc[]> {
  const m = messages[locale]
  const id = (name: string) => `page-${name}-${locale}`
  const [taglineMain, taglineEm] = m.home.tagline.split('|').map((s) => s.trim())

  const home = {
    _id: id('home'),
    _type: 'page',
    title: locale === 'pl' ? 'Strona główna' : 'Home',
    locale,
    isHome: true,
    width: 'wide',
    seo: { title: `neoneon — ${m.home.tagline.split('|').map((s) => s.trim()).join(' ')}` },
    sections: [
      { _type: 'hero', _key: key(), variant: 'large', heading: taglineMain, headingEmphasis: taglineEm },
      {
        _type: 'categoryTiles',
        _key: key(),
        ariaLabel: CATEGORIES_LABEL[locale],
        eyebrow: m.home.category,
        tiles: [
          { _type: 'tile', _key: key(), category: 'content-writing', title: m.nav.contentWriting },
          { _type: 'tile', _key: key(), category: 'ux-strategies', title: m.nav.uxStrategies },
        ],
      },
      { _type: 'recentArticles', _key: key(), heading: m.home.recent, limit: 6 },
    ],
  }

  const about = {
    _id: id('about'),
    _type: 'page',
    title: m.about.label,
    locale,
    isHome: false,
    slug: { _type: 'slug', current: 'about' },
    width: 'narrow',
    seo: { title: m.about.label, description: m.about.bio1 },
    sections: [
      { _type: 'hero', _key: key(), variant: 'page', eyebrow: m.about.label, heading: AUTHOR },
      {
        _type: 'textImage',
        _key: key(),
        image: await image('neoneon-pawel.webp', AUTHOR),
        body: paragraphs([m.about.bio1, m.about.bio2, m.about.bio3]),
        ctaLabel: m.about.cta,
        ctaLink: pageLink(id('contact')),
      },
      {
        _type: 'featureGrid',
        _key: key(),
        label: m.about.areasLabel,
        items: [1, 2, 3, 4].map((n) => ({ _type: 'feature', _key: key(), title: m.about[`area${n}Title`], description: m.about[`area${n}Desc`] })),
      },
    ],
  }

  const contact = {
    _id: id('contact'),
    _type: 'page',
    title: m.contact.label,
    locale,
    isHome: false,
    slug: { _type: 'slug', current: 'contact' },
    width: 'narrow',
    sections: [
      { _type: 'hero', _key: key(), variant: 'page', eyebrow: m.contact.label, heading: m.contact.heading },
      { _type: 'contactForm', _key: key(), intro: paragraphs([m.contact.intro1, m.contact.intro2]) },
    ],
  }

  const links = [
    navItem(m.nav.contentWriting, categoryLink('content-writing')),
    navItem(m.nav.uxStrategies, categoryLink('ux-strategies')),
    navItem(m.nav.about, pageLink(id('about'))),
    navItem(m.nav.contact, pageLink(id('contact'))),
  ]

  const settings = {
    _id: `siteSettings-${locale}`,
    _type: 'siteSettings',
    locale,
    siteTitle: SITE_TITLE,
    titleTemplate: '%s | neoneon',
    description: SITE_DESCRIPTION,
    ogImage: await image('neoneon-og.jpeg'),
    logoLight: await image('neoneon-light.webp'),
    logoDark: await image('neoneon-dark.webp'),
    logoAlt: 'neoneon',
    navigation: links,
    footerText: `© {year} NEONEON. ${m.footer.allRightsReserved}`,
    footerLinks: links.map((l) => ({ ...l, _key: key() })),
    a11y: A11Y[locale],
  }

  const ui: Doc = { _id: `uiStrings-${locale}`, _type: 'uiStrings', locale }
  for (const { namespace, fields } of UI_STRING_GROUPS) {
    ui[namespace] = Object.fromEntries(fields.map((f) => [f.key, m[namespace]?.[f.key] ?? '']))
  }

  return [home, about, contact, settings, ui]
}

// Wersje PL/EN stron łączy translation.metadata (format wtyczki document-internationalization)
const translations = ['home', 'about', 'contact'].map((name) => ({
  _id: `translation-page-${name}`,
  _type: 'translation.metadata',
  schemaTypes: ['page'],
  translations: (['pl', 'en'] as Locale[]).map((locale) => ({
    _key: locale,
    _type: 'internationalizedArrayReferenceValue',
    language: locale,
    value: ref(`page-${name}-${locale}`),
  })),
}))

const docs: Doc[] = [...(await buildDocs('pl')), ...(await buildDocs('en')), ...translations]

const existing = await client.fetch<string[]>('*[_id in $ids]._id', { ids: docs.map((d) => d._id) })
const report: Record<string, unknown> = {
  mode: DRY_RUN ? 'dry-run' : OVERWRITE ? 'overwrite' : 'create-missing',
  documents: docs.length,
  alreadyExisting: existing,
  images: assetCache.size,
}

if (!DRY_RUN) {
  const tx = client.transaction()
  for (const doc of docs) {
    if (OVERWRITE) tx.createOrReplace(doc)
    else tx.createIfNotExists(doc)
  }
  report.transactionId = (await tx.commit({ visibility: 'sync' })).transactionId
}

console.log(JSON.stringify(report, null, 2))
