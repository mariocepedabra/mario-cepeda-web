import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import {
  formatDate,
  MAIN_SECTIONS,
  parseSectionMedia,
  siteText,
  truncate,
  type SectionMediaId,
} from '@mario/core/lib';
import { placeholderImage } from '@mario/database';
import type { Post, Profile, Video } from '@mario/database';

import { Cover } from './cover';
import { Reveal } from './interactive';

type Content = Record<string, string>;

/** Línea de metadatos «Categoría · Fecha» de una nota. */
const postMeta = (post: Post) => [post.categoria, formatDate(post.fecha)].filter(Boolean).join(' · ');

/** Renderiza un titular resaltando (estilo marcador) la palabra indicada. */
function HeroTitle({ title, highlight }: { title: string; highlight: string }) {
  const idx = highlight ? title.toLowerCase().indexOf(highlight.toLowerCase()) : -1;
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <span className="mark-highlight">{title.slice(idx, idx + highlight.length)}</span>
      {title.slice(idx + highlight.length)}
    </>
  );
}

/* Encabezado de sección reutilizable (estilo editorial). */
function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{title}</h2>
      </div>
      {children}
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/*  1. Hero inmersivo                                                          */
/* -------------------------------------------------------------------------- */
export function Hero({ profile, content }: { profile: Profile; content?: Content }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-28 sm:px-8 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {siteText(content, 'home.hero.eyebrow')}
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">
            <HeroTitle
              title={siteText(content, 'home.hero.title')}
              highlight={siteText(content, 'home.hero.highlight')}
            />
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            {siteText(content, 'home.hero.lead')}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/perfil-profesional"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-paper transition-colors hover:bg-accent"
            >
              {siteText(content, 'home.hero.cta_primary')}
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#newsletter"
              className="inline-flex items-center gap-2 rounded-full border border-ink px-7 py-3.5 font-semibold transition-colors hover:bg-ink hover:text-paper"
            >
              {siteText(content, 'home.hero.cta_secondary')}
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-paper-2 shadow-lift">
            <Cover
              url={profile.foto_url}
              alt={`Retrato de ${profile.nombre}`}
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          </div>
          <p className="mt-3 text-sm text-ink-muted">{profile.titular}</p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  2. Historias destacadas (patrón «top story»)                               */
/* -------------------------------------------------------------------------- */
export function FeaturedStories({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  const [lead, ...rest] = posts;
  const secondary = rest.slice(0, 2);

  return (
    <section className="border-t border-line py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow="Historias" title="Destacadas" />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Nota principal */}
          <Reveal>
            <Link href={`/pensamiento/${lead.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-paper-2 shadow-soft">
                <Cover
                  url={lead.portada_url}
                  alt={`Portada de «${lead.titulo}»`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-accent">
                {postMeta(lead)}
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold leading-tight group-hover:text-accent sm:text-4xl">
                {lead.titulo}
              </h3>
              {lead.resumen ? (
                <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">
                  {truncate(lead.resumen, 150)}
                </p>
              ) : null}
            </Link>
          </Reveal>

          {/* Notas secundarias */}
          <div className="flex flex-col gap-8">
            {secondary.map((post, i) => (
              <Reveal key={post.id} delay={(i + 1) * 0.08}>
                <Link href={`/pensamiento/${post.slug}`} className="group grid grid-cols-[0.4fr_0.6fr] gap-5">
                  <div className="relative aspect-square overflow-hidden rounded-card bg-paper-2 shadow-soft">
                    <Cover
                      url={post.portada_url}
                      alt={`Portada de «${post.titulo}»`}
                      sizes="(max-width: 1024px) 40vw, 20vw"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="self-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                      {postMeta(post)}
                    </p>
                    <h3 className="mt-1.5 font-display text-xl font-semibold leading-snug group-hover:text-accent sm:text-2xl">
                      {post.titulo}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  3. Accesos a las 4 secciones principales                                   */
/* -------------------------------------------------------------------------- */
export function SectionAccess({ content }: { content?: Content }) {
  const media = parseSectionMedia(content);
  return (
    <section className="border-t border-line py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow={siteText(content, 'home.sections.eyebrow')}
          title={siteText(content, 'home.sections.title')}
        />

        <div className="grid gap-8 sm:grid-cols-2">
          {MAIN_SECTIONS.map((s, i) => {
            const url = media[s.id as SectionMediaId] || placeholderImage(`seccion-${s.id}`, 1200, 750);
            return (
            <Reveal key={s.id} delay={i * 0.08}>
              <Link
                href={s.href}
                className="group block overflow-hidden rounded-card border border-line bg-paper shadow-soft transition-shadow hover:shadow-lift"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-paper-2">
                  <Cover
                    url={url}
                    alt={s.label}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start justify-between gap-4 p-6 sm:p-8">
                  <div>
                    <h3 className="font-display text-2xl font-semibold group-hover:text-accent">
                      {s.label}
                    </h3>
                    <p className="mt-2 max-w-sm leading-relaxed text-ink-soft">
                      {siteText(content, `section.${s.id}.blurb`)}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-1 size-6 shrink-0 text-ink-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
              </Link>
            </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  4. Lo último (feed reciente)                                               */
/* -------------------------------------------------------------------------- */
export function LatestFeed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  const items = posts.slice(0, 5);

  return (
    <section className="border-t border-line py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <SectionHead eyebrow="Al día" title="Lo último">
          <Link
            href="/pensamiento"
            className="link-underline pb-1 font-display text-lg font-semibold hover:text-accent"
          >
            Ver todo
          </Link>
        </SectionHead>

        <ul className="divide-y divide-line border-y border-line">
          {items.map((post, i) => (
            <li key={post.id}>
              <Reveal delay={i * 0.05}>
                <Link
                  href={`/pensamiento/${post.slug}`}
                  className="group grid grid-cols-[64px_1fr] items-center gap-4 py-5 sm:grid-cols-[88px_1fr] sm:gap-6"
                >
                  <div className="relative aspect-square overflow-hidden rounded-card bg-paper-2">
                    <Cover
                      url={post.portada_url}
                      alt={`Portada de «${post.titulo}»`}
                      sizes="88px"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                      {postMeta(post)}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold leading-snug group-hover:text-accent sm:text-2xl">
                      {post.titulo}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  5. Multimedia (opcional) — tarjetas de video                               */
/* -------------------------------------------------------------------------- */
export function MultimediaStrip({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null;
  const items = videos.slice(0, 2);

  return (
    <section className="border-t border-line py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead eyebrow="Multimedia" title="En video" />

        <div className="grid gap-8 md:grid-cols-2">
          {items.map((video, i) => {
            return (
              <Reveal key={video.id} delay={i * 0.08}>
                <div className="overflow-hidden rounded-card border border-line bg-paper shadow-soft">
                  <div className="relative aspect-video overflow-hidden bg-paper-2">
                    <Cover url={video.url_embed} alt={video.titulo} sizes="(max-width: 768px) 100vw, 50vw" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold">{video.titulo}</h3>
                    {video.descripcion ? (
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {video.descripcion}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
