-- ============================================================================
--  0002_rls.sql — Row Level Security (RLS) y políticas
-- ----------------------------------------------------------------------------
--  Reglas generales:
--   * Lectura PÚBLICA del contenido del sitio (incl. solo notas publicadas).
--   * Escritura SOLO para usuarios autenticados (el admin de Supabase Auth).
--   * contact_messages: cualquiera puede INSERTAR (formulario público);
--     solo el admin autenticado puede leer / actualizar / borrar.
-- ============================================================================

-- Activar RLS en todas las tablas ----------------------------------------------
alter table public.profile           enable row level security;
alter table public.experiences       enable row level security;
alter table public.posts             enable row level security;
alter table public.press             enable row level security;
alter table public.videos            enable row level security;
alter table public.links             enable row level security;
alter table public.awards            enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.media             enable row level security;
alter table public.settings          enable row level security;

-- --- Tablas de lectura totalmente pública -------------------------------------
-- profile, experiences, press, videos, links, awards, settings, media

create policy "profile_public_read"      on public.profile          for select using (true);
create policy "experiences_public_read"  on public.experiences      for select using (true);
create policy "press_public_read"        on public.press            for select using (true);
create policy "videos_public_read"       on public.videos           for select using (true);
create policy "links_public_read"        on public.links            for select using (true);
create policy "awards_public_read"       on public.awards           for select using (true);
create policy "settings_public_read"     on public.settings         for select using (true);
create policy "media_public_read"        on public.media            for select using (true);

-- --- posts: público solo ve publicadas; admin ve todo -------------------------
create policy "posts_public_read"
  on public.posts for select
  to anon
  using (publicado = true);

create policy "posts_auth_read_all"
  on public.posts for select
  to authenticated
  using (true);

-- --- contact_messages: insert público; resto solo admin -----------------------
create policy "messages_public_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "messages_auth_select"
  on public.contact_messages for select
  to authenticated
  using (true);

create policy "messages_auth_update"
  on public.contact_messages for update
  to authenticated
  using (true)
  with check (true);

create policy "messages_auth_delete"
  on public.contact_messages for delete
  to authenticated
  using (true);

-- --- Escritura para usuarios autenticados (todas las tablas de contenido) -----
-- `for all` cubre insert/update/delete.

create policy "profile_auth_write"      on public.profile      for all to authenticated using (true) with check (true);
create policy "experiences_auth_write"  on public.experiences  for all to authenticated using (true) with check (true);
create policy "posts_auth_write"        on public.posts        for all to authenticated using (true) with check (true);
create policy "press_auth_write"        on public.press        for all to authenticated using (true) with check (true);
create policy "videos_auth_write"       on public.videos       for all to authenticated using (true) with check (true);
create policy "links_auth_write"        on public.links        for all to authenticated using (true) with check (true);
create policy "awards_auth_write"       on public.awards       for all to authenticated using (true) with check (true);
create policy "media_auth_write"        on public.media        for all to authenticated using (true) with check (true);
create policy "settings_auth_write"     on public.settings     for all to authenticated using (true) with check (true);
