'use client'

// sanity.config.ts — Studio osadzone pod /studio (app/studio/[[...tool]]/page.tsx)

import { defineConfig, type DocumentActionComponent } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool, defineDocuments, defineLocations } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import {
  documentInternationalization,
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from '@sanity/document-internationalization'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'

// Akcje wtyczki typują `action` jako string, a Sanity 6 oczekuje klucza akcji — w działaniu zgodne
const TRANSLATION_ACTIONS = [useDeleteTranslationAction, useDuplicateWithTranslationsAction] as DocumentActionComponent[]

// Komentarze i wiadomości powstają tylko z formularzy na stronie.
// Artykuł tworzymy z szablonu z językiem („Polski Artykuł” / „English Artykuł”) — bazowy
// szablon `article` (bez języka) i techniczny `article-parameterized` są ukryte.
const HIDDEN_TEMPLATES = ['comment', 'contactMessage', 'article', 'article-parameterized']

export default defineConfig({
  name: 'neoneon',
  title: 'neoneon',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev) => prev.filter((item) => !HIDDEN_TEMPLATES.includes(item.templateId)),
    actions: (prev, { schemaType }) => {
      if (schemaType === 'contactMessage') return prev.filter(({ action }) => action === 'delete')
      // Komentarze i wiadomości zostają szkicami (niepubliczne) — bez „Publish”
      if (schemaType === 'comment') return prev.filter(({ action }) => action === 'delete')
      if (schemaType === 'article') return [...prev, ...TRANSLATION_ACTIONS]
      return prev
    },
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Treści')
          .items([
            S.listItem().title('Artykuły PL').child(
              S.documentList().title('Artykuły PL').filter('_type == "article" && locale == "pl"').defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
            ),
            S.listItem().title('Artykuły EN').child(
              S.documentList().title('Artykuły EN').filter('_type == "article" && locale == "en"').defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
            ),
            S.divider(),
            S.documentTypeListItem('article').title('Wszystkie artykuły'),
            S.documentTypeListItem('tag').title('Tagi'),
            S.divider(),
            S.listItem().title('Komentarze do moderacji').child(
              S.documentList()
                .title('Do moderacji — „Zatwierdzony” = pokaż, Delete = odrzuć')
                .filter('_type == "comment" && approved != true')
                .defaultOrdering([{ field: 'submittedAt', direction: 'asc' }])
            ),
            S.listItem().title('Komentarze zatwierdzone').child(
              S.documentList()
                .title('Komentarze zatwierdzone')
                .filter('_type == "comment" && approved == true')
                .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
            ),
            S.documentTypeListItem('contactMessage').title('Wiadomości kontaktowe'),
          ]),
    }),
    // Podgląd strony z klikalną edycją. Strona działa pod tym samym adresem co Studio,
    // więc podgląd otwiera się na bieżącej domenie (neoneon.online, podgląd Vercel, localhost).
    presentationTool({
      title: 'Podgląd',
      previewUrl: {
        initial: '/pl',
        previewMode: { enable: '/api/draft-mode/enable', shareAccess: false },
      },
      resolve: {
        // Który dokument edytować, gdy w podglądzie otwarta jest dana strona
        mainDocuments: defineDocuments([
          {
            route: '/:locale/:category/:slug',
            filter: '_type == "article" && slug.current == $slug && locale == $locale',
          },
        ]),
        // Gdzie dany artykuł występuje na stronie (lista w edytorze artykułu)
        locations: {
          article: defineLocations({
            select: { title: 'title', slug: 'slug.current', locale: 'locale', category: 'category' },
            resolve: (doc) => ({
              locations:
                doc?.slug && doc.locale && doc.category
                  ? [
                      { title: doc.title || 'Artykuł', href: `/${doc.locale}/${doc.category}/${doc.slug}` },
                      { title: doc.locale === 'en' ? 'Strona główna (EN)' : 'Strona główna (PL)', href: `/${doc.locale}` },
                    ]
                  : [],
            }),
          }),
        },
      },
    }),
    // Oryginał → tłumaczenie: przycisk „Translations” w artykule tworzy wersję w drugim języku,
    // połączoną z oryginałem dokumentem translation.metadata
    documentInternationalization({
      supportedLanguages: [
        { id: 'pl', title: 'Polski' },
        { id: 'en', title: 'English' },
      ],
      schemaTypes: ['article'],
      languageField: 'locale',
      apiVersion,
      metadataOmnisearchVisibility: false,
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
