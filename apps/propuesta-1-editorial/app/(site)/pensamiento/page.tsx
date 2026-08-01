import type { Metadata } from 'next';
import Link from 'next/link';

import {
  parseBanners,
  parseMosaic,
  parseSocialLinks,
  SOCIAL_DEFAULTS,
  SOCIAL_KEYS,
  type BannerPosition,
} from '@mario/core/lib';
import { getPosts, getSettings } from '@mario/database/queries';

import { ArticlesGrid } from '@/components/articles-grid';
import { Reveal } from '@/components/interactive';
import { SectionBanners } from '@/components/section-banners';
import { SlidePresentation, type Slide } from '@/components/slide-presentation';
import { SocialFeed } from '@/components/social-feed';
import { WorkMosaic } from '@/components/work-mosaic';

// Presentación «La filosofía estoica» (exportada del .pptx de Mario a WebP 16:9).
const ESTOICISMO_SLIDES: Slide[] = [
  { src: '/presentaciones/filosofia-estoica/slide-01.webp', alt: 'Portada: La filosofía estoica, un arte para vivir mejor. Por Mario Cepeda Bravo.' },
  { src: '/presentaciones/filosofia-estoica/slide-02.webp', alt: 'Pensamiento — Mario Cepeda Bravo.' },
  { src: '/presentaciones/filosofia-estoica/slide-03.webp', alt: 'El origen: el nacimiento del estoicismo con Zenón de Citio hacia el año 300 a. C.' },
  { src: '/presentaciones/filosofia-estoica/slide-04.webp', alt: 'Definición: ¿qué es el estoicismo? No controlamos todo lo que ocurre, pero sí nuestra respuesta.' },
  { src: '/presentaciones/filosofia-estoica/slide-05.webp', alt: 'Linaje: los grandes estoicos — Zenón, Crisipo, Séneca, Epicteto y Marco Aurelio.' },
  { src: '/presentaciones/filosofia-estoica/slide-06.webp', alt: 'Brújula interior: los principios fundamentales del estoicismo.' },
  { src: '/presentaciones/filosofia-estoica/slide-07.webp', alt: 'El núcleo ético: las cuatro virtudes estoicas — sabiduría, justicia, valentía y templanza.' },
  { src: '/presentaciones/filosofia-estoica/slide-08.webp', alt: 'El regreso contemporáneo: autores actuales del estoicismo.' },
  { src: '/presentaciones/filosofia-estoica/slide-09.webp', alt: 'Relevancia: ¿por qué el estoicismo es pertinente hoy?' },
  { src: '/presentaciones/filosofia-estoica/slide-10.webp', alt: 'Aquí y ahora: el estoicismo en Colombia y Nariño.' },
  { src: '/presentaciones/filosofia-estoica/slide-11.webp', alt: 'Práctica diaria: ejercicios estoicos.' },
  { src: '/presentaciones/filosofia-estoica/slide-12.webp', alt: 'Ejercicio práctico: lo que depende de mí y lo que no depende de mí.' },
  { src: '/presentaciones/filosofia-estoica/slide-13.webp', alt: 'Cierre: una mente más fuerte para atravesar el dolor. ¿Qué haremos con aquello que no podemos controlar?' },
  { src: '/presentaciones/filosofia-estoica/slide-14.webp', alt: 'Sígueme — Mario Cepeda Bravo.' },
  { src: '/presentaciones/filosofia-estoica/slide-15.webp', alt: 'Muchas gracias.' },
];

export const metadata: Metadata = {
  title: 'Pensamiento',
  description: 'Ensayos, columnas e ideas de Mario Cepeda sobre medios, región, tecnología y sociedad.',
};

interface Props {
  searchParams: Promise<{ tema?: string }>;
}

