// components/sections/SimpleText.tsx
// Prosta treść sekcji (akapity, pogrubienie, kursywa, linki) — bez stylów artykułu.

import { PortableText, type PortableTextBlock, type PortableTextComponents } from '@portabletext/react'

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href ?? '#'
      const external = /^https?:\/\//.test(href)
      return (
        <a href={href} className="link-underline" {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {children}
        </a>
      )
    },
  },
}

export function SimpleText({ value }: { value?: PortableTextBlock[] | null }) {
  if (!value?.length) return null
  return <PortableText value={value} components={components} />
}
