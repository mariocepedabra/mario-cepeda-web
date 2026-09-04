-- ============================================================================
--  0010_multipublicacion_p10.sql — Notas sindicadas desde Página 10
-- ----------------------------------------------------------------------------
--  Añade a `posts` el enlace con la entrada de origen en el WordPress de
--  Página 10 (plugin `p10-multipublicacion`), que publica aquí a través de
--  /api/ingesta-p10.
--
--    p10_post_id → ID de la entrada en Página 10. Es la llave que hace que,
--                  al editar la nota allí, se actualice ESTA fila en lugar de
--                  crear un duplicado.
--    p10_url     → permalink original. Alimenta la etiqueta canónica y el
--                  crédito «Publicado originalmente en Página 10».
--
--  No destructiva: las filas existentes quedan con NULL. No toca RLS (la
--  política de escritura de `posts` por is_admin ya cubre estas columnas).
--  Ejecutar DESPUÉS de 0001–0009.
-- ============================================================================

alter table public.posts
  add column if not exists p10_post_id bigint,
  add column if not exists p10_url text;

-- Dos notas distintas no pueden venir de la misma entrada de Página 10, pero
-- sí puede haber muchas columnas propias de Mario sin origen (NULL).
create unique index if not exists posts_p10_post_id_key
  on public.posts (p10_post_id)
  where p10_post_id is not null;
