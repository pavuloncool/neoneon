// components/sections/TextImage.tsx
// Sekcja „Tekst ze zdjęciem” („O mnie”: zdjęcie + biogram + link).

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { resolveHref } from '@/lib/links'
import { SimpleText } from './SimpleText'
import type { Section, SanityImage } from '@/types'

export function TextImage({ section }: { section: Section }) {
  const image: SanityImage | null = section.image?.url ? section.image : null
  const cta = resolveHref(section.ctaLink)

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-16">
      {image && (
        <div className="aspect-[3/4] w-full max-w-xs overflow-hidden relative">
          <Image
            src={image.url}
            alt={image.alt ?? ''}
            fill
            className="object-cover"
            style={image.hotspot ? { objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%` } : undefined}
          />
        </div>
      )}
      <div className="flex flex-col gap-6 text-[1.0625rem] leading-relaxed">
        <SimpleText value={section.body} />
        {cta && section.ctaLabel && (
          <div className="mt-4">
            {cta.external ? (
              <a href={cta.href} className="text-sm link-underline inline-block w-fit" target="_blank" rel="noopener noreferrer">{section.ctaLabel}</a>
            ) : (
              <Link href={cta.href} className="text-sm link-underline inline-block w-fit">{section.ctaLabel}</Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
