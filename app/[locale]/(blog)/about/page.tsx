import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: 'pl' | 'en' }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  return { title: t('label'), description: t('bio1') }
}

export default async function AboutPage() {
  const t = await getTranslations('about')
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-16">
        <p className="text-xs tracking-widest text-muted uppercase mb-4">{t('label')}</p>
        <h1 className="font-display text-6xl md:text-7xl font-light leading-none">Paweł Kuligowski</h1>
      </header>
      <div className="grid md:grid-cols-[1fr_2fr] gap-12 mb-16">
        <div className="aspect-[3/4] w-full max-w-xs overflow-hidden relative">
          <Image src="/neoneon-pawel.webp" alt="Paweł Kuligowski" fill className="object-cover" />
        </div>
        <div className="flex flex-col gap-6 text-[1.0625rem] leading-relaxed">
          <p>{t('bio1')}</p>
          <p>{t('bio2')}</p>
          <p>{t('bio3')}</p>
          <div className="mt-4">
            <Link href="/contact" className="text-sm link-underline inline-block w-fit">{t('cta')}</Link>
          </div>
        </div>
      </div>
      <section className="border-t border-border pt-12">
        <p className="text-xs tracking-widest text-muted uppercase mb-8">{t('areasLabel')}</p>
        <div className="grid md:grid-cols-2 gap-px bg-border">
          {(['area1', 'area2', 'area3', 'area4'] as const).map((key) => (
            <div key={key} className="bg-paper dark:bg-ink text-ink dark:text-paper p-8">
              <h3 className="font-display text-xl font-light mb-2">{t(`${key}Title` as any)}</h3>
              <p className="text-sm text-muted leading-relaxed">{t(`${key}Desc` as any)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
