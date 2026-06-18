# @mario/database

Capa de datos compartida: cliente Supabase, tipos, consultas, migraciones SQL y seed.
La consumen las 4 apps (`apps/*`) y el panel admin de `@mario/core`.

## Estructura

```
src/
  types.ts        # tipos de fila + tipo Database (supabase-js)
  env.ts          # isSupabaseConfigured + lectura de variables
  client.ts       # cliente para navegador  (@mario/database/client)
  server.ts       # cliente para servidor   (@mario/database/server)
  admin.ts        # cliente service_role    (@mario/database/admin) — solo scripts
  queries.ts      # lecturas con fallback    (@mario/database/queries)
  placeholder.ts  # DATOS DE EJEMPLO embebidos
migrations/
  0001_init.sql   # esquema
  0002_rls.sql    # RLS + políticas
  0003_storage.sql# bucket de Storage
seed/seed.sql     # datos de ejemplo (SQL)
scripts/seed.ts   # datos de ejemplo (programático, service_role)
```

## Degradación elegante

Si **no** hay variables de Supabase, `isSupabaseConfigured` es `false` y las consultas
de `queries.ts` devuelven los datos de `placeholder.ts`. Las webs públicas se ven
completas y son desplegables sin backend. El panel admin sí requiere Supabase.

## Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, ejecuta en orden:
   `migrations/0001_init.sql` → `0002_rls.sql` → `0003_storage.sql`.
3. Carga datos de ejemplo: pega `seed/seed.sql` en el SQL Editor **o** corre el script:

   ```bash
   # PowerShell (Windows)
   $env:NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
   $env:SUPABASE_SERVICE_ROLE_KEY="<service_role>"
   pnpm --filter @mario/database seed
   ```

4. Crea el usuario admin en **Authentication → Users → Add user** (email + contraseña).
   Ese usuario es quien inicia sesión en `/admin`.

## Variables de entorno

Ver `.env.example` en la raíz del monorepo.
