// Dane strukturalne FAQPage dla wyszukiwarek i silników odpowiedzi AI — osobny blok obok BlogPosting.
// Gdy artykuł nie ma pytań, nic nie renderuje.
import { stegaClean } from 'next-sanity'
import { JsonLd } from './JsonLd'
import type { FaqItem } from '@/types'

export function FaqJsonLd({ faq }: { faq?: FaqItem[] | null }) {
  // W podglądzie teksty niosą znaczniki edycji (stega) — w JSON-LD są zbędne
  const items = (faq ?? [])
    .map((item) => ({ question: stegaClean(item?.question)?.trim(), answer: stegaClean(item?.answer)?.trim() }))
    .filter((item) => item.question && item.answer)
  if (items.length === 0) return null

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }}
    />
  )
}
