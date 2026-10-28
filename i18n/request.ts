import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { getUiStrings } from '@/lib/queries'
import { UI_STRING_GROUPS } from '@/sanity/uiStringFields'

type Messages = Record<string, Record<string, string>>

// Teksty interfejsu z Sanity (dokument uiStrings) nakładamy na messages/*.json.
// Puste pole albo błąd Sanity = tekst z pliku JSON, więc strona zawsze ma komplet tekstów.
async function withSanityStrings(locale: string, messages: Messages): Promise<Messages> {
  let fromSanity: Messages | null = null
  try {
    fromSanity = await getUiStrings(locale)
  } catch (error) {
    console.error('uiStrings: nie udało się pobrać tekstów z Sanity', error)
  }
  if (!fromSanity) return messages

  const merged: Messages = { ...messages }
  for (const { namespace, fields } of UI_STRING_GROUPS) {
    const values = fromSanity[namespace]
    if (!values) continue
    merged[namespace] = { ...merged[namespace] }
    for (const { key } of fields) {
      const value = values[key]
      if (typeof value === 'string' && value.trim() !== '') merged[namespace][key] = value
    }
  }
  return merged
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }
  const messages = (await import(`../messages/${locale}.json`)).default as Messages
  return {
    locale,
    messages: await withSanityStrings(locale, messages),
  }
})
