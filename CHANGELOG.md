# Changelog

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
