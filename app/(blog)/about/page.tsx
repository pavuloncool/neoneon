// app/(blog)/about/page.tsx

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About the author — content writer and UX strategist.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-16">
        <p className="text-xs tracking-widest text-muted uppercase mb-4">About</p>
        <h1 className="font-display text-6xl md:text-7xl font-light leading-none">
          Your Name
        </h1>
      </header>

      <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-16">
        <div className="aspect-[3/4] bg-border w-full max-w-xs">
          <div className="w-full h-full flex items-center justify-center text-xs text-muted tracking-widest uppercase">
            Photo
          </div>
        </div>

        <div className="flex flex-col gap-6 text-[1.0625rem] leading-relaxed">
          <p>
            I write about the intersection of content strategy and user experience —
            two disciplines that, when done well, become indistinguishable from each other.
          </p>
          <p>
            For the past several years I have helped companies find their voice online,
            structure information that users actually read, and build content systems
            that scale without losing humanity.
          </p>
          <p>
            When I am not writing, I am probably reading something about typography,
            cognitive psychology, or the history of publishing.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a href="/contact" className="text-sm link-underline inline-block w-fit">
              Get in touch →
            </a>
          </div>
        </div>
      </div>

      <section className="border-t border-border pt-12">
        <p className="text-xs tracking-widest text-muted uppercase mb-8">Areas of focus</p>
        <div className="grid md:grid-cols-2 gap-px bg-border">
          {[
            { title: 'Content Strategy', desc: 'Information architecture, content audits, editorial planning and voice development.' },
            { title: 'UX Writing', desc: 'Interface copy, microcopy, onboarding flows and error messaging.' },
            { title: 'Content Design', desc: 'Bridging the gap between design systems and the words that live inside them.' },
            { title: 'Editorial', desc: 'Long-form articles, case studies, white papers and brand storytelling.' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-paper p-8">
              <h3 className="font-display text-xl font-light mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
