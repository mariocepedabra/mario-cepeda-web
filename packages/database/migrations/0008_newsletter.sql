-- ============================================================================
--  0008_newsletter.sql — Boletín (suscriptores + envíos con Resend)
-- ----------------------------------------------------------------------------
--  Añade el boletín funcional:
--   * public.subscribers        — quien se suscribe desde la web.
--   * public.subscriber_events  — notas/secciones que visita cada suscriptor.
--   * public.app_secrets        — secretos del panel (la API key de Resend),
--                                 con RLS de SOLO admin (NO lectura pública,
--                                 a diferencia de `settings`).
--
--  RPC con SECURITY DEFINER para que la web pública (anónima) pueda suscribir,
--  registrar visitas y darse de baja SIN exponer la tabla de suscriptores.
--
--  No destructiva. Ejecutar DESPUÉS de 0001–0007.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
--  subscribers
-- ---------------------------------------------------------------------------
create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  nombre      text,
  -- activo: recibe correos · baneado: bloqueado por el admin · baja: se dio de baja
  estado      text not null default 'activo'
              check (estado in ('activo', 'baneado', 'baja')),
  -- token opaco para baja y para asociar visitas sin exponer el id
  token       uuid not null default gen_random_uuid() unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- Unicidad por correo (insensible a mayúsculas)
create unique index if not exists subscribers_email_unique on public.subscribers (lower(email));
create index if not exists idx_subscribers_created on public.subscribers (created_at desc);
create trigger trg_subscribers_updated
  before update on public.subscribers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
--  subscriber_events — visitas (notas / secciones) de cada suscriptor
-- ---------------------------------------------------------------------------
create table if not exists public.subscriber_events (
  id            uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  path          text not null,
  titulo        text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_subscriber_events_sub on public.subscriber_events (subscriber_id, created_at desc);

-- ---------------------------------------------------------------------------
--  app_secrets — secretos editables desde el panel (p. ej. RESEND API key)
--  RLS: SOLO el admin. Nunca lectura pública (a diferencia de `settings`).
-- ---------------------------------------------------------------------------
create table if not exists public.app_secrets (
  clave       text primary key,
  valor       text,
  updated_at  timestamptz not null default now()
);
create trigger trg_app_secrets_updated
  before update on public.app_secrets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
--  RLS
-- ---------------------------------------------------------------------------
alter table public.subscribers       enable row level security;
alter table public.subscriber_events enable row level security;
alter table public.app_secrets       enable row level security;

-- subscribers: inserción pública (alta como respaldo del RPC), gestión solo admin.
drop policy if exists "subscribers_public_insert" on public.subscribers;
create policy "subscribers_public_insert"
  on public.subscribers for insert to anon, authenticated
  with check (estado = 'activo');

drop policy if exists "subscribers_admin_select" on public.subscribers;
create policy "subscribers_admin_select"
  on public.subscribers for select to authenticated using (public.is_admin());

drop policy if exists "subscribers_admin_update" on public.subscribers;
create policy "subscribers_admin_update"
  on public.subscribers for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subscribers_admin_delete" on public.subscribers;
create policy "subscribers_admin_delete"
  on public.subscribers for delete to authenticated using (public.is_admin());

-- subscriber_events: lectura solo admin. La inserción va por el RPC (definer).
drop policy if exists "subscriber_events_admin_select" on public.subscriber_events;
create policy "subscriber_events_admin_select"
  on public.subscriber_events for select to authenticated using (public.is_admin());

-- app_secrets: todo solo admin. Sin política para anon -> denegado.
drop policy if exists "app_secrets_admin_all" on public.app_secrets;
create policy "app_secrets_admin_all"
  on public.app_secrets for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
--  RPC (SECURITY DEFINER): operaciones públicas seguras sobre subscribers
-- ---------------------------------------------------------------------------

-- Alta de suscriptor: inserta (o actualiza el nombre) y devuelve el token.
-- Así la web anónima obtiene el token sin poder LEER la tabla de suscriptores.
create or replace function public.newsletter_subscribe(p_email text, p_nombre text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token uuid;
begin
  insert into public.subscribers (email, nombre)
  values (lower(trim(p_email)), nullif(trim(coalesce(p_nombre, '')), ''))
  on conflict (lower(email)) do update set
    nombre = coalesce(nullif(trim(coalesce(excluded.nombre, '')), ''), subscribers.nombre),
    -- reactiva a quien se había dado de baja, pero respeta a los baneados
    estado = case when subscribers.estado = 'baneado' then 'baneado' else 'activo' end,
    updated_at = now()
  returning token into v_token;
  return v_token;
end;
$$;

-- Registra una visita (nota/sección) para el suscriptor dueño del token.
create or replace function public.record_subscriber_visit(p_token uuid, p_path text, p_title text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from public.subscribers
  where token = p_token and estado = 'activo';
  if v_id is null then
    return;
  end if;
  insert into public.subscriber_events (subscriber_id, path, titulo)
  values (v_id, left(coalesce(p_path, ''), 500), nullif(left(coalesce(p_title, ''), 300), ''));
end;
$$;

-- Baja voluntaria desde el enlace del correo.
create or replace function public.newsletter_unsubscribe(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  update public.subscribers
    set estado = 'baja', updated_at = now()
  where token = p_token and estado <> 'baneado'
  returning id into v_id;
  return v_id is not null;
end;
$$;

-- Permisos de ejecución para la web pública (anónima) y autenticados.
grant execute on function public.newsletter_subscribe(text, text)            to anon, authenticated;
grant execute on function public.record_subscriber_visit(uuid, text, text)   to anon, authenticated;
grant execute on function public.newsletter_unsubscribe(uuid)                to anon, authenticated;
