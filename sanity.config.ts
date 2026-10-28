'use client'

// sanity.config.ts — Studio osadzone pod /studio (app/studio/[[...tool]]/page.tsx)

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'

// Komentarze i wiadomości powstają tylko z formularzy na stronie
const FORM_TYPES = ['comment', 'contactMessage']

export default defineConfig({
  name: 'neoneon',
  title: 'neoneon',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev) => prev.filter((item) => !FORM_TYPES.includes(item.templateId)),
    actions: (prev, { schemaType }) => {
      if (schemaType === 'contactMessage') return prev.filter(({ action }) => action === 'delete')
      if (schemaType === 'comment') return prev.filter(({ action }) => action === 'publish' || action === 'unpublish' || action === 'delete')
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
                .title('Do moderacji — Publish = zatwierdź, Delete = odrzuć')
                .filter('_type == "comment" && _id in path("drafts.**")')
                .defaultOrdering([{ field: 'submittedAt', direction: 'asc' }])
            ),
            S.listItem().title('Komentarze opublikowane').child(
              S.documentList()
                .title('Komentarze opublikowane')
                .filter('_type == "comment" && !(_id in path("drafts.**"))')
                .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
            ),
            S.documentTypeListItem('contactMessage').title('Wiadomości kontaktowe'),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
