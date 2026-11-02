// sanity/schemaTypes/faqField.ts
import { defineField, defineArrayMember } from 'sanity'

// Pole `faq` w schemacie artykułu (article.ts).
// Pytania i odpowiedzi wpisujesz raz w Studio; trafiają do JSON-LD,
// a w treści artykułu możesz je powtórzyć jako widoczną sekcję.
export const faqField = defineField({
  name: 'faq',
  title: 'FAQ (dane strukturalne)',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'object',
      name: 'faqItem',
      fields: [
        defineField({
          name: 'question',
          title: 'Pytanie',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'answer',
          title: 'Odpowiedź',
          type: 'text',
          rows: 4,
          validation: (rule) => rule.required(),
        }),
      ],
      preview: { select: { title: 'question' } },
    }),
  ],
})
