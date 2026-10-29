// Dane strukturalne schema.org (JSON-LD) dla wyszukiwarek.
// „<” jest escapowane, żeby treść z CMS nie mogła zamknąć znacznika <script>.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