export default async function PensamientoPage({ searchParams }: Props) {
  const { tema } = await searchParams;
  const [posts, settings] = await Promise.all([getPosts(), getSettings()]);
  const mosaic = parseMosaic(settings, 'pensamiento');
  const banners = parseBanners(settings, 'pensamiento');
  const bannersAt = (pos: BannerPosition) =>
    banners.filter((b) => b.pos === pos).map((b) => b.url);

  // Redes sociales bajo los artículos: si nunca se ha configurado la clave, se
  // usa por defecto el perfil de X de Mario; si se guardó una lista vacía desde
  // el panel, se respeta (no se muestra nada).
  const socialLinks =
    settings[SOCIAL_KEYS.pensamiento] === undefined
      ? SOCIAL_DEFAULTS.pensamiento
      : parseSocialLinks(settings, 'pensamiento');

  const temas = Array.from(
    new Set(posts.map((p) => p.categoria).filter((c): c is string => Boolean(c))),
  );
  const activos = tema && temas.includes(tema) ? posts.filter((p) => p.categoria === tema) : posts;

  // El <main> ocupa TODO el ancho para que los banners lleguen de borde a borde;
  // cada bloque de contenido se centra en su propio contenedor `max-w-7xl`.
  return (
    <main className="pb-24 pt-32 sm:pt-40">
      {/* Banner de cabecera (a sangre completa), antes del título. */}
      <SectionBanners urls={bannersAt('header')} className="mb-12 sm:mb-16" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
              Pensamiento
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] sm:text-6xl">
              Ensayos, columnas e ideas
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              Reflexiones de Mario sobre medios y comunicación, su región, tecnología, cultura y
              sociedad.
            </p>
          </header>
        </Reveal>
      </div>

      {/* Banner sobre el contenido (a sangre completa). */}
      <SectionBanners urls={bannersAt('above')} className="mt-12 sm:mt-16" />

      {/* Presentación de diapositivas (antes de los Artículos). */}
      <div className="mx-auto mt-16 max-w-7xl px-5 sm:mt-20 sm:px-8">
        <Reveal>
          <SlidePresentation
            slides={ESTOICISMO_SLIDES}
            eyebrow="Presentación"
            title="La filosofía estoica: un arte para vivir mejor"
            subtitle="Serenidad, virtud y fortaleza interior para tiempos difíciles. Pasa las diapositivas a tu ritmo."
          />
        </Reveal>
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Artículos */}
        <Reveal>
          <h2 className="mt-14 font-display text-3xl font-semibold sm:text-4xl">Artículos</h2>
        </Reveal>

        {/* Filtros por tema */}
        {temas.length > 0 ? (
          <nav aria-label="Filtrar por tema" className="mt-6 flex flex-wrap gap-2">
            <FilterChip label="Todos" href="/pensamiento" active={!tema || !temas.includes(tema)} />
            {temas.map((t) => (
              <FilterChip
                key={t}
                label={t}
                href={`/pensamiento?tema=${encodeURIComponent(t)}`}
                active={tema === t}
              />
            ))}
          </nav>
        ) : null}

        {activos.length === 0 ? (
          <p className="py-20 text-lg italic text-ink-soft">Aún no hay publicaciones en este tema.</p>
        ) : (
          <ArticlesGrid posts={activos} />
        )}

        {/* Redes sociales (feed automático, debajo de los artículos) */}
        <SocialFeed urls={socialLinks} />

        {/* Mosaico / collage de imágenes (debajo de los artículos) */}
        {mosaic.length > 0 ? (
          <section className="mt-20 sm:mt-28">
            <Reveal>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">En imágenes</h2>
            </Reveal>
            <div className="mt-8">
              <WorkMosaic images={mosaic} />
            </div>
          </section>
        ) : null}
      </div>

      {/* Banner bajo el contenido y banner de pie (a sangre completa). */}
      <SectionBanners urls={bannersAt('below')} className="mt-16 sm:mt-20" />
      <SectionBanners urls={bannersAt('footer')} className="mt-16 sm:mt-20" />
    </main>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line text-ink-soft hover:border-ink hover:text-ink'
      }`}
    >
      {label}
    </Link>
  );
}
