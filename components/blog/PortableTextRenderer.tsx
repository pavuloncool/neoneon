// components/blog/PortableTextRenderer.tsx
// Server Component — renderuje treść artykułu z Sanity (Portable Text).
// Generuje ten sam HTML co dawny TiptapRenderer, więc style .article-body działają bez zmian.
// Uruchamianie skryptów embedów (Instagram itp.) obsługuje EmbedActivator.

import { PortableText, type PortableTextBlock, type PortableTextComponents } from '@portabletext/react'
import { EmbedActivator } from './EmbedActivator'
import { urlFor } from '@/sanity/lib/image'

const components: PortableTextComponents = {
  marks: {
    'strike-through': ({ children }) => <s>{children}</s>,
    link: ({ value, children }) => (
      <a href={value?.href ?? '#'} target={value?.blank === false ? undefined : '_blank'} rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) =>
      value?.asset ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={urlFor(value).width(1600).fit('max').auto('format').url()} alt={value.alt ?? ''} loading="lazy" />
      ) : null,
    divider: () => <hr />,
    youtube: ({ value }) => (
      <div className="video-container">
        <iframe
          src={value.url}
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    ),
    embed: ({ value }) => <div className="embed-container" dangerouslySetInnerHTML={{ __html: value.html ?? '' }} />,
    codeBlock: ({ value }) => (
      <pre>
        <code className={`language-${value.language ?? ''}`}>{value.code}</code>
      </pre>
    ),
  },
}

interface PortableTextRendererProps {
  content: PortableTextBlock[]
}

export function PortableTextRenderer({ content }: PortableTextRendererProps) {
  return (
    <>
      <div className="article-body">
        <PortableText value={content} components={components} />
      </div>
      <EmbedActivator />
    </>
  )
}
