import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './sanity/env'

export default defineCliConfig({
  api: { projectId, dataset },
  // Studio osadzone pod https://neoneon.online/studio, zarejestrowane dla Dashboard Sanity:
  // npx sanity deploy --external --url https://neoneon.online/studio
  deployment: { appId: 's6fhdhb8r8pu95qz6jmtvbim' },
})
