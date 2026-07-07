-- ============================================================================
--  fix-autores-y-perfil.sql — Corrige firmas de las notas + lema del perfil
-- ----------------------------------------------------------------------------
--  Autosuficiente e idempotente. Ejecutar UNA vez en el SQL Editor de Supabase.
--  Corrige el caso en que el seed corrió ANTES de existir la columna `autor`
--  (entonces las firmas quedaron todas en «Mario Cepeda Bravo» por defecto).
-- ============================================================================

-- 1) Asegura la columna `autor` (por si no se corrió 0009_post_autor.sql).
alter table public.posts
  add column if not exists autor text not null default 'Mario Cepeda Bravo';

-- 2) Firmas que NO son de Mario, según Página 10.
--    Notas que hablan ACERCA de Mario (semblanza / entrevista / perfil):
update public.posts set autor = 'Lo que dicen de Mario' where slug in (
  'mario-cepeda-bravo-el-personaje-principal',
  'pupiales-debe-recuperar-sus-valores-historicos-mario-cepeda',
  'mario-cepeda-bravo-voz-firme-del-periodismo-regional'
);

--    Notas publicadas bajo la cuenta editorial «Página 10» (así aparecen allí):
update public.posts set autor = 'Página 10' where slug in (
  'empalme-con-las-regiones-la-propuesta-para-revisar-promesas-obras-y-deudas-del-gobierno-petro',
  'la-violencia-nunca-se-fue-de-narino',
  'sin-agua-no-hay-votos',
  'la-ciencia-no-es-un-asunto-de-politicos',
  'los-idiotas-utiles-del-neoliberalismo-la-descentralizacion-20'
);

-- 3) Todas las demás notas son columnas de Mario → «Mario Cepeda Bravo».
update public.posts set autor = 'Mario Cepeda Bravo'
 where slug not in (
   'mario-cepeda-bravo-el-personaje-principal',
   'pupiales-debe-recuperar-sus-valores-historicos-mario-cepeda',
   'mario-cepeda-bravo-voz-firme-del-periodismo-regional',
   'empalme-con-las-regiones-la-propuesta-para-revisar-promesas-obras-y-deudas-del-gobierno-petro',
   'la-violencia-nunca-se-fue-de-narino',
   'sin-agua-no-hay-votos',
   'la-ciencia-no-es-un-asunto-de-politicos',
   'los-idiotas-utiles-del-neoliberalismo-la-descentralizacion-20'
 );

-- 4) Perfil profesional: el lema debe decir «Emprendedor, Docente Universitario
--    y Consultor». Si ya hay una fila guardada con el texto viejo, la corrige;
--    si no existe, la crea.
insert into public.settings (clave, valor)
values ('perfil.lema', 'Emprendedor, Docente Universitario y Consultor')
on conflict (clave) do update set valor = excluded.valor;
