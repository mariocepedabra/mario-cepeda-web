'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft, Award, BookMarked, Briefcase, GraduationCap, Sparkles } from 'lucide-react';

import { Cover } from './cover';
import { Reveal } from './interactive';
import { WorkMosaic } from './work-mosaic';

/* -------------------------------------------------------------------------- */
/*  Datos curados del perfil (a partir del CV; sin datos personales sensibles) */
/* -------------------------------------------------------------------------- */

interface Metric {
  num: string;
  label: string;
}
const METRICS: Metric[] = [
  { num: '4', label: 'títulos de posgrado' },
  { num: '14', label: 'años al frente de Página 10' },
  { num: '4', label: 'reconocimientos nacionales' },
  { num: '15+', label: 'años en gestión pública y regional' },
];

interface Formacion {
  anio: string;
  titulo: string;
  institucion: string;
}
const FORMACION: Formacion[] = [
  {
    anio: '2022',
    titulo: 'Magíster en Planificación Urbana y Regional',
    institucion: 'Universidad de los Andes — CIDER · Bogotá',
  },
  {
    anio: '2018',
    titulo: 'Especialista en Gestión Regional del Desarrollo',
    institucion: 'Universidad de los Andes — CIDER · Bogotá',
  },
  {
    anio: '2012',
    titulo: 'Magíster en Estudios Políticos',
    institucion: 'Universidad Nacional de Colombia — IEPRI · Bogotá',
  },
  {
    anio: '2006',
    titulo: 'Especialista en Derecho Constitucional',
    institucion: 'Universidad Nacional de Colombia · Bogotá',
  },
  {
    anio: '2006',
    titulo: 'Abogado',
    institucion: 'Universidad Nacional de Colombia · Bogotá',
  },
];

interface Experiencia {
  periodo: string;
  cargo: string;
  entidad: string;
  descripcion: string;
  actual?: boolean;
}
const EXPERIENCIA: Experiencia[] = [
  {
    periodo: '2021 — 2022',
    cargo: 'Líder territorial para Nariño y Putumayo',
    entidad: 'Departamento Administrativo de la Función Pública',
    descripcion:
      'Acompañamiento y asesoría a las entidades territoriales para mejorar su desempeño institucional a través del MIPG. En este acompañamiento, la Alcaldía de Pasto obtuvo el Premio Nacional de Alta Gerencia 2021.',
  },
  {
    periodo: '2012 — actual',
    cargo: 'Fundador y director',
    entidad: 'Página 10',
    descripcion:
      'Dirección y gerencia del periódico regional de Nariño, generando alternativas económicas para la región desde una comprensión profunda del territorio y visibilizando a sus sectores productivos y emprendedores.',
    actual: true,
  },
  {
    periodo: '2026 — actual',
    cargo: 'Fundador y director',
    entidad: 'Colombia Positiva',
    descripcion:
      'Dirección del periódico nacional Colombia Positiva, dedicado a las noticias positivas del país: «No todo puede ser perfecto, pero sí Positivo».',
    actual: true,
  },
  {
    periodo: '2019 — actual',
    cargo: 'Docente de posgrado y pregrado',
    entidad: 'Universidad Cooperativa de Colombia · Pasto',
    descripcion:
      'Profesor de la maestría en Derechos Humanos y Gobernanza (políticas públicas y gobernanza territorial) y de las cátedras de Dogmática Jurídica y Dinámica Sociocultural Colombiana, desde la construcción colectiva del conocimiento.',
    actual: true,
  },
  {
    periodo: '2019',
    cargo: 'Capacitador',
    entidad: 'CISP — Comitato Internazionale per lo Sviluppo dei Popoli',
    descripcion:
      'Formación a funcionarios de alto nivel en rendición de cuentas, finanzas públicas territoriales, SECOP II, MIPG y gestión documental, con una metodología horizontal de intercambio de ideas.',
  },
  {
    periodo: '2018',
    cargo: 'Formulación de proyectos con enfoque de género',
    entidad: 'Gobernación de Nariño — SEGIS',
    descripcion:
      'Identificación, formulación y seguimiento de proyectos de la Secretaría de Equidad de Género e Inclusión Social: primera infancia, juventud, mujer, población LGBTI, discapacidad y adulto mayor.',
  },
  {
    periodo: '2016 — 2017',
    cargo: 'Director técnico',
    entidad: 'Contraloría Departamental de Nariño',
    descripcion:
      'Coordinación del control fiscal a los recursos públicos del departamento, innovando hacia un control más participativo y tecnológico, con resultados cercanos a los 10 mil millones en hallazgos fiscales.',
  },
  {
    periodo: '2014 — 2015',
    cargo: 'Asesor de Regalías',
    entidad: 'Gobernación de Nariño',
    descripcion:
      'Acompañamiento jurídico a los proyectos del Sistema General de Regalías. El equipo recibió el reconocimiento del Departamento Nacional de Planeación como el mejor del país en la implementación del nuevo sistema (2015).',
  },
  {
    periodo: '2012',
    cargo: 'Consultor',
    entidad: 'Alcaldía de Pasto',
    descripcion:
      'Reorientación de la política pública de control integral de enfermedades crónicas no transmisibles, en trabajo interdisciplinario con entidades públicas y la sociedad civil.',
  },
  {
    periodo: '2012',
    cargo: 'Consultor',
    entidad: 'Alcaldía de Pupiales',
    descripcion:
      'Acompañamiento en la construcción del plan de desarrollo y en ejercicios de buen gobierno, con procesos de participación e inclusión de la ciudadanía.',
  },
  {
    periodo: '2008 — 2011',
    cargo: 'Asesor del despacho del alcalde',
    entidad: 'Alcaldía de Tumaco',
    descripcion:
      'Articulación entre las secretarías de educación, gobierno, salud y planeación para fortalecer la institucionalidad, y relacionamiento con el sector turístico para impulsar a los empresarios del municipio.',
  },
];

