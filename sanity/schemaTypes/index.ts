import { article } from './article'
import { blockContent } from './blockContent'
import { comment } from './comment'
import { contactMessage } from './contactMessage'
import { link, navItem } from './link'
import { page } from './page'
import { sectionSchemas } from './sections'
import { siteSettings } from './siteSettings'
import { tag } from './tag'
import { uiStrings } from './uiStrings'

export const schemaTypes = [
  article,
  tag,
  page,
  siteSettings,
  uiStrings,
  comment,
  contactMessage,
  blockContent,
  link,
  navItem,
  ...sectionSchemas,
]
