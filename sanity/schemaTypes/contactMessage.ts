// sanity/schemaTypes/contactMessage.ts
// Wiadomość z formularza kontaktowego. Zostaje szkicem (nigdy nie jest publikowana) —
// widoczna tylko w Studio. Kopia trafia też mailem przez Resend.

import { defineField, defineType } from 'sanity'

export const contactMessage = defineType({
  name: 'contactMessage',
  title: 'Wiadomość kontaktowa',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'name', title: 'Imię', type: 'string' }),
    defineField({ name: 'email', title: 'E-mail', type: 'string' }),
    defineField({ name: 'message', title: 'Wiadomość', type: 'text', rows: 8 }),
    defineField({ name: 'submittedAt', title: 'Wysłano', type: 'datetime' }),
  ],
  orderings: [{ title: 'Najnowsze', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'name', email: 'email', date: 'submittedAt' },
    prepare: ({ name, email, date }) => ({ title: name ?? email, subtitle: [email, date?.slice(0, 10)].filter(Boolean).join(' · ') }),
  },
})
