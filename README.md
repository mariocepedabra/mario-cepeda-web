# Mario Cepeda — Sitio personal (4 propuestas de diseño)

Monorepo con **4 propuestas de sitio web personal** para **Mario Cepeda** (director de medios,
abogado y periodista; Página 10 y Colombia Positiva). Las 4 comparten **la misma arquitectura,
el mismo esquema de base de datos y las mismas funcionalidades**; solo cambia el **diseño visual**.
Cada una se despliega de forma **independiente en Vercel**.

> Esta entrega es **solo estructura y arquitectura**. El contenido es de **ejemplo** (lorem + imágenes
> placeholder), claramente marcado. El contenido real se cargará después desde el panel de administración.

## Las 4 propuestas

| Carpeta | Estética | Puerto local |
| --- | --- | --- |
| [`apps/propuesta-1-editorial`](apps/propuesta-1-editorial) | Editorial premium (revista, serif Fraunces) | 3001 |
| [`apps/propuesta-2-minimal`](apps/propuesta-2-minimal) | Minimalista suizo (blanco/negro + acento) | 3002 |
| [`apps/propuesta-3-cinematic`](apps/propuesta-3-cinematic) | Cinematográfico inmersivo (dark, glass) | 3003 |
| [`apps/propuesta-4-organic`](apps/propuesta-4-organic) | Cálido / orgánico (blobs, tipografía amable) | 3004 |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (re-tematizado) ·
Framer Motion · React Hook Form + Zod · Supabase (Postgres + Auth + Storage) · Tiptap · pnpm + Turborepo.

## Estructura del monorepo

```
/
├─ apps/
│  ├─ propuesta-1-editorial/   # Next.js app (diseño editorial)
│  ├─ propuesta-2-minimal/     # Next.js app (diseño minimalista)
│  ├─ propuesta-3-cinematic/   # Next.js app (diseño cinematográfico)
│  └─ propuesta-4-organic/     # Next.js app (diseño orgánico)
├─ packages/
│  ├─ database/   # cliente Supabase, tipos, queries, migraciones SQL, seed, datos de ejemplo
│  ├─ core/       # esquemas Zod, utilidades, server actions, auth y EL PANEL ADMIN compartido
│  └─ config/     # presets de tsconfig y eslint
├─ turbo.json · pnpm-workspace.yaml · package.json · .env.example
```

La lógica de datos y **todo el panel admin** se escriben **una sola vez** en `packages/*`. Cada app solo
aporta su sistema de diseño (tema Tailwind, fuentes y componentes de sección).

## Funcionalidades (idénticas en las 4)

**Sitio público:** Hero, Sobre mí, Trayectoria, Notas/Columnas (listado + detalle), Prensa, Multimedia
(YouTube/Vimeo), Enlaces, Reconocimientos y Contacto (formulario que guarda en Supabase). Navbar
responsive, footer, scroll suave y estados de carga / vacío / error.

**Panel admin (`/admin`):** autenticación con Supabase Auth, rutas protegidas por middleware, dashboard
con métricas, CRUD completo (perfil, trayectoria, notas con editor Tiptap, prensa, videos, enlaces,
reconocimientos), bandeja de mensajes, gestión de medios (Supabase Storage) y ajustes SEO/Open Graph.

## Requisitos

- **Node.js ≥ 20** y **pnpm 9** (`npm install -g pnpm` o `corepack enable pnpm`).

## Puesta en marcha local

```bash
pnpm install          # instala todo el monorepo

# Arrancar una propuesta concreta:
pnpm --filter propuesta-1-editorial dev   # http://localhost:3001
pnpm --filter propuesta-2-minimal   dev   # http://localhost:3002
pnpm --filter propuesta-3-cinematic dev   # http://localhost:3003
pnpm --filter propuesta-4-organic   dev   # http://localhost:3004

# O todo a la vez con Turborepo:
pnpm dev
```

> **Sin Supabase configurado**, las webs públicas funcionan con **datos de ejemplo** embebidos
> (son desplegables tal cual). El panel admin requiere Supabase.

Scripts útiles desde la raíz: `pnpm build`, `pnpm lint`, `pnpm typecheck`.

## Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta en orden los archivos de `packages/database/migrations`:
   `0001_init.sql` → `0002_rls.sql` → `0003_storage.sql`.
3. Carga datos de ejemplo: pega `packages/database/seed/seed.sql` en el SQL Editor, **o** ejecuta
   `pnpm --filter @mario/database seed` (requiere `SUPABASE_SERVICE_ROLE_KEY`).
4. Crea el usuario admin en **Authentication → Users → Add user** (email + contraseña). Con él inicias
   sesión en `/admin`.

### Variables de entorno

Copia `.env.example` a `.env.local` **dentro de cada app** (`apps/propuesta-x/.env.local`) o configúralas
en Vercel por proyecto:

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service_role (solo servidor / seed) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (SEO, sitemap, OG) |

## Despliegue en Vercel (cada propuesta por separado)

Cada app se importa como un **proyecto independiente** apuntando al mismo repositorio:

1. **New Project** → importa este repositorio de Git.
2. **Root Directory** → selecciona la carpeta de la propuesta, p. ej. `apps/propuesta-1-editorial`.
   Vercel detecta el monorepo pnpm + Turborepo automáticamente.
3. **Environment Variables** → añade las 4 variables de la tabla anterior.
4. **Deploy.** Repite para cada propuesta cambiando solo el Root Directory:
   - `apps/propuesta-1-editorial`
   - `apps/propuesta-2-minimal`
   - `apps/propuesta-3-cinematic`
   - `apps/propuesta-4-organic`

> Build Command e Install Command por defecto de Vercel funcionan (`next build` con detección de pnpm
> workspaces). No hace falta configuración extra.

## Estándares

TypeScript strict (sin `any` en el código de la app), ESLint + Prettier, responsive *mobile-first*,
accesibilidad WCAG AA (contraste, teclado, textos alternativos), SEO por página (metadata, sitemap,
robots, Open Graph dinámico) y estados de carga / vacío / error en cada vista.
