-- ============================================================================
--  narino-titulos.sql — Renombra los perfiles «Ejemplo N» de la sección Nariño
-- ----------------------------------------------------------------------------
--  Cambia el título (y el slug de la URL) de los 6 perfiles que hoy se llaman
--  «Ejemplo 1»…«Ejemplo 6» por títulos acordes a cada imagen. CONSERVA la foto,
--  la historia, el lugar y el orden. Ejecutar en el SQL Editor de Supabase.
--  Re-ejecutable: si ya se renombraron, no vuelve a coincidir y no hace nada.
--
--  ¿Prefieres otros títulos? Puedes editarlos aquí antes de correr, o cambiarlos
--  luego desde el panel (Admin → Nariño → editar cada perfil).
-- ============================================================================

update public.narino_profiles set nombre = 'Alegría del Pacífico',          slug = 'alegria-del-pacifico'
  where lower(trim(nombre)) = 'ejemplo 1';

update public.narino_profiles set nombre = 'El león, arte urbano del sur',   slug = 'el-leon-arte-urbano-del-sur'
  where lower(trim(nombre)) = 'ejemplo 2';

update public.narino_profiles set nombre = 'La prensa que cuenta el sur',    slug = 'la-prensa-que-cuenta-el-sur'
  where lower(trim(nombre)) = 'ejemplo 3';

update public.narino_profiles set nombre = 'Faenas en el Pacífico',          slug = 'faenas-en-el-pacifico'
  where lower(trim(nombre)) = 'ejemplo 4';

update public.narino_profiles set nombre = 'La pesca que sostiene la costa', slug = 'la-pesca-que-sostiene-la-costa'
  where lower(trim(nombre)) = 'ejemplo 5';

update public.narino_profiles set nombre = 'Raíces de África en Nariño',     slug = 'raices-de-africa-en-narino'
  where lower(trim(nombre)) = 'ejemplo 6';