interface Reconocimiento {
  titulo: string;
  entidad: string;
  anio?: string;
}
const RECONOCIMIENTOS: Reconocimiento[] = [
  { titulo: 'Premio Nacional de Alta Gerencia', entidad: 'Función Pública · Alcaldía de Pasto', anio: '2021' },
  { titulo: '3.er lugar — Premio «Colombia Participa»', entidad: 'Ministerio del Interior', anio: '2020' },
  { titulo: 'Mejor grupo en la implementación del Sistema General de Regalías', entidad: 'Departamento Nacional de Planeación', anio: '2015' },
  { titulo: 'Reconocimiento «Regalías bien invertidas»', entidad: 'Departamento Nacional de Planeación' },
];

interface Investigacion {
  titulo: string;
  contexto: string;
}
const INVESTIGACION: Investigacion[] = [
  {
    titulo: 'Regularización del conflicto armado a través de acuerdos locales y regionales de paz',
    contexto: 'Límites y posibilidades constitucionales · Especialización en Derecho Constitucional',
  },
  {
    titulo: '«Espacio sin ocupantes»: la integración fronteriza colombo-ecuatoriana',
    contexto:
      'Sobre la red de consejos comunitarios del Pacífico sur (RECOMPAS) y la comarca CANE. Trabajo de campo en Tumaco y la zona fronteriza · Maestría en Estudios Políticos',
  },
  {
    titulo: 'Retos en la ejecución del Sistema General de Regalías en Tumaco',
    contexto:
      'Violencia, corrupción y debilidad institucional, en diálogo con comunidad, empresariado, institucionalidad y academia · Maestría en Planificación Urbana y Regional',
  },
];

const CURSOS: string[] = [
  'Competencias directivas y liderazgo · U. Complutense de Madrid (2022)',
  'Inmersión para próximos dirigentes del país · CESA — La Silla Vacía (2022)',
  'Negociación persuasiva · Felipe Riaño Jaramillo (2021)',
  '«Yo sé de Género 1-2-3» · ONU Mujeres (2022)',
  'Prevención de la explotación y los abusos sexuales · UNICEF (2022)',
];

/* -------------------------------------------------------------------------- */
/*  Datos editables (desde el panel) que llegan por props                     */
/* -------------------------------------------------------------------------- */
export interface PerfilData {
  eyebrow: string;
  titulo: string;
  lema: string;
  lugar: string;
  intro: string;
  intro2: string;
  cierre: string;
  heroMedia: string | null;
  secundariaMedia: string;
  mosaic: string[];
}

