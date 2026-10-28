# Changelog

## 2026-10-28

### Przełącznik języka na stronach z page buildera

Przełącznik języka zamieniał tylko prefiks języka, więc po zmianie adresu strony w jednym języku (np. `/pl/o-mnie` przy `/en/about`) prowadził do 404. Teraz strony — tak jak artykuły — podają adres odpowiednika z powiązania PL ↔ EN w Sanity (`getPageTranslation`, `TranslationStore` zapisuje gotową ścieżkę). Strona bez tłumaczenia przenosi na stronę główną drugiego języka.

### Page builder — cała treść strony edytowalna w Sanity Studio

**Model treści (Sanity):**
- `page` — strony z sekcji (PL/EN, łączone wtyczką tłumaczeń): strona główna (`isHome`), „O mnie” (`about`), „Kontakt” (`contact`) i nowe strony pod `/{locale}/{slug}`. Sekcje: Nagłówek strony, Kafelki kategorii, Najnowsze artykuły, Tekst ze zdjęciem, Siatka obszarów, Formularz kontaktowy, Tekst.
- `siteSettings` (po jednym na język) — SEO domyślne, logo, nawigacja, stopka, etykiety dla czytników ekranu.
- `uiStrings` (po jednym na język) — teksty interfejsu (kategorie, komentarze, formularz kontaktowy, wyszukiwarka). `i18n/request.ts` nakłada je na `messages/*.json`; puste pole = tekst z JSON.

**Frontend:** `components/sections/*` (klasy 1:1 z dawnych stron), `components/blog/ContactForm.tsx` (logika formularza i Turnstile bez zmian), `Nav`/`Footer`/`LanguageSwitcher` z danymi z ustawień, `lib/links.ts`, `lib/metadata.ts`. Trasy `about/` i `contact/` zastąpione przez `[...segments]` (1 segment = strona). Znaczniki edycji (stega) w podglądzie tylko dla artykułów i tagów.

**Dane startowe:** `scripts/seed-site-content.ts` (`node --experimental-strip-types …`, `--dry-run`, domyślnie tworzy tylko brakujące dokumenty, `--overwrite` nadpisuje). Strony identyczne z poprzednią wersją (porównanie 12 stron PL/EN: tekst, struktura i klasy, linki, metadane, wysokości).

**Poprawki dostępności przy okazji:** etykiety `aria-label` i link „przejdź do treści” w wersji EN są po angielsku; „Toggle theme” po polsku to „Przełącz motyw”.

**Inne:** `tsconfig.json` — `allowImportingTsExtensions` (skrypt TS uruchamiany przez Node importuje `sanity/uiStringFields.ts`); tytuł domyślny i szablon tytułów z ustawień strony (usunięte z `app/layout.tsx`).

### Presentation Tool (podgląd z klikalną edycją) w Studio

**Nowe pliki:**
- `sanity/lib/fetch.ts` — `sanityFetch`: poza podglądem opublikowane treści z CDN (bez zmian); w podglądzie (Draft Mode) szkice + stega tylko w polach tekstowych (tytuł, zajawka, treść, nazwy tagów). Slugi, kategorie, języki, ID i daty bez znaczników.
- `app/api/draft-mode/enable/route.ts` — `defineEnableDraftMode`; podgląd włącza tylko Studio (jednorazowy sekret weryfikowany w Sanity), bez niego 401.
- `app/api/draft-mode/disable/route.ts` — wyłączenie podglądu.
- `components/layout/DraftModeBanner.tsx` — „Podgląd szkiców · Wyłącz” poza Studio.

**Co zostało zmienione:** `sanity.config.ts` — `presentationTool` („Podgląd”, start `/pl`, `shareAccess: false`, powiązanie stron `/:locale/:category/:slug` z artykułami); `app/[locale]/layout.tsx` — `<VisualEditing />` w trybie podglądu; `lib/queries.ts` — artykuły i tagi przez `sanityFetch`; metadane artykułu przez `stegaClean`. Token Viewer zostaje wyłącznie na serwerze (bez `defineLive`/`browserToken`, bo dałby przeglądarce dostęp do szkiców komentarzy z e-mailami).

