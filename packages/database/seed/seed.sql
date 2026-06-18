-- ============================================================================
--  seed.sql — DATOS DE EJEMPLO (placeholder)
-- ----------------------------------------------------------------------------
--  ⚠️  TODO ESTE CONTENIDO ES FICTICIO Y ESTÁ MARCADO COMO «(EJEMPLO)».
--      No son datos reales de Mario Cepeda. Sirve para ver la estructura
--      completa del sitio y del panel admin.
--
--  Ejecutar DESPUÉS de 0001_init.sql, 0002_rls.sql y 0003_storage.sql.
--  Idempotente: limpia las tablas de contenido antes de insertar.
-- ============================================================================

truncate table public.profile, public.experiences, public.posts, public.press,
  public.videos, public.links, public.awards, public.media, public.settings
  restart identity cascade;

-- profile -----------------------------------------------------------------------
insert into public.profile (nombre, titular, bio, foto_url, redes) values (
  'Mario Cepeda',
  'Director de medios · Abogado · Periodista',
  '[CONTENIDO DE EJEMPLO] Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
    || 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'https://picsum.photos/seed/mario-retrato/900/1100',
  '{"twitter":"https://twitter.com/ejemplo","facebook":"https://facebook.com/ejemplo","instagram":"https://instagram.com/ejemplo","linkedin":"https://linkedin.com/in/ejemplo","youtube":"https://youtube.com/@ejemplo","website":"https://pagina10.com"}'::jsonb
);

-- experiences -------------------------------------------------------------------
insert into public.experiences (titulo, organizacion, periodo, descripcion, orden) values
  ('Director General', 'Página 10 (EJEMPLO)', '2018 — Presente', '[EJEMPLO] Lorem ipsum dolor sit amet.', 1),
  ('Fundador y Director', 'Colombia Positiva (EJEMPLO)', '2020 — Presente', '[EJEMPLO] Lorem ipsum dolor sit amet.', 2),
  ('Abogado litigante', 'Ejercicio independiente (EJEMPLO)', '2012 — 2018', '[EJEMPLO] Lorem ipsum dolor sit amet.', 3),
  ('Columnista invitado', 'Medios regionales (EJEMPLO)', '2010 — Presente', '[EJEMPLO] Lorem ipsum dolor sit amet.', 4);

-- posts -------------------------------------------------------------------------
insert into public.posts (titulo, slug, resumen, contenido, portada_url, publicado, fecha) values
  ('Título de columna de ejemplo n.º 1', 'columna-de-ejemplo-1', '[EJEMPLO] Resumen lorem ipsum dolor sit amet…',
   '<p><strong>[CONTENIDO DE EJEMPLO]</strong> Lorem ipsum dolor sit amet.</p><p>Consectetur adipiscing elit.</p>',
   'https://picsum.photos/seed/columna-1/1200/800', true, '2025-01-15'),
  ('Título de columna de ejemplo n.º 2', 'columna-de-ejemplo-2', '[EJEMPLO] Resumen lorem ipsum dolor sit amet…',
   '<p><strong>[CONTENIDO DE EJEMPLO]</strong> Lorem ipsum dolor sit amet.</p>',
   'https://picsum.photos/seed/columna-2/1200/800', true, '2025-02-15'),
  ('Título de columna de ejemplo n.º 3', 'columna-de-ejemplo-3', '[EJEMPLO] Resumen lorem ipsum dolor sit amet…',
   '<p><strong>[CONTENIDO DE EJEMPLO]</strong> Lorem ipsum dolor sit amet.</p>',
   'https://picsum.photos/seed/columna-3/1200/800', true, '2025-03-15'),
  ('Borrador de ejemplo (no publicado)', 'borrador-de-ejemplo', '[EJEMPLO] Esta nota está en borrador.',
   '<p>[EJEMPLO] Borrador.</p>', 'https://picsum.photos/seed/columna-4/1200/800', false, '2025-04-15');

-- press -------------------------------------------------------------------------
insert into public.press (titulo, medio, url, fecha, imagen_url) values
  ('Aparición en prensa de ejemplo n.º 1', 'El Tiempo', 'https://example.com/nota', '2024-10-01', 'https://picsum.photos/seed/prensa-1/800/600'),
  ('Aparición en prensa de ejemplo n.º 2', 'Caracol Radio', 'https://example.com/nota', '2024-11-02', 'https://picsum.photos/seed/prensa-2/800/600'),
  ('Aparición en prensa de ejemplo n.º 3', 'RCN', 'https://example.com/nota', '2024-12-03', 'https://picsum.photos/seed/prensa-3/800/600');

-- videos ------------------------------------------------------------------------
insert into public.videos (titulo, url_embed, plataforma, descripcion, orden) values
  ('Entrevista de ejemplo', 'https://www.youtube.com/embed/ScMzIvxBSi4', 'youtube', '[EJEMPLO] Lorem ipsum.', 1),
  ('Foro regional (ejemplo)', 'https://www.youtube.com/embed/aqz-KE-bpKQ', 'youtube', '[EJEMPLO] Lorem ipsum.', 2),
  ('Reportaje especial (ejemplo)', 'https://player.vimeo.com/video/76979871', 'vimeo', '[EJEMPLO] Lorem ipsum.', 3);

-- links -------------------------------------------------------------------------
insert into public.links (titulo, url, categoria, icono, orden) values
  ('Página 10', 'https://pagina10.com', 'proyecto', 'newspaper', 1),
  ('Colombia Positiva', 'https://colombiapositiva.co', 'proyecto', 'globe', 2),
  ('Twitter / X', 'https://twitter.com/ejemplo', 'red_social', 'twitter', 3),
  ('LinkedIn', 'https://linkedin.com/in/ejemplo', 'red_social', 'linkedin', 4);

-- awards ------------------------------------------------------------------------
insert into public.awards (titulo, entidad, anio, descripcion, orden) values
  ('Premio Nacional de Periodismo (EJEMPLO)', 'Entidad de ejemplo', 2023, '[EJEMPLO] Lorem ipsum.', 1),
  ('Reconocimiento Regional de Medios (EJEMPLO)', 'Entidad de ejemplo', 2021, '[EJEMPLO] Lorem ipsum.', 2),
  ('Certificación en Comunicación Digital (EJEMPLO)', 'Entidad de ejemplo', 2019, '[EJEMPLO] Lorem ipsum.', 3);

-- settings (SEO/OG) -------------------------------------------------------------
insert into public.settings (clave, valor) values
  ('seo_title', 'Mario Cepeda — Director de medios, abogado y periodista'),
  ('seo_description', '[EJEMPLO] Sitio personal de Mario Cepeda. Director de Página 10 y Colombia Positiva.'),
  ('og_image', 'https://picsum.photos/seed/og-mario/1200/630');

-- contact_messages (un mensaje de ejemplo en la bandeja) ------------------------
insert into public.contact_messages (nombre, email, mensaje, leido) values
  ('Remitente de ejemplo', 'ejemplo@correo.com', '[EJEMPLO] Mensaje de prueba de la bandeja de contacto.', false);
