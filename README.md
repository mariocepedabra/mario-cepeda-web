# Mario Cepeda — Sitio personal

Web personal de **Mario Cepeda** (director de medios, abogado y periodista; proyectos Página 10 y
Colombia Positiva, Nariño, Colombia), con **lenguaje de diseño editorial estilo _Gates Notes_**:
papel cálido, fotografía grande, titulares serif y un panel de administración privado para que
Mario edite todo el contenido.

> El contenido es de **ejemplo** (marcado como `[EJEMPLO]`, con imágenes _placeholder_). La web
> pública funciona **sin** base de datos usando esos datos; al conectar Supabase y cargar contenido
> real desde el panel, los ejemplos dejan de mostrarse.

## Secciones del sitio

- **Inicio** — hero inmersivo, historias destacadas, accesos a las 4 secciones, «lo último»,
  multimedia y boletín.
- **Pensamiento** — ensayos y columnas (listado con filtro por tema + página de artículo).
- **Trabajo** — quién es Mario a través de lo que hace (proyectos en zig-zag, trayectoria, contacto).
- **Libros** — lecturas recomendadas y reseñadas.
- **Nariño** — gente, lugares y tradiciones de su tierra (perfiles con página de detalle).

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion ·
React Hook Form + Zod · Supabase (Postgres + Auth + Storage) · Tiptap · pnpm + Turborepo.

## Estructura del monorepo

```
/
├─ apps/
│  └─ propuesta-1-editorial/   # La web (Next.js). Aporta diseño + páginas; reexporta el admin.
├─ packages/
│  ├─ database/   # cliente Supabase, tipos, queries (con fallback a ejemplo), migraciones SQL, seed
│  ├─ core/       # esquemas Zod, utilidades, server actions, auth y EL PANEL ADMIN compartido
│  └─ config/     # presets de tsconfig y eslint
├─ turbo.json · pnpm-workspace.yaml · package.json · .env.example
```

La capa de datos y **todo el panel admin** viven en `packages/*`. La app aporta el diseño (tema
Tailwind, fuentes) y las páginas públicas. Las rutas públicas están en el grupo `app/(site)/` (con
header + footer); el panel `app/admin/` queda fuera de esa envoltura.

## Requisitos

- **Node.js ≥ 20** y **pnpm 9** (`npm install -g pnpm` o `corepack enable pnpm`).

## Puesta en marcha local

```bash
pnpm install
pnpm --filter propuesta-1-editorial dev   # http://localhost:3001
# o, con Turborepo:  pnpm dev
```

Verificación: `pnpm build` · `pnpm lint` · `pnpm typecheck`.

> **Sin Supabase**, la web pública funciona con datos de ejemplo embebidos. El panel se abre en
> «modo demostración» (muestra la interfaz, pero guardar está desactivado).

## Conectar Supabase (para el panel y el contenido real)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta en orden los archivos de `packages/database/migrations`:
   `0001_init.sql` → `0002_rls.sql` → `0003_storage.sql` → `0004_content_model.sql` → `0005_admin.sql`.
3. (Opcional) Carga datos de ejemplo: pega `packages/database/seed/seed.sql` en el SQL Editor, **o**
   ejecuta `pnpm --filter @mario/database seed` (requiere `SUPABASE_SERVICE_ROLE_KEY` en el entorno).
4. Crea el usuario admin de Mario en **Authentication → Users → Add user** (email + contraseña).
   La contraseña la define Mario; **no** se guarda en el código.
5. **Restringe el acceso a Mario** (admin único), de dos formas que se complementan:
   - SQL Editor: `insert into public.admins (email) values ('correo-de-mario');`
   - Variable de entorno: `ADMIN_EMAILS="correo-de-mario"`.
6. Recomendado: en **Authentication → Providers → Email**, desactiva el registro público para que
   nadie más pueda crear cuenta.

### Variables de entorno

Copia `.env.example` a `.env.local` dentro de `apps/propuesta-1-editorial/` o configúralas en Vercel:

| Variable | Descripción |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service_role — **solo servidor** (seed). Nunca en el cliente ni en git |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (SEO, sitemap, Open Graph) |
| `ADMIN_EMAILS` | Correos autorizados al panel, separados por comas (admin único = Mario) |

## El panel de administración

- **Acceso:** enlace discreto **«Panel»** al final del footer → `/panel` → login (correo + contraseña).
- **Edición de textos:** sección **Textos** para editar los textos editoriales de la web (hero,
  descripciones de sección, boletín). Si un campo se deja vacío, se usa el texto por defecto.
- **Colecciones:** Pensamiento (notas), Proyectos, Trayectoria, Libros, Nariño, Videos — crear,
  editar, borrar, ordenar y publicar/despublicar, con editor de texto enriquecido y subida de
  imágenes (Supabase Storage).
- **Otros:** Perfil/biografía, Bandeja de mensajes (formulario de contacto), Medios y SEO/Open Graph.
- Los cambios guardados se reflejan en la web pública al instante (revalidación de caché).

**Seguridad:** RLS activado (lectura pública del contenido publicado; escritura solo para el admin
autorizado vía `is_admin()`), allowlist `ADMIN_EMAILS` en el middleware y en las Server Actions, y
ninguna credencial en el repositorio (Supabase gestiona el hash de la contraseña).

## Despliegue en Vercel

1. **New Project** → importa este repositorio.
2. **Root Directory** → `apps/propuesta-1-editorial` (Vercel detecta pnpm + Turborepo solo).
3. **Environment Variables** → añade las variables de la tabla anterior.
4. **Deploy.** Build e Install por defecto de Vercel funcionan; no hace falta configuración extra.

## Estándares

TypeScript strict, ESLint + Prettier, responsive _mobile-first_, accesibilidad (contraste, foco
visible, navegación por teclado con enlace «saltar al contenido», `alt` en imágenes,
`prefers-reduced-motion`), SEO por página (metadata, sitemap, robots, Open Graph) y estados de
carga / vacío / error.

---

🤖 Rediseño asistido con [Claude Code](https://claude.com/claude-code).
