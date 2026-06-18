-- ============================================================================
--  0003_storage.sql — Bucket de Storage para el gestor de medios
-- ----------------------------------------------------------------------------
--  Crea un bucket público `media`. Lectura pública (URLs servibles desde el
--  sitio); subida/borrado solo para usuarios autenticados (admin).
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Lectura pública de los objetos del bucket media
create policy "media_objects_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Subir / actualizar / borrar: solo autenticados
create policy "media_objects_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "media_objects_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

create policy "media_objects_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
