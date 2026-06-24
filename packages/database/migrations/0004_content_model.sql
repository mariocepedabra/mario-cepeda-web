-- ============================================================================
--  0004_content_model.sql — Modelo de contenido del rediseño (Gates Notes)
-- ----------------------------------------------------------------------------
--  Añade el contenido editorial de las 4 secciones:
--   * posts  +columnas  bajada (dek) y categoria (tema)        → Pensamiento
--   * projects (proyectos / hitos)                              → Trabajo
--   * books (libros recomendados)                               → Libros
--   * narino_profiles (perfiles de gente/lugares)               → Nariño
--
--  Ejecutar DESPUÉS de 0001_init.sql y 0002_rls.sql.
--  RLS: lectura pública; escritura para usuarios autenticados (el endurecimiento
--  a un único admin se aplica en la fase de Auth + Panel).
-- ============================================================================

-- posts: bajada (subtítulo/dek) + categoria (tema) ------------------------------
alter table public.posts add column if not exists bajada text;
alter table public.posts add column if not exists categoria text;
create index if not exists idx_posts_categoria on public.posts (categoria);

-- projects (sección Trabajo) ----------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  subtitulo   text,
  descripcion text,
  imagen_url  text,
  url         text,
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_projects_updated
  before update on public.projects
  for each row execute function public.set_updated_at();

-- books (sección Libros) --------------------------------------------------------
create table if not exists public.books (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  autor       text not null default '',
  portada_url text,
  valoracion  integer check (valoracion between 1 and 5),
  resena      text,
  lista       text not null default 'temporada'
              check (lista in ('marcaron', 'temporada')),
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_books_updated
  before update on public.books
  for each row execute function public.set_updated_at();

-- narino_profiles (sección Nariño) ----------------------------------------------
create table if not exists public.narino_profiles (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  slug        text not null unique,
  lugar       text,
  foto_url    text,
  historia    text,                 -- HTML producido por el editor
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_narino_profiles_updated
  before update on public.narino_profiles
  for each row execute function public.set_updated_at();

-- RLS: activar + políticas ------------------------------------------------------
alter table public.projects         enable row level security;
alter table public.books            enable row level security;
alter table public.narino_profiles  enable row level security;

create policy "projects_public_read"  on public.projects        for select using (true);
create policy "books_public_read"      on public.books           for select using (true);
create policy "narino_public_read"     on public.narino_profiles for select using (true);

create policy "projects_auth_write"
  on public.projects for all to authenticated using (true) with check (true);
create policy "books_auth_write"
  on public.books for all to authenticated using (true) with check (true);
create policy "narino_auth_write"
  on public.narino_profiles for all to authenticated using (true) with check (true);
