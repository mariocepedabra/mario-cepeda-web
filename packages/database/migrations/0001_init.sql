-- ============================================================================
--  0001_init.sql — Esquema inicial
--  Sitio personal de Mario Cepeda
-- ----------------------------------------------------------------------------
--  Ejecutar en el SQL Editor de Supabase (o `supabase db push`).
--  Las políticas RLS se aplican en 0002_rls.sql.
-- ============================================================================

create extension if not exists "pgcrypto";

-- Trigger genérico para mantener updated_at -------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profile (una sola fila) -------------------------------------------------------
create table if not exists public.profile (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null default '',
  titular     text not null default '',
  bio         text not null default '',
  foto_url    text,
  redes       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_profile_updated
  before update on public.profile
  for each row execute function public.set_updated_at();

-- experiences (trayectoria) -----------------------------------------------------
create table if not exists public.experiences (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  organizacion  text,
  periodo       text,
  descripcion   text,
  orden         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_experiences_updated
  before update on public.experiences
  for each row execute function public.set_updated_at();

-- posts (notas / columnas) ------------------------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  slug        text not null unique,
  resumen     text,
  contenido   text,            -- HTML producido por el editor Tiptap
  portada_url text,
  publicado   boolean not null default false,
  fecha       date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_posts_publicado_fecha on public.posts (publicado, fecha desc);
create trigger trg_posts_updated
  before update on public.posts
  for each row execute function public.set_updated_at();

-- press (prensa / menciones) ----------------------------------------------------
create table if not exists public.press (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  medio       text,
  url         text,
  fecha       date,
  imagen_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_press_updated
  before update on public.press
  for each row execute function public.set_updated_at();

-- videos (multimedia) -----------------------------------------------------------
create table if not exists public.videos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  url_embed   text not null,
  plataforma  text not null default 'youtube'
              check (plataforma in ('youtube', 'vimeo', 'otro')),
  descripcion text,
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_videos_updated
  before update on public.videos
  for each row execute function public.set_updated_at();

-- links (enlaces / recursos) ----------------------------------------------------
create table if not exists public.links (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  url         text not null,
  categoria   text not null default 'recurso'
              check (categoria in ('proyecto', 'red_social', 'recurso')),
  icono       text,
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_links_updated
  before update on public.links
  for each row execute function public.set_updated_at();

-- awards (reconocimientos) ------------------------------------------------------
create table if not exists public.awards (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  entidad     text,
  anio        integer,
  descripcion text,
  orden       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_awards_updated
  before update on public.awards
  for each row execute function public.set_updated_at();

-- contact_messages (bandeja de contacto) ----------------------------------------
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  email       text not null,
  mensaje     text not null,
  leido       boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_messages_created on public.contact_messages (created_at desc);

-- media (gestor de medios sobre Supabase Storage) -------------------------------
create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  url         text not null,
  tipo        text not null default 'imagen'
              check (tipo in ('imagen', 'documento', 'otro')),
  created_at  timestamptz not null default now()
);

-- settings (clave/valor para SEO/OG) --------------------------------------------
create table if not exists public.settings (
  clave       text primary key,
  valor       text,
  updated_at  timestamptz not null default now()
);
create trigger trg_settings_updated
  before update on public.settings
  for each row execute function public.set_updated_at();
