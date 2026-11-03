// scripts/seed-privacy-policy.ts
// Strona „Polityka prywatności” / „Privacy policy” (PL i EN) i link do niej w stopce obu wersji językowych.
// Opisuje usługi zewnętrzne: Umami (statystyki bez cookies), Cloudflare Turnstile, Resend, Sanity, Vercel.
//
//   node --experimental-strip-types scripts/seed-privacy-policy.ts --dry-run   # tylko raport
//   node --experimental-strip-types scripts/seed-privacy-policy.ts             # tworzy stronę, jeśli jej nie ma, i dodaje link
//   node --experimental-strip-types scripts/seed-privacy-policy.ts --overwrite # nadpisuje treść strony (UWAGA: kasuje zmiany ze Studio)
//
// Wymaga w .env.local: SANITY_API_WRITE_TOKEN (Editor).

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@sanity/client'

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

// ── pomocnicze ───────────────────────────────────────────────
let keyCounter = 0
const key = () => `p${(keyCounter++).toString(36)}`
const ref = (id: string) => ({ _type: 'reference', _ref: id })

// Tekst z linkami w formacie [etykieta](adres) → blok Portable Text (blockContent)
function block(style: string, text: string, listItem?: 'bullet') {
  const markDefs: object[] = []
  const children: object[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  for (const m of text.matchAll(re)) {
    if (m.index > last) children.push({ _type: 'span', _key: key(), text: text.slice(last, m.index), marks: [] })
    const linkKey = key()
    markDefs.push({ _type: 'link', _key: linkKey, href: m[2], blank: !m[2].startsWith('mailto:') })
    children.push({ _type: 'span', _key: key(), text: m[1], marks: [linkKey] })
    last = m.index + m[0].length
  }
  if (last < text.length) children.push({ _type: 'span', _key: key(), text: text.slice(last), marks: [] })
  return { _type: 'block', _key: key(), style, markDefs, children, ...(listItem ? { listItem, level: 1 } : {}) }
}
// '## ' = nagłówek H2, '- ' = punkt listy, reszta = akapit
const body = (lines: string[]) =>
  lines.map((l) => (l.startsWith('## ') ? block('h2', l.slice(3)) : l.startsWith('- ') ? block('normal', l.slice(2), 'bullet') : block('normal', l)))

// ── treść ────────────────────────────────────────────────────
const CONTENT: Record<Locale, { title: string; slug: string; footerLabel: string; seoDescription: string; updated: string; lines: string[] }> = {
  pl: {
    title: 'Polityka prywatności',
    slug: 'polityka-prywatnosci',
    footerLabel: 'Polityka prywatności',
    seoDescription: 'Jakie dane przetwarza neoneon.online, w jakim celu i na jakiej podstawie: statystyki bez cookies (Umami), komentarze, formularz kontaktowy.',
    updated: 'Ostatnia aktualizacja: 3 listopada 2026 r.',
    lines: [
      '## Administrator danych',
      'Administratorem danych osobowych przetwarzanych w serwisie neoneon.online jest Paweł Kuligowski. W sprawach dotyczących danych osobowych napisz na [ask@neoneon.online](mailto:ask@neoneon.online).',
      '## Statystyki odwiedzin (Umami)',
      'Do liczenia odwiedzin używam Umami Cloud (Umami Software, Inc.). Umami nie zapisuje w Twojej przeglądarce plików cookies ani innych danych i nie śledzi Cię między stronami ani między dniami. Twój adres IP i dane przeglądarki służą wyłącznie do utworzenia anonimowego identyfikatora wizyty i nie są zapisywane. Widzę tylko dane zbiorcze: liczbę odwiedzin, odwiedzane podstrony, stronę odsyłającą, kraj, typ urządzenia, system i przeglądarkę. Ruch botów jest odfiltrowywany.',
      'Cel: poznanie, które treści są czytane, i rozwijanie serwisu. Podstawa prawna: prawnie uzasadniony interes administratora (art. 6 ust. 1 lit. f RODO). Ponieważ Umami nie zapisuje ani nie odczytuje informacji z Twojego urządzenia, nie jest wymagana zgoda na cookies. Możesz zablokować statystyki, np. rozszerzeniem blokującym skrypty.',
      '## Komentarze',
      'Dodając komentarz, podajesz imię lub pseudonim, adres e-mail i treść komentarza. Imię i treść są publikowane pod artykułem po zatwierdzeniu, adres e-mail nie jest publikowany i służy tylko do ewentualnego kontaktu w sprawie komentarza. Podstawa prawna: prawnie uzasadniony interes administratora, czyli prowadzenie dyskusji pod artykułami (art. 6 ust. 1 lit. f RODO). Komentarze przechowuję do czasu ich usunięcia, także na Twoją prośbę.',
      '## Formularz kontaktowy',
      'Wysyłając wiadomość, podajesz imię, adres e-mail i treść wiadomości. Używam ich wyłącznie do odpowiedzi. Podstawa prawna: prawnie uzasadniony interes administratora, czyli odpowiadanie na korespondencję (art. 6 ust. 1 lit. f RODO). Wiadomości przechowuję przez czas potrzebny do prowadzenia korespondencji.',
      '## Ochrona przed spamem (Cloudflare Turnstile)',
      'Formularze komentarzy i kontaktu chroni Cloudflare Turnstile (Cloudflare, Inc.). Turnstile sprawdza, czy formularz wysyła człowiek, analizując m.in. adres IP i cechy przeglądarki. Nie służy do reklam ani do śledzenia. Ładuje się tylko na stronach z formularzem. Podstawa prawna: prawnie uzasadniony interes administratora, czyli ochrona serwisu przed spamem i nadużyciami (art. 6 ust. 1 lit. f RODO). Więcej: [polityka prywatności Cloudflare](https://www.cloudflare.com/privacypolicy/).',
      '## Powiadomienia e-mail (Resend)',
      'Treść komentarza lub wiadomości z formularza (wraz z imieniem i adresem e-mail) trafia do mnie e-mailem wysyłanym przez usługę Resend. Resend nie wysyła do Ciebie żadnych wiadomości.',
      '## Hosting i przechowywanie treści',
      'Serwis działa na infrastrukturze Vercel Inc., która przetwarza adresy IP w logach serwera w celu zapewnienia działania i bezpieczeństwa strony. Treści serwisu, komentarze i wiadomości z formularza są przechowywane w systemie Sanity (Sanity AS).',
      '## Odbiorcy i przekazywanie danych poza EOG',
      'Dane mogą przetwarzać wymienieni dostawcy: Umami, Cloudflare, Resend, Vercel i Sanity, działający na moje zlecenie. Część z nich ma siedzibę w USA. Przekazanie danych poza Europejski Obszar Gospodarczy odbywa się na podstawie decyzji Komisji Europejskiej (EU-US Data Privacy Framework) lub standardowych klauzul umownych.',
      '## Pliki cookies i pamięć przeglądarki',
      'Serwis nie używa cookies analitycznych ani reklamowych. Zapisuje jedynie ustawienia potrzebne do działania strony: wybrany język (cookie NEXT_LOCALE) i motyw jasny lub ciemny (pamięć przeglądarki). Nie wymagają one zgody.',
      '## Twoje prawa',
      'Masz prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania oraz do sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Aby z nich skorzystać, napisz na [ask@neoneon.online](mailto:ask@neoneon.online). Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).',
    ],
  },
  en: {
    title: 'Privacy policy',
    slug: 'privacy-policy',
    footerLabel: 'Privacy policy',
    seoDescription: 'What data neoneon.online processes, why and on what legal basis: cookie-free analytics (Umami), comments and the contact form.',
    updated: 'Last updated: 3 November 2026',
    lines: [
      '## Data controller',
      'The controller of personal data processed on neoneon.online is Paweł Kuligowski. For any questions about your personal data, write to [ask@neoneon.online](mailto:ask@neoneon.online).',
      '## Visit statistics (Umami)',
      'I use Umami Cloud (Umami Software, Inc.) to count visits. Umami does not store cookies or any other data in your browser and does not track you across sites or across days. Your IP address and browser data are used only to create an anonymous visit identifier and are not stored. I only see aggregated data: number of visits, pages viewed, referring site, country, device type, operating system and browser. Bot traffic is filtered out.',
      'Purpose: understanding which content is read and improving the site. Legal basis: the controller’s legitimate interest (Art. 6(1)(f) GDPR). Because Umami neither stores nor reads information on your device, no cookie consent is required. You can block the statistics, e.g. with a script-blocking extension.',
      '## Comments',
      'When you post a comment, you provide a name or nickname, an email address and the comment text. The name and text are published under the article once approved; the email address is never published and is used only to contact you about the comment if needed. Legal basis: the controller’s legitimate interest in hosting discussion under articles (Art. 6(1)(f) GDPR). Comments are kept until they are deleted, including at your request.',
      '## Contact form',
      'When you send a message, you provide your name, email address and the message text. I use them only to reply. Legal basis: the controller’s legitimate interest in answering correspondence (Art. 6(1)(f) GDPR). Messages are kept for as long as the correspondence requires.',
      '## Spam protection (Cloudflare Turnstile)',
      'The comment and contact forms are protected by Cloudflare Turnstile (Cloudflare, Inc.). Turnstile checks whether a human is submitting the form by analysing, among other things, your IP address and browser characteristics. It is not used for advertising or tracking and loads only on pages with a form. Legal basis: the controller’s legitimate interest in protecting the site from spam and abuse (Art. 6(1)(f) GDPR). More: [Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/).',
      '## Email notifications (Resend)',
      'The content of a comment or contact message (including the name and email address) is delivered to me by email sent through the Resend service. Resend does not send any messages to you.',
      '## Hosting and content storage',
      'The site runs on Vercel Inc. infrastructure, which processes IP addresses in server logs to keep the site running and secure. Site content, comments and contact messages are stored in Sanity (Sanity AS).',
      '## Recipients and transfers outside the EEA',
      'Data may be processed by the providers listed above, acting on my behalf: Umami, Cloudflare, Resend, Vercel and Sanity. Some of them are based in the USA. Transfers outside the European Economic Area are based on the European Commission’s adequacy decision (EU-US Data Privacy Framework) or standard contractual clauses.',
      '## Cookies and browser storage',
      'The site does not use analytics or advertising cookies. It only stores settings needed for the site to work: your chosen language (NEXT_LOCALE cookie) and light or dark theme (browser storage). These do not require consent.',
      '## Your rights',
      'You have the right to access, rectify and erase your data, to restrict its processing and to object to processing based on legitimate interest. To exercise these rights, write to [ask@neoneon.online](mailto:ask@neoneon.online). You can also lodge a complaint with a supervisory authority; in Poland this is the President of the Personal Data Protection Office (UODO, ul. Stawki 2, 00-193 Warsaw).',
    ],
  },
}

// ── dokumenty ────────────────────────────────────────────────
const pageId = (locale: Locale) => `page-privacy-${locale}`

function buildPage(locale: Locale): Doc {
  const c = CONTENT[locale]
  return {
    _id: pageId(locale),
    _type: 'page',
    title: c.title,
    locale,
    isHome: false,
    slug: { _type: 'slug', current: c.slug },
    width: 'narrow',
    seo: { description: c.seoDescription },
    sections: [
      { _type: 'hero', _key: key(), variant: 'page', heading: c.title },
      { _type: 'richText', _key: key(), body: [block('normal', c.updated), ...body(c.lines)] },
    ],
  }
}

// Wersje PL/EN łączy translation.metadata (format wtyczki document-internationalization)
const translation: Doc = {
  _id: 'translation-page-privacy',
  _type: 'translation.metadata',
  schemaTypes: ['page'],
  translations: (['pl', 'en'] as Locale[]).map((locale) => ({
    _key: locale,
    _type: 'internationalizedArrayReferenceValue',
    language: locale,
    value: ref(pageId(locale)),
  })),
}

const docs: Doc[] = [buildPage('pl'), buildPage('en'), translation]
const existing = await client.fetch<string[]>('*[_id in $ids]._id', { ids: docs.map((d) => d._id) })

// Link w stopce dopisywany tylko tam, gdzie jeszcze go nie ma
const settings = await client.fetch<{ _id: string; locale: Locale; hasLink: boolean }[]>(
  '*[_type == "siteSettings" && !(_id in path("drafts.**"))]{ _id, locale, "hasLink": count(footerLinks[link.page._ref match "page-privacy-*"]) > 0 }'
)
const missingLink = settings.filter((s) => !s.hasLink)

const report: Record<string, unknown> = {
  mode: DRY_RUN ? 'dry-run' : OVERWRITE ? 'overwrite' : 'create-missing',
  documents: docs.map((d) => d._id),
  alreadyExisting: existing,
  footerLinkAddedTo: missingLink.map((s) => s._id),
}

if (!DRY_RUN) {
  const tx = client.transaction()
  for (const doc of docs) {
    if (OVERWRITE) tx.createOrReplace(doc)
    else tx.createIfNotExists(doc)
  }
  for (const s of missingLink) {
    const item = { _type: 'navItem', _key: key(), label: CONTENT[s.locale].footerLabel, link: { _type: 'link', linkType: 'page', page: ref(pageId(s.locale)) } }
    tx.patch(s._id, (p) => p.setIfMissing({ footerLinks: [] }).append('footerLinks', [item]))
  }
  report.transactionId = (await tx.commit({ visibility: 'sync' })).transactionId
}

console.log(JSON.stringify(report, null, 2))
