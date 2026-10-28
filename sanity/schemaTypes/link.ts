// sanity/schemaTypes/link.ts
// Wspólny link: do strony z page buildera, do kategorii, do wyszukiwarki albo na zewnątrz.
// Adres wylicza lib/links.ts (resolveHref).

import { defineField, defineType } from 'sanity'
import { CATEGORIES } from './article'

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'linkType',
      title: 'Prowadzi do',
      type: 'string',
      options: {
        list: [
          { title: 'Strona', value: 'page' },
          { title: 'Kategoria', value: 'category' },
          { title: 'Wyszukiwarka', value: 'search' },
          { title: 'Adres zewnętrzny', value: 'external' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'page',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'page',
      title: 'Strona',
      type: 'reference',
      to: [{ type: 'page' }],
      // Tylko strony w tym samym języku co edytowany dokument
      options: {
        filter: ({ document }) => ({ filter: 'locale == $locale', params: { locale: document?.locale ?? 'pl' } }),
      },
      hidden: ({ parent }) => parent?.linkType !== 'page',
      validation: (r) => r.custom((value, ctx) => ((ctx.parent as { linkType?: string })?.linkType === 'page' && !value ? 'Wybierz stronę' : true)),
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'string',
      options: { list: CATEGORIES },
      hidden: ({ parent }) => parent?.linkType !== 'category',
      validation: (r) => r.custom((value, ctx) => ((ctx.parent as { linkType?: string })?.linkType === 'category' && !value ? 'Wybierz kategorię' : true)),
    }),
    defineField({
      name: 'url',
      title: 'Adres',
      type: 'url',
      hidden: ({ parent }) => parent?.linkType !== 'external',
      validation: (r) =>
        r.uri({ scheme: ['http', 'https', 'mailto'] }).custom((value, ctx) => ((ctx.parent as { linkType?: string })?.linkType === 'external' && !value ? 'Podaj adres' : true)),
    }),
  ],
})

export const navItem = defineType({
  name: 'navItem',
  title: 'Pozycja menu',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Etykieta', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'link', title: 'Link', type: 'link', validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'link.linkType' } },
})
