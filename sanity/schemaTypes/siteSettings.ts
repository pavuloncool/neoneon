// sanity/schemaTypes/siteSettings.ts
// Ustawienia strony — jeden dokument na język (siteSettings-pl, siteSettings-en):
// SEO domyślne, logo, nawigacja, stopka i etykiety dostępności.

import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Ustawienia strony',
  type: 'document',
  groups: [
    { name: 'seo', title: 'SEO', default: true },
    { name: 'branding', title: 'Logo' },
    { name: 'navigation', title: 'Nawigacja i stopka' },
    { name: 'a11y', title: 'Dostępność' },
  ],
  fields: [
    defineField({ name: 'locale', title: 'Język', type: 'string', readOnly: true, hidden: true }),

    defineField({ name: 'siteTitle', title: 'Tytuł strony (domyślny)', description: 'Pokazywany w karcie przeglądarki, gdy podstrona nie ma własnego tytułu.', type: 'string', group: 'seo', validation: (r) => [r.required(), r.max(60).warning('Google zwykle ucina tytuły dłuższe niż ok. 60 znaków.')] }),
    defineField({ name: 'titleTemplate', title: 'Szablon tytułu podstron', description: '%s zostanie zastąpione tytułem podstrony, np. „%s | neoneon”.', type: 'string', group: 'seo', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Opis strony (domyślny)', description: 'Zalecane 120–160 znaków.', type: 'text', rows: 3, group: 'seo', validation: (r) => r.max(160).warning('Google zwykle ucina opisy dłuższe niż ok. 160 znaków.') }),
    defineField({ name: 'ogImage', title: 'Obrazek do udostępnień', description: 'Zalecany rozmiar 1200×630 px.', type: 'image', group: 'seo' }),

    defineField({ name: 'logoLight', title: 'Logo — motyw jasny', type: 'image', group: 'branding' }),
    defineField({ name: 'logoDark', title: 'Logo — motyw ciemny', type: 'image', group: 'branding' }),
    defineField({ name: 'logoAlt', title: 'Tekst alternatywny logo', type: 'string', group: 'branding' }),

    defineField({ name: 'navigation', title: 'Nawigacja główna', type: 'array', of: [{ type: 'navItem' }], group: 'navigation' }),
    defineField({ name: 'footerText', title: 'Tekst w stopce', description: '{year} zostanie zastąpione bieżącym rokiem.', type: 'string', group: 'navigation' }),
    defineField({ name: 'footerLinks', title: 'Linki w stopce', type: 'array', of: [{ type: 'navItem' }], group: 'navigation' }),

    defineField({
      name: 'a11y',
      title: 'Etykiety dla czytników ekranu',
      description: 'Niewidoczne na stronie — odczytują je czytniki ekranu.',
      type: 'object',
      group: 'a11y',
      fields: [
        defineField({ name: 'skipToContent', title: 'Link „przejdź do treści”', type: 'string' }),
        defineField({ name: 'mainNav', title: 'Nawigacja główna (desktop)', type: 'string' }),
        defineField({ name: 'mobileNav', title: 'Nawigacja mobilna', type: 'string' }),
        defineField({ name: 'footerNav', title: 'Linki w stopce', type: 'string' }),
        defineField({ name: 'search', title: 'Ikona wyszukiwania', type: 'string' }),
        defineField({ name: 'menu', title: 'Przycisk menu mobilnego', type: 'string' }),
        defineField({ name: 'themeToggle', title: 'Przełącznik motywu', type: 'string' }),
        defineField({ name: 'languagePl', title: 'Przycisk języka PL', type: 'string' }),
        defineField({ name: 'languageEn', title: 'Przycisk języka EN', type: 'string' }),
      ],
    }),
  ],
  preview: {
    select: { locale: 'locale' },
    prepare: ({ locale }) => ({ title: `Ustawienia strony (${String(locale ?? '').toUpperCase()})` }),
  },
})
