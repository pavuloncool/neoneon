-- ============================================================
-- SCHEMA: Blog (Content Writing + UX Strategies)
-- Wkleić w Supabase → SQL Editor → Run
-- ============================================================

-- ARTYKUŁY
create table articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  excerpt     text,
  content     jsonb,                          -- bloki Tiptap
  category    text not null check (category in ('content-writing', 'ux-strategies')),
  cover_image_url text,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- TAGI
create table tags (
  id    uuid primary key default gen_random_uuid(),
  name  text unique not null,
  slug  text unique not null
);

-- RELACJA ARTYKUŁ ↔ TAG
create table article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id     uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- KOMENTARZE
create table comments (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid references articles(id) on delete cascade,
  author_name text not null,
  author_email text not null,
  body        text not null,
  approved    boolean default false,
  created_at  timestamptz default now()
);

-- KONTAKTY (formularz)
create table contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- FULL-TEXT SEARCH na artykułach (język: angielski)
-- ============================================================
alter table articles
  add column if not exists fts tsvector
  generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, ''))
  ) stored;

create index articles_fts_idx on articles using gin(fts);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
alter table articles  enable row level security;
alter table tags       enable row level security;
alter table article_tags enable row level security;
alter table comments  enable row level security;
alter table contacts  enable row level security;

-- Publiczny odczyt opublikowanych artykułów
create policy "Public read published articles"
  on articles for select
  using (status = 'published');

-- Publiczny odczyt tagów
create policy "Public read tags"
  on tags for select using (true);

create policy "Public read article_tags"
  on article_tags for select using (true);

-- Publiczny odczyt zatwierdzonych komentarzy
create policy "Public read approved comments"
  on comments for select
  using (approved = true);

-- Publiczne dodawanie komentarzy (moderowane)
create policy "Public insert comments"
  on comments for insert
  with check (true);

-- Publiczne dodawanie kontaktów
create policy "Public insert contacts"
  on contacts for insert
  with check (true);

-- Admin: pełny dostęp (authenticated)
create policy "Admin full access articles"
  on articles for all
  using (auth.role() = 'authenticated');

create policy "Admin full access comments"
  on comments for all
  using (auth.role() = 'authenticated');

create policy "Admin full access contacts"
  on contacts for select
  using (auth.role() = 'authenticated');

create policy "Admin full access tags"
  on tags for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at
  before update on articles
  for each row execute function set_updated_at();
