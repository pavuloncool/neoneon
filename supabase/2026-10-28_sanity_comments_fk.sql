-- ============================================================
-- MIGRACJA: artykuły przeniesione do Sanity (2026-10-28)
-- Uruchomić w Supabase → SQL Editor PRZED wdrożeniem gałęzi feat/sanity na produkcję.
--
-- comments.article_id wskazuje teraz na _id dokumentu w Sanity.
-- Zmigrowane artykuły zachowały swoje UUID, nowe artykuły ze Studio też dostają UUID,
-- więc typ kolumny zostaje bez zmian — usuwamy tylko klucz obcy do tabeli `articles`.
-- Bez tego dodanie komentarza pod nowym artykułem (utworzonym w Studio) kończy się błędem.
--
-- Tabele articles / tags / article_tags zostają (tylko do odczytu) do czasu akceptacji
-- migracji; usunięcie ich to osobny, późniejszy krok.
-- ============================================================

alter table comments drop constraint if exists comments_article_id_fkey;
