// sanity/schemaTypes/tag.ts
import { defineField, defineType } from 'sanity'

export const tag = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nazwa (PL)', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'nameEn', title: 'Nazwa (EN)', type: 'string' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
  ],
  orderings: [{ title: 'Nazwa', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'nameEn' } },
})
