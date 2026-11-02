// sanity/schemaTypes/faqField.ts
import { defineField, defineArrayMember } from 'sanity'

// Pole `faq` w schemacie artykułu (article.ts).
// Pytania i odpowiedzi wpisujesz raz w Studio; trafiają do JSON-LD (FaqJsonLd)
// i do widocznej sekcji na końcu artykułu (FaqSection).
export const faqField = defineField({
  name: 'faq',
  title: 'FAQ',
  description: 'Wyświetla się na końcu artykułu jako sekcja „Najczęściej zadawane pytania” i trafia do danych strukturalnych dla wyszukiwarek. Nie powtarzaj tych pytań w treści.',
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