/* -------------------------------------------------------------------------- */
/*  Encabezado de sección editorial                                            */
/* -------------------------------------------------------------------------- */
function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
}) {
  return (
    <Reveal className="mb-10">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-accent">
        <Icon className="size-4" />
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Página de Perfil Profesional                                               */
/* -------------------------------------------------------------------------- */
export function PerfilProfesional({ data }: { data: PerfilData }) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.05 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };
  const nameItem: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 34, clipPath: 'inset(0 0 100% 0)' },
    show: {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0 0 0% 0)',
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <main className="overflow-hidden pb-24 pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent hover:underline"
        >
          <ArrowLeft className="size-4" />
          Inicio
        </Link>
      </div>

      {/* ---------------- Hero ---------------- */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto mt-8 grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16"
      >
        <div>
          <motion.p
            variants={item}
            className="text-sm font-semibold uppercase tracking-[0.3em] text-accent"
          >
            {data.eyebrow}
          </motion.p>
          <motion.h1
            variants={nameItem}
            className="mt-5 font-display text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl"
          >
            {data.titulo}
          </motion.h1>
          {data.lema ? (
            <motion.p
              variants={item}
              className="mt-6 max-w-xl font-display text-xl italic leading-snug text-ink-soft sm:text-2xl"
            >
              {data.lema}
            </motion.p>
          ) : null}
          {data.lugar ? (
            <motion.p variants={item} className="mt-4 text-sm uppercase tracking-widest text-ink-muted">
              {data.lugar}
            </motion.p>
          ) : null}
        </div>

        <motion.div
          variants={item}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-paper-2 shadow-lift">
            <Cover
              url={data.heroMedia}
              alt={data.titulo}
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          </div>
        </motion.div>
      </motion.section>

      {/* ---------------- Presentación ---------------- */}
      {(data.intro || data.intro2) ? (
        <section className="mx-auto mt-20 max-w-3xl px-5 sm:mt-28 sm:px-8">
          <Reveal>
            {data.intro ? (
              <p className="font-display text-2xl leading-relaxed text-ink sm:text-3xl">
                {data.intro}
              </p>
            ) : null}
          </Reveal>
          {data.intro2 ? (
            <Reveal delay={0.08}>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft">{data.intro2}</p>
            </Reveal>
          ) : null}
        </section>
      ) : null}

      {/* ---------------- Métricas ---------------- */}
      <section className="mx-auto mt-16 max-w-6xl px-5 sm:mt-20 sm:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.06}>
              <div className="flex h-full flex-col justify-center bg-paper p-6 sm:p-8">
                <span className="font-display text-4xl font-semibold text-accent sm:text-5xl">
                  {m.num}
                </span>
                <span className="mt-2 text-sm leading-snug text-ink-soft">{m.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Trayectoria ---------------- */}
      <section className="mx-auto mt-24 max-w-4xl px-5 sm:mt-32 sm:px-8">
        <SectionTitle icon={Briefcase} eyebrow="Trayectoria" title="Experiencia profesional" />
        <ol className="relative border-l border-line pl-6 sm:pl-8">
          {EXPERIENCIA.map((e, i) => (
            <li key={`${e.entidad}-${e.periodo}`} className="relative pb-10 last:pb-0">
              <Reveal delay={Math.min(i, 4) * 0.05}>
                <span
                  aria-hidden
                  className={`absolute -left-[calc(1.5rem+5px)] top-1.5 size-2.5 rounded-full ring-4 ring-paper sm:-left-[calc(2rem+5px)] ${
                    e.actual ? 'bg-accent' : 'bg-ink'
                  }`}
                />
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                    {e.periodo}
                  </span>
                  {e.actual ? (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                      Actual
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-1.5 font-display text-2xl font-semibold leading-tight">
                  {e.cargo}
                </h3>
                <p className="mt-0.5 font-medium text-ink-soft">{e.entidad}</p>
                <p className="mt-2 leading-relaxed text-ink-soft">{e.descripcion}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- Formación ---------------- */}
      <section className="mx-auto mt-24 max-w-4xl px-5 sm:mt-32 sm:px-8">
        <SectionTitle icon={GraduationCap} eyebrow="Academia" title="Formación académica" />
        <div className="divide-y divide-line border-y border-line">
          {FORMACION.map((f, i) => (
            <Reveal key={`${f.titulo}-${f.anio}`} delay={i * 0.05}>
              <div className="grid grid-cols-[64px_1fr] gap-5 py-6 sm:grid-cols-[100px_1fr] sm:gap-8">
                <span className="font-display text-2xl font-semibold text-accent sm:text-3xl">
                  {f.anio}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold leading-snug sm:text-2xl">
                    {f.titulo}
                  </h3>
                  <p className="mt-1 text-ink-soft">{f.institucion}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Reconocimientos ---------------- */}
      <section className="mx-auto mt-24 max-w-6xl px-5 sm:mt-32 sm:px-8">
        <SectionTitle icon={Award} eyebrow="Reconocimientos" title="Premios y distinciones" />
        <div className="grid gap-6 sm:grid-cols-2">
          {RECONOCIMIENTOS.map((r, i) => (
            <Reveal key={r.titulo} delay={(i % 2) * 0.08}>
              <div className="flex h-full flex-col rounded-card border border-line bg-paper p-6 shadow-soft transition-shadow hover:shadow-lift sm:p-8">
                {r.anio ? (
                  <span className="font-display text-3xl font-semibold text-accent">{r.anio}</span>
                ) : (
                  <Award className="size-7 text-accent" />
                )}
                <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{r.titulo}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{r.entidad}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Media secundaria (opcional) ---------------- */}
      {data.secundariaMedia ? (
        <section className="mx-auto mt-24 max-w-6xl px-5 sm:mt-32 sm:px-8">
          <Reveal>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card bg-paper-2 shadow-lift">
              <Cover url={data.secundariaMedia} alt={data.titulo} sizes="(max-width: 1152px) 100vw, 1152px" />
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* ---------------- Investigación ---------------- */}
      <section className="mx-auto mt-24 max-w-4xl px-5 sm:mt-32 sm:px-8">
        <SectionTitle icon={BookMarked} eyebrow="Investigación" title="Trabajos académicos" />
        <div className="space-y-6">
          {INVESTIGACION.map((t, i) => (
            <Reveal key={t.titulo} delay={i * 0.06}>
              <div className="grid grid-cols-[40px_1fr] gap-4 border-l-2 border-accent/40 pl-5 sm:gap-6">
                <span className="font-display text-3xl font-semibold text-accent/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-xl font-semibold leading-snug sm:text-2xl">
                    {t.titulo}
                  </h3>
                  <p className="mt-1.5 leading-relaxed text-ink-soft">{t.contexto}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Formación complementaria ---------------- */}
      <section className="mx-auto mt-24 max-w-4xl px-5 sm:mt-32 sm:px-8">
        <SectionTitle icon={Sparkles} eyebrow="Complementaria" title="Otros cursos y formación" />
        <ul className="flex flex-wrap gap-3">
          {CURSOS.map((c, i) => (
            <Reveal key={c} delay={i * 0.04}>
              <li className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink-soft shadow-soft">
                {c}
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------------- Cierre ---------------- */}
      {data.cierre ? (
        <section className="mx-auto mt-24 max-w-4xl px-5 sm:mt-32 sm:px-8">
          <Reveal>
            <blockquote className="border-t border-line pt-12 text-center">
              <p className="mx-auto max-w-3xl font-display text-3xl font-semibold italic leading-tight text-ink sm:text-5xl">
                <span className="mark-highlight">«{data.cierre}»</span>
              </p>
              <footer className="mt-6 text-sm uppercase tracking-widest text-ink-muted">
                {data.titulo}
              </footer>
            </blockquote>
          </Reveal>
        </section>
      ) : null}

      {/* ---------------- Mosaico (imágenes/videos, editable) ---------------- */}
      {data.mosaic.length > 0 ? (
        <section className="mx-auto mt-20 max-w-6xl px-5 sm:mt-24 sm:px-8">
          <Reveal className="mb-8">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-accent">
              <Sparkles className="size-4" />
              En imágenes
            </p>
          </Reveal>
          <Reveal>
            <WorkMosaic images={data.mosaic} />
          </Reveal>
        </section>
      ) : null}
    </main>
  );
}
