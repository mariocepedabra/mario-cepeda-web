-- ============================================================================
--  0006_nav_media.sql — Media por sección del menú (estilo Gates Notes)
-- ----------------------------------------------------------------------------
--  Añade a `profile` un JSONB `nav_media` con la imagen o video que se muestra
--  al pasar el cursor sobre cada sección del menú superior. Claves esperadas:
--  pensamiento / trabajo / libros / narino → URL de medio (admite el marcador
--  «#loop» igual que `foto_url`).
--
--  No destructiva: las filas existentes quedan con '{}'. La política de
--  escritura de `profile` (is_admin) ya cubre esta columna; no toca RLS.
--  Ejecutar DESPUÉS de 0001–0005.
-- ============================================================================

alter table public.profile
  add column if not exists nav_media jsonb not null default '{}'::jsonb;
