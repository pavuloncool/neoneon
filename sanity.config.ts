'use client'

// sanity.config.ts — Studio osadzone pod /studio (app/studio/[[...tool]]/page.tsx)

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'

export default defineConfig({
  name: 'neoneon',
  title: 'neoneon',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
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
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
