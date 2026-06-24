-- ============================================================================
--  0005_admin.sql — Admin único + endurecimiento de RLS
-- ----------------------------------------------------------------------------
--  Restringe la ESCRITURA (y la lectura de contenido privado) a un único
--  administrador autorizado. Defensa en profundidad junto al gate de la app
--  (ADMIN_EMAILS en middleware + Server Actions).
--
--  Mario añade su correo a `public.admins`:
--      insert into public.admins (email) values ('mario@correo.real');
--
--  Mientras la tabla `admins` esté VACÍA, se permite a cualquier usuario
--  autenticado (modo de puesta en marcha). En cuanto se añade un correo, solo
--  ese correo puede escribir.  Ejecutar DESPUÉS de 0001–0004.
-- ============================================================================

create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- Sin políticas públicas: la tabla solo se consulta vía is_admin() (definer)
-- o con la clave service_role.

-- ¿El usuario actual es administrador autorizado? --------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when not exists (select 1 from public.admins) then true
    else exists (
      select 1 from public.admins a
      where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  end;
$$;

-- ----------------------------------------------------------------------------
--  Reemplaza las políticas de ESCRITURA (antes: cualquier autenticado) por
--  políticas basadas en is_admin().
-- ----------------------------------------------------------------------------
do $$
declare
  t text;
  content_tables text[] := array[
    'profile', 'experiences', 'posts', 'press', 'videos', 'links', 'awards',
    'media', 'settings', 'projects', 'books', 'narino_profiles'
  ];
begin
  foreach t in array content_tables loop
    execute format('drop policy if exists %I on public.%I', t || '_auth_write', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_write', t
    );
  end loop;
end $$;

-- posts: la lectura de borradores (no publicados) queda solo para el admin -------
drop policy if exists "posts_auth_read_all" on public.posts;
create policy "posts_admin_read_all"
  on public.posts for select
  to authenticated
  using (public.is_admin());

-- contact_messages: leer / actualizar / borrar solo el admin ---------------------
drop policy if exists "messages_auth_select" on public.contact_messages;
drop policy if exists "messages_auth_update" on public.contact_messages;
drop policy if exists "messages_auth_delete" on public.contact_messages;

create policy "messages_admin_select"
  on public.contact_messages for select to authenticated using (public.is_admin());
create policy "messages_admin_update"
  on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "messages_admin_delete"
  on public.contact_messages for delete to authenticated using (public.is_admin());

-- Storage: subir / modificar / borrar en el bucket media solo el admin -----------
drop policy if exists "media_objects_auth_insert" on storage.objects;
drop policy if exists "media_objects_auth_update" on storage.objects;
drop policy if exists "media_objects_auth_delete" on storage.objects;

create policy "media_objects_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "media_objects_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
create policy "media_objects_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
