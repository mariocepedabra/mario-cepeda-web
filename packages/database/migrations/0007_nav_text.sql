-- ============================================================================
--  0007_nav_text.sql — Textos editables del panel desplegable por seccion
-- ----------------------------------------------------------------------------
--  Añade a `profile` un JSONB `nav_text` con el titulo y la descripcion que se
--  muestran (sobre la media) al pasar el cursor por cada seccion del menu.
--  Forma esperada:
--    { "pensamiento": { "titulo": "...", "texto": "..." }, ... }
--  Claves: pensamiento / trabajo / libros / narino. Si un campo va vacio, la
--  web usa el texto por defecto de la seccion.
--
--  No destructiva: las filas existentes quedan con '{}'. La politica de
--  escritura de `profile` (is_admin) ya cubre esta columna; no toca RLS.
--  Ejecutar DESPUES de 0001–0006.
-- ============================================================================

alter table public.profile
  add column if not exists nav_text jsonb not null default '{}'::jsonb;
