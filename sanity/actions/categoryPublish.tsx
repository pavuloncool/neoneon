// sanity/actions/categoryPublish.tsx
// „Opublikuj” dla kategorii. Bez zmiany sluga — zwykła publikacja (akcja oryginalna bez zmian).
// Przy zmianie sluga opublikowanej kategorii — „Opublikuj (zmiana adresu)”: po potwierdzeniu dopisuje
// stary slug do `previousSlugs` (a usuwa z listy nowy, gdy to powrót do dawnego adresu) i publikuje.
// Strona przekierowuje wtedy stare adresy kategorii i jej artykułów na nowe (308).
// Walidacja sluga (schemaTypes/category.ts) zgłasza błąd przy zmianie bez wpisu w `previousSlugs` —
// akcja pozwala opublikować, gdy to jedyny błąd, bo sama ten wpis dodaje.

import { useState } from 'react'
import {
  useDocumentOperation,
  useValidationStatus,
  type DocumentActionComponent,
  type DocumentActionDescription,
  type DocumentActionProps,
} from 'sanity'
import { SLUG_CHANGE_MESSAGE } from '../schemaTypes/category'

type CategoryDoc = { slug?: { current?: string }; previousSlugs?: string[]; locale?: string }

export function createCategoryPublishAction(original: DocumentActionComponent): DocumentActionComponent {
  const CategoryPublishAction = (props: DocumentActionProps): DocumentActionDescription | null => {
    const base = original(props)
    const { patch, publish } = useDocumentOperation(props.id, props.type)
    const { validation, isValidating } = useValidationStatus(props.id, props.type, true)
    const [confirming, setConfirming] = useState(false)

    const draft = props.draft as CategoryDoc | null
    const published = props.published as CategoryDoc | null
    const oldSlug = published?.slug?.current
    const newSlug = draft?.slug?.current
    if (!base || !draft || !oldSlug || !newSlug || oldSlug === newSlug) return base

    const errors = validation.filter((m) => m.level === 'error')
    const onlySlugChange = errors.every((m) => (m.message ?? '').startsWith(SLUG_CHANGE_MESSAGE))
    const locale = draft.locale ?? 'pl'

    return {
      ...base,
      label: 'Opublikuj (zmiana adresu)',
      title: `Zmienia adres kategorii z /${locale}/${oldSlug} na /${locale}/${newSlug}`,
      disabled: isValidating || !onlySlugChange || Boolean(publish.disabled),
      onHandle: () => setConfirming(true),
      dialog: confirming && {
        type: 'confirm' as const,
        tone: 'caution' as const,
        message: `Adres kategorii zmieni się z /${locale}/${oldSlug} na /${locale}/${newSlug}. Adresy wszystkich jej artykułów też się zmienią. Stare adresy będą przekierowane (308) na nowe. Opublikować?`,
        onCancel: () => setConfirming(false),
        onConfirm: () => {
          const previous = (draft.previousSlugs ?? []).filter((s) => s !== newSlug)
          if (!previous.includes(oldSlug)) previous.push(oldSlug)
          patch.execute([{ set: { previousSlugs: previous } }])
          publish.execute()
          setConfirming(false)
          props.onComplete()
        },
      },
    }
  }
  CategoryPublishAction.action = 'publish' as const
  return CategoryPublishAction
}