### Porządki po migracji — usunięcie Supabase

- Usunięte: `scripts/migrate-to-sanity.mjs` (migracja zakończona) i devDependency `@supabase/supabase-js`.
- Z `.env.local.example` (i lokalnego `.env.local`) usunięte zmienne Supabase; z Vercel usunięte `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- `scripts/export_supabase_backup.sh` i katalog `supabase/` zostają do czasu usunięcia projektu Supabase (ostatni backup / historia schematu).

### Ochrona formularzy (Cloudflare Turnstile) i powiadomienia o komentarzach

**Nowe pliki:**
- `lib/turnstile.ts` — weryfikacja tokena po stronie serwera (Siteverify, timeout 10 s, jedna ponowna próba z tym samym `idempotency_key`)
- `components/ui/Turnstile.tsx` — niewidoczny widget (`appearance: interaction-only`), pokazuje się tylko przy podejrzanym ruchu; dopóki niewidoczny, nie zajmuje miejsca w formularzu

**Co zostało zmienione:**

**Formularze komentarza i kontaktu:** przycisk „Wyślij” jest aktywny po otrzymaniu tokena Turnstile; token jest jednorazowy, więc widget resetuje się po każdej wysyłce. Przy odrzuceniu (403) komunikat `captchaError` (PL/EN).

**`/api/comments` i `/api/contact`:** najpierw weryfikacja Turnstile (403 przy braku/odrzuceniu tokena), potem limity długości (imię 100, e-mail 200, treść 5000 znaków → 400), dopiero potem zapis do Sanity i Resend.

**Powiadomienie o komentarzu:** po zapisaniu komentarza mail na `ask@neoneon.online` (tytuł artykułu, autor, e-mail, treść, link do komentarza w Studio). Błąd wysyłki maila nie blokuje komentarza.

**`escapeHtml`** przeniesione do `lib/utils.ts` (używane w obu trasach).

**Konfiguracja:** `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`. Lokalnie i na podglądach Vercel — oficjalne klucze testowe Cloudflare; na produkcji — klucze widgetu `neoneon`.

### Artykuły i tagi przeniesione z Supabase do Sanity

**Zakres:** całe zaplecze przeszło do Sanity (projekt `n81gbqh8`, dataset `production`, publiczny — plan Free): artykuły, tagi, obrazy, komentarze i wiadomości kontaktowe. Supabase nie jest już używany przez stronę. Frontend Next.js, wygląd i adresy URL — bez zmian. Maile z formularza kontaktowego dalej wysyła Resend.

**Nowe pliki:**
- `sanity.config.ts`, `sanity.cli.ts`, `sanity/env.ts`, `sanity/schemaTypes/*` — schematy `article`, `tag`, `blockContent`
- `sanity/lib/client.ts`, `sanity/lib/image.ts`
- `app/studio/[[...tool]]/page.tsx`, `app/studio/layout.tsx` — Sanity Studio pod `/studio`
- `components/blog/PortableTextRenderer.tsx` — zastępuje `TiptapRenderer`, generuje ten sam HTML (style `.article-body` bez zmian)
- `scripts/migrate-to-sanity.mjs` — migracja Supabase → Sanity (`--dry-run`, idempotentna)
- `supabase/2026-10-28_sanity_comments_fk.sql` — usunięcie FK `comments → articles` (etap przejściowy)
- `sanity/schemaTypes/comment.ts`, `sanity/schemaTypes/contactMessage.ts`

**Co zostało zmienione:**

**Warstwa danych:** `lib/queries.ts` czyta artykuły i tagi z Sanity (GROQ). Nazwy funkcji i kształt zwracanych danych (`Article`, `Tag`) bez zmian, więc strony nie wymagały przeróbek. Okładka: `cover_focal_x/y` pochodzi z hotspotu obrazu w Sanity. `_id` zmigrowanych artykułów = dawne UUID, więc komentarze w Supabase dalej pasują.

**Wyszukiwarka:** zamiast Postgres FTS (słownik angielski, tylko tytuł + zajawka) — GROQ `match` po tytule, zajawce i treści, z dopasowaniem prefiksów. Lepiej działa po polsku.

**Czas czytania:** liczony z czystego tekstu artykułu zamiast z surowego JSON-a Tiptap (który zawyżał wynik m.in. o kod embedów Instagrama). Zmienia wartość w 3 artykułach (np. Jazz kissa: 7 → 4–5 min).

**Komentarze:** `/api/comments` zapisuje komentarz w Sanity jako szkic (`drafts.*`) i taki zostaje na zawsze — szkice są niedostępne bez tokena, więc e-mail autora nigdy nie jest publiczny. Zatwierdzenie = pole „Zatwierdzony” w Studio (lista „Komentarze do moderacji”), odrzucenie = „Delete”. Strona czyta zatwierdzone komentarze tokenem Viewer, bez e-maila.

**Formularz kontaktowy:** `/api/contact` wysyła mail przez Resend jak dotąd, a kopię zapisuje w Sanity jako szkic (lista „Wiadomości kontaktowe” w Studio). Dane w treści maila są teraz escapowane.

**Tłumaczenia (oryginał → tłumaczenie):** wersje PL/EN łączy wtyczka `@sanity/document-internationalization` (dokumenty `translation.metadata`) zamiast ręcznie wpisywanego pola `translationId`. W Studio: przycisk tłumaczeń w artykule tworzy wersję w drugim języku połączoną z oryginałem; nowe artykuły zakłada się z szablonu z językiem („Polski Artykuł” / „English Artykuł”). Pole `locale` ustawia wtyczka (tylko do odczytu). Przełącznik języka na stronie korzysta z `translation.metadata` — 5 istniejących par przeniesione. Wymagane peer dependencies (`sanity-plugin-internationalized-array`, `@sanity/language-filter`) dodane jawnie, bo `.npmrc` ma `legacy-peer-deps=true`.

**Plan Free Sanity:** prywatne datasety i rola Contributor są tylko w płatnym planie Growth, dlatego dataset jest publiczny, a dane z e-mailami (komentarze, wiadomości) nigdy nie są publikowane. Token formularzy ma rolę Editor (dostępna na Free) i jest wyłącznie po stronie serwera.

**Usunięte:** panel `/admin`, strona `/login`, kropka w stopce prowadząca do logowania, `lib/supabase`, edytor Tiptap i upload obrazów oraz zależności `@tiptap/*` i `@supabase/ssr`. `@supabase/supabase-js` zostaje tylko jako devDependency skryptu migracji.

**Zależności:** React 18 → 19 (wymaganie Sanity), framer-motion 12, lucide-react 1.x. Skrypt `typecheck` wskazuje wprost TypeScript projektu (5.9), bo `@sanity/cli` instaluje własny `tsc` 6.

## 2026-03-23

### Audyt dostępności WCAG 2.2 — wdrożenie poprawek (11 punktów)

**Zmienione pliki:**
- `app/layout.tsx`
- `app/[locale]/layout.tsx`
- `app/[locale]/(blog)/layout.tsx`
- `app/[locale]/(blog)/page.tsx`
- `components/layout/Nav.tsx`
- `components/layout/LanguageSwitcher.tsx`
- `components/layout/Footer.tsx`
- `styles/globals.css`

**Co zostało zmienione:**

**SC 3.1.1 — Język strony (`lang` na `<html>`):** Root layout (`app/layout.tsx`) oddał elementy `<html>` i `<body>` do `app/[locale]/layout.tsx`, który ma bezpośredni dostęp do segmentu `locale`. Dzięki temu `<html lang={locale}>` przyjmuje wartość `"pl"` lub `"en"` w zależności od aktywnej wersji językowej. Fonty (`cormorant`, `dmSans`, `dmMono`) i `ThemeProvider` przeniesione razem do locale layout. Root layout stał się minimalnym pass-through wymaganym przez Next.js.

**SC 2.4.1 — Pomiń bloki (skip link):** W `app/[locale]/(blog)/layout.tsx` dodany link "Przejdź do treści głównej" jako pierwszy element DOM przed `<Nav>`. Wizualnie ukryty klasą `sr-only`, pojawia się przy fokusie klawiatury (`focus:not-sr-only`). Element `<main>` otrzymał `id="main-content"` jako cel linku.

**SC 4.1.2 — Linki ikon bez tekstu:** Oba linki wyszukiwania w `Nav.tsx` (desktop i mobile) otrzymały `aria-label="Szukaj"`. Ikony `<Search>` z Lucide opatrzone `aria-hidden="true"`, żeby czytnik nie dublował roli. Separator `|` w `LanguageSwitcher.tsx` oznaczony `aria-hidden="true"`.

**SC 4.1.2 — Przycisk menu hamburger:** Przycisk mobilny otrzymał `aria-expanded={menuOpen}` (dynamicznie `true`/`false`) oraz `aria-controls="mobile-menu"`. Kontener menu dostał odpowiadające `id="mobile-menu"`. Zmieniony też `aria-label` na bardziej opisowy "Otwórz menu nawigacyjne".

**SC 4.1.2 — Przyciski języka:** W `LanguageSwitcher.tsx` dodane `aria-pressed={locale === 'pl'/'en'}` i `aria-label="Polski"/"English"` — czytnik ekranu informuje teraz o aktywnym języku i stanie przycisku.

**SC 1.4.3 / 4.1.2 — Link `·` w stopce:** Link do `/login` (panel admina) w `Footer.tsx` otrzymał `aria-hidden="true"` i `tabIndex={-1}` — jest niewidoczny dla czytników ekranu i niedostępny z klawiatury. Wizualnie pozostaje bez zmian.

**SC 2.5.8 — Obszary dotyku min. 24×24 px:** Link wyszukiwania desktop otrzymał `p-1` (łączny obszar ~24px). Przyciski `PL`/`EN` w `LanguageSwitcher.tsx` — `py-0.5` zmienione na `py-1` (min. 24px wysokości obszaru klikalnego).

**SC 1.3.1 — Nawigacje z etykietami:** W `Nav.tsx` dodane `aria-label="Główna nawigacja"` (desktop) i `aria-label="Nawigacja mobilna"` (mobile). W `Footer.tsx` dodane `aria-label="Linki w stopce"`. Czytniki ekranu mogą teraz odróżnić i nazwać każdy region nawigacyjny.

**SC 1.3.6 — Sekcje bez nazw:** Trzy elementy `<section>` na stronie głównej (`page.tsx`) otrzymały etykiety: sekcja hero — `aria-labelledby="home-heading"` (wskazuje na `<h1 id="home-heading">`), sekcja kategorii — `aria-label="Kategorie"`, sekcja najnowszych artykułów — `aria-labelledby="recent-heading"` (wskazuje na `<h3 id="recent-heading">`).

**SC 1.3.1 — Daty artykułów sklejone z tytułem:** Daty w liście artykułów na stronie głównej opakowane w `<time dateTime={isoString}>` z poprawnym atrybutem `datetime`. Na całym linku artykułu dodane `aria-label={tytuł + data}` — czytnik odczytuje pełną, gramatyczną nazwę linku zamiast sklejonego "tytuł21 marca 2026".

**SC 2.3.3 — prefers-reduced-motion:** W `globals.css` dodana reguła `@media (prefers-reduced-motion: reduce)` wyłączająca wszystkie animacje CSS i przejścia (`animation-duration: 0.01ms`, `transition-duration: 0.01ms`) dla użytkowników z tą preferencją ustawioną w systemie operacyjnym.

---

## 2026-03-22

### Naprawa linku "View" w adminie — błędny locale (404 dla artykułów EN)

**Zmieniony plik:**
- `app/admin/articles/page.tsx`

**Co zostało zmienione:**

Link "View ↗" przy każdym artykule w panelu admina budował URL jako `/{category}/{slug}` bez prefiksu locale. next-intl bez prefiksu używał domyślnego locale (`pl`), przez co artykuły EN trafiały na `/pl/[slug-angielski]` — zapytanie `getArticleBySlug(slug, 'pl')` zwracało null i strona wyświetlała 404. Problem pojawiał się zarówno lokalnie, jak i po deployu. Zmienione na `/${article.locale ?? 'pl'}/${article.category}/${article.slug}`.

---

### Naprawa uciętej treści artykułu — brak escapowania HTML w TiptapRenderer

**Zmieniony plik:**
- `components/blog/TiptapRenderer.tsx`

**Co zostało zmienione:**

`renderNode` nie escapował znaków specjalnych HTML (`<`, `>`, `&`, `"`, `'`) w węzłach `type: 'text'`. Artykuł zawierający fragmenty kodu HTML w zwykłym tekście (np. `<div>`, `</section>`) był interpretowany przez przeglądarkę jako prawdziwe tagi HTML — mogło to zamknąć nadrzędny element `.article-body` przedwcześnie, przez co dalsza treść "wypadała" z layoutu i sprawiała wrażenie uciętej. Problem dotyczył obu wersji językowych (PL i EN). Dodana funkcja `escapeHtml()` wywoływana na każdym węźle `type: 'text'` przed aplikowaniem marków. Escapowanie działa poprawnie razem z markami: tekst jest escapowany, ale owijające go `<strong>`, `<em>`, `<a>` itd. pozostają jako prawdziwy HTML.

---

### Naprawa pustej strony artykułu przy bezpośrednim dostępie (force-dynamic)

**Zmieniony plik:**
- `app/[locale]/(blog)/[category]/[slug]/page.tsx`

**Co zostało zmienione:**

Dodany `export const dynamic = 'force-dynamic'` na początku pliku. Vercel mógł zakeszować odpowiedź 404 dla URL artykułu z okresu, gdy artykuł był jeszcze draftem lub wersja EN nie istniała. Hard refresh (pełny request przez CDN) serwował stary cache — strona wydawała się pusta (brak artykułu i logo). Soft navigation przez Next.js `<Link>` omijała CDN i trafiała bezpośrednio do origin serwera, więc działała poprawnie pod tym samym URL. `force-dynamic` wymusza nagłówki `no-store, no-cache`, co zapobiega keszowaniu odpowiedzi 404 na edge.

---

### Naprawa toggle tagów na stronie /search

**Zmieniony plik:**
- `app/[locale]/(blog)/search/page.tsx`

**Co zostało zmienione:**

`TagBadge` na stronie `/search` nie miał przekazanego `href`, przez co używał domyślnego `/search?tag={slug}` bez możliwości odznaczenia. Kliknięcie aktywnego tagu prowadziło do tego samego URL — użytkownik nie mógł zresetować filtra bez przeładowania strony lub przejścia na inną podstronę. Dodany `href` z logiką identyczną jak na stronach kategorii: aktywny tag → `/search` (reset), nieaktywny tag → `/search?tag={slug}`.

---

### Spolszczenie napisu "tagged" na stronie /search

**Zmienione pliki:**
- `app/[locale]/(blog)/search/page.tsx`
- `messages/pl.json`
- `messages/en.json`

**Co zostało zmienione:**

Wynik filtrowania po tagu wyświetlał hardkodowany angielski napis `tagged "kultura"` niezależnie od locale. Dodany klucz `taggedWith` do obu plików messages: `"z tagiem \"{tag}\""` (pl) i `"tagged \"{tag}\""` (en). W `search/page.tsx` hardkodowany string zastąpiony wywołaniem `t('taggedWith', { tag })`.

---

## 2026-03-21

### Automatyczna detekcja języka przeglądarki

**Zmienione pliki:**
- `i18n/routing.ts`
**Co zostało zmienione:**

`i18n/routing.ts` — zmieniony `defaultLocale` z `'pl'` na `'en'`, kolejność locales na `['en', 'pl']`, dodany `localeDetection: true`.

`proxy.ts` — plik już istniał w projekcie i zawierał logikę detekcji języka przez `next-intl`. Czyta nagłówek `Accept-Language` wysyłany przez przeglądarkę i automatycznie przekierowuje:
- przeglądarka z językiem polskim → `/pl/...`
- wszystkie pozostałe języki → `/en/...` (domyślny)

**Poprawka:** usunięty błędnie utworzony plik `middleware.ts` — Next.js 16 zastąpił konwencję `middleware.ts` plikiem `proxy.ts`. Projekt już używał `proxy.ts`, więc nowy plik był zbędny i powodował błąd przy starcie serwera.

---

### Ukrycie sekcji Data Visualisation na stronie głównej

**Zmieniony plik:**
- `app/[locale]/(blog)/page.tsx`

**Co zostało zmienione:**

Usunięty kafelek kategorii "Data Visualisation" z siatki na stronie głównej. Siatka zmieniona z `grid-cols-3` na `grid-cols-2` — pozostały dwie kategorie: Content Writing i UX Strategies.

---

### Ukrycie Data Visualisation w stopce

**Zmieniony plik:**
- `components/layout/Footer.tsx`

**Co zostało zmienione:**

Usunięty link do "Data Visualisation" z nawigacji w stopce strony.

---

### Naprawa linku do logowania w stopce

**Zmieniony plik:**
- `components/layout/Footer.tsx`

**Co zostało zmienione:**

Link z kropką (·) prowadzący do panelu admina używał `Link` z `@/i18n/navigation`, który automatycznie dodaje prefix locale — przez co kierował na `/pl/login` lub `/en/login` zamiast na `/login`. Zamieniony na `NextLink` z `next/link`, który nie dodaje locale — strona logowania admina jest jedna, bez podziału na wersje językowe.

---

### Zmniejszenie odstępów przed nagłówkami H2 i H3

**Zmieniony plik:**
- `styles/globals.css`

**Co zostało zmienione:**

`margin-top` dla `.article-body h2` i `.article-body h3` zmniejszony z `2.5rem` do `1.25rem` (o połowę). H1 zachowuje oryginalną wartość `2.5rem`. Zmiana dotyczy wyłącznie nagłówków w treści artykułu (klasa `.article-body`).

---

### Usunięcie nadmiarowego białego miejsca pod embedami Instagram

**Zmieniony plik:**
- `styles/globals.css`

**Co zostało zmienione:**

Dodana reguła `.article-body pre code:has(iframe) { display: block; line-height: 0; }`. Embedy Instagram przechowywane są w TipTap jako bloki kodu (`<pre><code>`). Skrypt Instagrama wstrzykuje do nich `<iframe>` z `margin-bottom: 12px`, a znak `\n` w treści bloku generował dodatkowy line-box 30px (przy `line-height: 1.8`). Łącznie 43px niewidzialnego odstępu pod embedem. Reguła `:has(iframe)` celuje tylko w bloki z embedami, nie dotyka zwykłych bloków kodu.

---

### Zmniejszenie interlinii nagłówków H1–H3

**Zmieniony plik:**
- `styles/globals.css`

**Co zostało zmienione:**

Dodany `line-height: 1.2` dla `.article-body h1, h2, h3`. Nagłówki dziedziczyły `line-height: 1.8` z `.article-body` — wartość właściwa dla tekstu ciągłego, ale zbyt duża dla wieloliniowych nagłówków na mobile (o 30–40% za duża). Wartość 1.2 jest standardowa dla dużego kroju szeryfowego.

---

### Naprawa wyświetlania embedów przy nawigacji client-side

**Zmienione pliki:**
- `components/blog/TiptapRenderer.tsx`
- `components/blog/EmbedActivator.tsx` *(nowy)*

**Co zostało zmienione:**

Skrypty wstrzyknięte przez `dangerouslySetInnerHTML` nie są wykonywane przez przeglądarkę — działało to tylko przy pełnym przeładowaniu (SSR), ale nie przy nawigacji po stronie (Next.js router). `TiptapRenderer` pozostał Server Componentem (brak błędu hydratacji). Dodany osobny `EmbedActivator` — Client Component zwracający `null`, który w `useEffect` re-tworzy węzły `<script>` po zamontowaniu i wywołuje `window.instgrm?.Embeds.process()` jeśli biblioteka Instagrama była już w cache.

---

### Usunięcie nieużywanych czcionek Geist

**Zmienione pliki:**
- `app/fonts/GeistVF.woff` *(usunięty)*
- `app/fonts/GeistMonoVF.woff` *(usunięty)*
- `app/fonts/` *(folder usunięty)*

**Co zostało zmienione:**

Pliki Geist i Geist Mono były domyślnymi czcionkami generowanymi przez `create-next-app`. Projekt używa Cormorant Garamond i DM Sans/Mono z Google Fonts — pliki Geist nigdy nie były importowane ani używane.

---

### Instalacja własnego faviconu

**Zmienione pliki:**
- `app/favicon.ico` *(usunięty)*
- `app/icon.png` *(nowy)*
- `app/apple-icon.png` *(nowy)*

**Co zostało zmienione:**

Usunięty domyślny favicon Vercela (`favicon.ico`). Dodane dwa pliki PNG (180×180) w katalogu `app/` — Next.js App Router automatycznie generuje dla nich odpowiednie tagi `<link rel="icon">` i `<link rel="apple-touch-icon">` bez żadnej konfiguracji.

---

### Spolszczenie formularza komentarzy

**Zmienione pliki:**
- `components/blog/CommentForm.tsx`
- `messages/pl.json`
- `messages/en.json`
- `app/[locale]/(blog)/[category]/[slug]/page.tsx`

**Co zostało zmienione:**

Wszystkie hardcodowane angielskie stringi w formularzu komentarzy zastąpione `useTranslations('comments')`. Dodana sekcja `comments` do obu plików messages. Spolszczony również nagłówek sekcji komentarzy (`Comments` → `Komentarze`) oraz licznik (`1 comment` → `1 komentarz`), który był hardcodowany osobno w `page.tsx`.

---

### Tłumaczenie tagów z bazy danych

**Zmienione pliki:**
- `types/index.ts`
- `components/blog/TagBadge.tsx`
- `components/admin/TagsManager.tsx`
- `app/api/admin/tags/route.ts`

**Migracja bazy danych:**
- Dodana kolumna `name_en text` do tabeli `tags`
- Uzupełnione angielskie nazwy dla istniejących tagów

**Co zostało zmienione:**

Poprzednie podejście (tłumaczenia w plikach messages) wymagało ręcznej edycji kodu i deployu przy każdym nowym tagu. Nowe podejście: kolumna `name_en` w Supabase. Panel admina ma teraz dwa pola przy dodawaniu tagu (PL i EN). `TagBadge` czyta `getLocale()` z next-intl i wyświetla `name_en` na wersji angielskiej lub `name` na polskiej. Jeśli `name_en` nie jest wypełnione — fallback na `name`.

---

### Zmiana adresu email odbiorcy formularza kontaktowego

**Zmieniony plik:**
- `app/api/contact/route.ts`

**Co zostało zmienione:**

Adres docelowy wiadomości wysyłanych przez formularz kontaktowy zmieniony z `pavulon.cool@gmail.com` na `ask@neoneon.online`.

**Poprawka:** adres nadawcy (`from`) zmieniony z `onboarding@resend.dev` na `formularz@neoneon.online`. Resend pozwala wysyłać z adresu `onboarding@resend.dev` wyłącznie na email zarejestrowany na koncie — wysyłka na zewnętrzny adres wymagała użycia nadawcy z zweryfikowanej domeny.

---

### Naprawa TagBadge — błąd async Client Component

**Zmieniony plik:**
- `components/blog/TagBadge.tsx`

**Co zostało zmienione:**

`TagBadge` był asynchronicznym Server Componentem używającym `await getLocale()` z `next-intl/server`. Po tym jak `ArticleCard` ma dyrektywę `'use client'`, Next.js zgłaszał błąd: *async Client Component — only Server Components can be async*. Komponent zamieniony na Client Component: usunięty `async`/`await getLocale()`, dodana dyrektywa `'use client'`, locale pobierany przez hook `useLocale()` z `next-intl`.

---

### Naprawa zagnieżdżonych linków w ArticleCard

**Zmieniony plik:**
- `components/blog/ArticleCard.tsx`

**Co zostało zmienione:**

`ArticleCard` owijał cały artykuł w `<Link>`, a wewnątrz znajdowały się `<TagBadge>` renderujące kolejne `<Link>`. Skutkowało to błędem hydratacji: *In HTML, `<a>` cannot be a descendant of `<a>`*. Sekcja z tagami wyciągnięta poza główny `<Link>` w obu wariantach komponentu (`default` i `featured`).
