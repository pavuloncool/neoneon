// sanity/schemaTypes/comment.ts
// Komentarz z formularza pod artykułem. /api/comments zapisuje go jako szkic (drafts.*)
// i taki zostaje na zawsze — szkice w publicznym datasecie są niedostępne bez tokena,
// więc e-mail autora nigdy nie jest publiczny. Zatwierdzenie = pole „Zatwierdzony” w Studio;
// strona czyta zatwierdzone komentarze tokenem (bez e-maila).

import { defineField, defineType } from 'sanity'

export const comment = defineType({
  name: 'comment',
  title: 'Komentarz',
  type: 'document',
  fields: [
    defineField({
      name: 'approved',
      title: 'Zatwierdzony',
      description: 'Zaznacz, aby komentarz pojawił się pod artykułem.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'article', title: 'Artykuł', type: 'reference', to: [{ type: 'article' }], weak: true, readOnly: true }),
    defineField({ name: 'authorName', title: 'Autor', type: 'string', readOnly: true }),
    defineField({ name: 'authorEmail', title: 'E-mail autora', type: 'string', readOnly: true }),
    defineField({ name: 'body', title: 'Treść', type: 'text', rows: 5, readOnly: true }),
    defineField({ name: 'submittedAt', title: 'Wysłano', type: 'datetime', readOnly: true }),
  ],
  orderings: [{ title: 'Najnowsze', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'authorName', body: 'body', article: 'article.title', approved: 'approved' },
    prepare: ({ name, body, article, approved }) => ({
      title: `${approved ? '✓' : '•'} ${name ?? '?'}: ${body?.slice(0, 60) ?? ''}`,
      subtitle: article,
    }),
  },
})
