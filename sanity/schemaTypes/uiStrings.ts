// sanity/schemaTypes/uiStrings.ts
// Teksty interfejsu — jeden dokument na język (uiStrings-pl, uiStrings-en).
// Pola generowane z sanity/uiStringFields.ts.

import { defineField, defineType } from 'sanity'
import { UI_STRING_GROUPS } from '../uiStringFields'

export const uiStrings = defineType({
  name: 'uiStrings',
  title: 'Teksty interfejsu',
  type: 'document',
  groups: UI_STRING_GROUPS.map((g, i) => ({ name: g.namespace, title: g.title, default: i === 0 })),
  fields: [
    defineField({ name: 'locale', title: 'Język', type: 'string', readOnly: true, hidden: true }),
    ...UI_STRING_GROUPS.map((g) =>
      defineField({
        name: g.namespace,
        title: g.title,
        type: 'object',
        group: g.namespace,
        options: { collapsible: false },
        fields: g.fields.map((f) =>
          defineField({ name: f.key, title: f.title, description: f.description, type: 'string' })
        ),
      })
    ),
  ],
  preview: {
    select: { locale: 'locale' },
    prepare: ({ locale }) => ({ title: `Teksty interfejsu (${String(locale ?? '').toUpperCase()})` }),
  },
})
