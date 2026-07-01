-- ============================================================================
--  trayectoria-mario.sql — Trayectoria REAL de Mario (Trabajo → Trayectoria)
-- ----------------------------------------------------------------------------
--  Reemplaza la lista de la tabla `experiences` con la trayectoria real tomada
--  de la hoja de vida (sin datos personales sensibles). Ejecutar en el SQL
--  Editor de Supabase. Córrelo UNA vez: borra la trayectoria actual (los
--  ejemplos) y carga la definitiva. Es re-ejecutable (vuelve a dejar estas 11).
-- ============================================================================

delete from public.experiences;

insert into public.experiences (titulo, organizacion, periodo, descripcion, orden) values
  ('Fundador y director', 'Página 10', '2012 — Presente',
   'Dirijo y gerencio el periódico regional de Nariño, generando alternativas económicas para la región y visibilizando a sus sectores productivos, emprendedores y culturales.', 1),
  ('Fundador y director', 'Colombia Positiva', '2026 — Presente',
   'Dirección del periódico nacional de noticias positivas: «No todo puede ser perfecto, pero sí Positivo».', 2),
  ('Líder territorial para Nariño y Putumayo', 'Departamento Administrativo de la Función Pública', '2021 — 2022',
   'Asesoría y acompañamiento a las entidades territoriales para mejorar su desempeño institucional a través del MIPG. En este proceso, la Alcaldía de Pasto obtuvo el Premio Nacional de Alta Gerencia 2021.', 3),
  ('Docente de posgrado y pregrado', 'Universidad Cooperativa de Colombia · Pasto', '2019 — Presente',
   'Profesor de la maestría en Derechos Humanos y Gobernanza (políticas públicas y gobernanza territorial) y de las cátedras de Dogmática Jurídica y Dinámica Sociocultural Colombiana.', 4),
  ('Capacitador', 'CISP — Comitato Internazionale per lo Sviluppo dei Popoli', '2019',
   'Formación a funcionarios en rendición de cuentas, finanzas públicas territoriales, SECOP II, MIPG y gestión documental, con una metodología horizontal de intercambio de ideas.', 5),
  ('Formulación de proyectos con enfoque de género', 'Gobernación de Nariño · SEGIS', '2018',
   'Identificación, formulación y seguimiento de proyectos de la Secretaría de Equidad de Género e Inclusión Social: infancia, juventud, mujer, población LGBTI, discapacidad y adulto mayor.', 6),
  ('Director técnico', 'Contraloría Departamental de Nariño', '2016 — 2017',
   'Coordinación del control fiscal a los recursos públicos del departamento, innovando hacia un control más participativo y tecnológico, con resultados cercanos a los 10 mil millones en hallazgos fiscales.', 7),
  ('Asesor de Regalías', 'Gobernación de Nariño', '2014 — 2015',
   'Acompañamiento jurídico a los proyectos del Sistema General de Regalías. El equipo recibió el reconocimiento del Departamento Nacional de Planeación como el mejor del país en la implementación del nuevo sistema (2015).', 8),
  ('Consultor', 'Alcaldía de Pasto', '2012',
   'Reorientación de la política pública de control integral de enfermedades crónicas no transmisibles, en trabajo interdisciplinario con entidades públicas y la sociedad civil.', 9),
  ('Consultor', 'Alcaldía de Pupiales', '2012',
   'Acompañamiento en la construcción del plan de desarrollo y en ejercicios de buen gobierno, con procesos de participación e inclusión de la ciudadanía.', 10),
  ('Asesor del despacho del alcalde', 'Alcaldía de Tumaco', '2008 — 2011',
   'Articulación entre las secretarías de educación, gobierno, salud y planeación para fortalecer la institucionalidad, y relacionamiento con el sector turístico para impulsar a los empresarios del municipio.', 11);
