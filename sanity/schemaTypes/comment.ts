// sanity/schemaTypes/comment.ts
// Komentarz z formularza pod artykułem. /api/comments zapisuje go jako szkic (drafts.*),
// a zatwierdzenie = „Publish” w Studio. Na stronie widać tylko opublikowane.

import { defineField, defineType } from 'sanity'

export const comment = defineType({
  name: 'comment',
  title: 'Komentarz',
  type: 'document',
  fields: [
    defineField({ name: 'article', title: 'Artykuł', type: 'reference', to: [{ type: 'article' }], weak: true, readOnly: true }),
    defineField({ name: 'authorName', title: 'Autor', type: 'string', readOnly: true }),
    defineField({ name: 'authorEmail', title: 'E-mail autora', type: 'string', readOnly: true }),
    defineField({ name: 'body', title: 'Treść', type: 'text', rows: 5, readOnly: true }),
    defineField({ name: 'submittedAt', title: 'Wysłano', type: 'datetime', readOnly: true }),
  ],
  orderings: [{ title: 'Najnowsze', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'authorName', body: 'body', article: 'article.title' },
    prepare: ({ name, body, article }) => ({ title: `${name ?? '?'}: ${body?.slice(0, 60) ?? ''}`, subtitle: article }),
  },
})
