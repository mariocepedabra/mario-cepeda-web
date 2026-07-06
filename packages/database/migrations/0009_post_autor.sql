-- ============================================================================
--  0009_post_autor.sql — Autor / firma de cada nota (seccion Pensamiento)
-- ----------------------------------------------------------------------------
--  Anade a `posts` una columna de texto `autor` con la firma de la nota. Por
--  defecto, «Mario Cepeda Bravo». Los articulos que hablan ACERCA de Mario (no
--  escritos por el) deben llevar «Lo que dicen de Mario»; las notas publicadas
--  bajo la cuenta editorial de Pagina 10 llevan «Pagina 10».
--
--  No destructiva: las filas existentes quedan con el valor por defecto. La
--  politica de escritura de `posts` (is_admin) ya cubre esta columna; no toca
--  RLS. Ejecutar DESPUES de 0001–0008.
-- ============================================================================

alter table public.posts
  add column if not exists autor text not null default 'Mario Cepeda Bravo';
