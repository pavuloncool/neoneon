// sanity/uiStringFields.ts
// Teksty interfejsu edytowalne w Studio (dokument uiStrings). Klucze odpowiadają przestrzeniom
// i kluczom z messages/*.json — i18n/request.ts nakłada wartości z Sanity na pliki JSON,
// więc istniejące wywołania t('…') działają bez zmian, a puste pole bierze tekst z JSON.

export const UI_STRING_GROUPS: {
  namespace: string
  title: string
  fields: { key: string; title: string; description?: string }[]
}[] = [
  {
    namespace: 'nav',
    title: 'Nazwy kategorii',
    fields: [
      { key: 'contentWriting', title: 'Content Writing', description: 'Nagłówek i tytuł strony kategorii.' },
      { key: 'uxStrategies', title: 'UX Strategies', description: 'Nagłówek i tytuł strony kategorii.' },
      { key: 'dataVisualisation', title: 'Data Visualisation', description: 'Nagłówek i tytuł strony kategorii.' },
    ],
  },
  {
    namespace: 'category',
    title: 'Strony kategorii',
    fields: [
      { key: 'label', title: 'Etykieta nad nagłówkiem' },
      { key: 'filterByTag', title: 'Nagłówek filtra tagów' },
      { key: 'noArticles', title: 'Brak artykułów w kategorii' },
    ],
  },
  {
    namespace: 'comments',
    title: 'Komentarze',
    fields: [
      { key: 'sectionZero', title: 'Nagłówek sekcji — brak komentarzy' },
      { key: 'sectionOne', title: 'Nagłówek sekcji — 1 komentarz' },
      { key: 'sectionMany', title: 'Nagłówek sekcji — wiele komentarzy', description: '{count} zostanie zastąpione liczbą komentarzy.' },
      { key: 'heading', title: 'Nagłówek formularza' },
      { key: 'fieldName', title: 'Pole: imię — etykieta' },
      { key: 'fieldEmail', title: 'Pole: e-mail — etykieta' },
      { key: 'fieldComment', title: 'Pole: komentarz — etykieta' },
      { key: 'placeholderName', title: 'Pole: imię — podpowiedź' },
      { key: 'placeholderEmail', title: 'Pole: e-mail — podpowiedź' },
      { key: 'placeholderComment', title: 'Pole: komentarz — podpowiedź' },
      { key: 'submit', title: 'Przycisk wysyłki' },
      { key: 'submitting', title: 'Przycisk w trakcie wysyłki' },
      { key: 'error', title: 'Komunikat błędu' },
      { key: 'captchaError', title: 'Komunikat odrzucenia (ochrona przed botami)' },
      { key: 'success', title: 'Komunikat po wysłaniu' },
    ],
  },
  {
    namespace: 'contact',
    title: 'Formularz kontaktowy',
    fields: [
      { key: 'fieldName', title: 'Pole: imię — etykieta' },
      { key: 'fieldEmail', title: 'Pole: e-mail — etykieta' },
      { key: 'fieldMessage', title: 'Pole: wiadomość — etykieta' },
      { key: 'placeholderName', title: 'Pole: imię — podpowiedź' },
      { key: 'placeholderEmail', title: 'Pole: e-mail — podpowiedź' },
      { key: 'placeholderMessage', title: 'Pole: wiadomość — podpowiedź' },
      { key: 'send', title: 'Przycisk wysyłki' },
      { key: 'sending', title: 'Przycisk w trakcie wysyłki' },
      { key: 'error', title: 'Komunikat błędu' },
      { key: 'captchaError', title: 'Komunikat odrzucenia (ochrona przed botami)' },
      { key: 'successTitle', title: 'Po wysłaniu — nagłówek' },
      { key: 'successBody', title: 'Po wysłaniu — tekst' },
    ],
  },
  {
    namespace: 'search',
    title: 'Wyszukiwarka',
    fields: [
      { key: 'heading', title: 'Nagłówek strony' },
      { key: 'placeholder', title: 'Podpowiedź w polu wyszukiwania' },
      { key: 'button', title: 'Przycisk „Szukaj”' },
      { key: 'filterByTag', title: 'Nagłówek filtra tagów' },
      { key: 'noResults', title: 'Brak wyników' },
      { key: 'result', title: 'Słowo „wynik” (1 wynik)' },
      { key: 'results', title: 'Słowo „wyniki” (wiele wyników)' },
      { key: 'tryDifferent', title: 'Podpowiedź przy braku wyników' },
      { key: 'enterTerm', title: 'Podpowiedź przed wyszukiwaniem' },
      { key: 'taggedWith', title: 'Opis filtra tagu', description: '{tag} zostanie zastąpione nazwą tagu.' },
    ],
  },
]
