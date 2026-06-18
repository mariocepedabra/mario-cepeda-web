import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { formatDate, LINK_CATEGORY_LABELS, toEmbed, truncate } from '@mario/core/lib';
import type {
  Award,
  Experience,
  Link as LinkRow,
  Post,
  Press,
  Profile,
  Video,
} from '@mario/database';

import { Reveal } from './interactive';

/* -------------------------------------------------------------------------- */
/*  Envoltorio de sección con numeración editorial                            */
/* -------------------------------------------------------------------------- */
function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <header className="mb-12 flex items-baseline gap-4">
            <span className="font-display text-lg text-accent">{index}</span>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
          </header>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-ink-soft italic">{children}</p>;
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */
export function Hero({ profile }: { profile: Profile }) {
  return (
    <section id="inicio" className="relative pt-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center justify-between border-b border-ink pb-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">
          <span>Edición personal</span>
          <span>Nariño · Colombia</span>
        </div>

        <div className="grid items-end gap-10 pt-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="font-medium uppercase tracking-[0.25em] text-accent">
              Periodismo · Derecho · Opinión
            </p>
            <h1 className="mt-4 font-display text-6xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              {profile.nombre}
            </h1>
            <p className="mt-6 max-w-xl font-display text-2xl italic text-ink-soft">
              {profile.titular}
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              {truncate(profile.bio.replace(/^\[.*?\]\s*/, ''), 200)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contacto"
                className="rounded-card bg-ink px-7 py-3 font-medium text-paper transition-colors hover:bg-accent"
              >
                Contáctame
              </a>
              <a
                href="#notas"
                className="rounded-card border border-ink px-7 py-3 font-medium transition-colors hover:bg-ink hover:text-paper"
              >
                Leer mis notas
              </a>
            </div>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-paper-2">
            {profile.foto_url ? (
              <Image
                src={profile.foto_url}
                alt={`Retrato de ${profile.nombre} (imagen de ejemplo)`}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover grayscale"
                priority
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sobre mí                                                                   */
/* -------------------------------------------------------------------------- */
export function About({ profile }: { profile: Profile }) {
  const bio = profile.bio.replace(/^\[.*?\]\s*/, '');
  return (
    <Section id="sobre-mi" index="01" title="Sobre mí">
      <div className="grid gap-10 lg:grid-cols-[0.4fr_0.6fr]">
        <Reveal>
          <p className="font-display text-2xl italic leading-snug">{profile.titular}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
            <p className="first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-accent">
              {bio}
            </p>
            <p>{bio}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trayectoria                                                                */
/* -------------------------------------------------------------------------- */
export function Timeline({ experiences }: { experiences: Experience[] }) {
  return (
    <Section id="trayectoria" index="02" title="Trayectoria">
      {experiences.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.05}>
              <div className="grid gap-2 py-7 sm:grid-cols-[0.25fr_0.75fr] sm:gap-8">
                <p className="font-display text-lg text-accent">{exp.periodo}</p>
                <div>
                  <h3 className="font-display text-2xl font-semibold">{exp.titulo}</h3>
                  {exp.organizacion ? (
                    <p className="mt-1 text-sm font-medium uppercase tracking-wide text-ink-soft">
                      {exp.organizacion}
                    </p>
                  ) : null}
                  {exp.descripcion ? (
                    <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">{exp.descripcion}</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tarjeta de nota (reutilizable)                                            */
/* -------------------------------------------------------------------------- */
export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/notas/${post.slug}`} className="group block">
      <div className="relative mb-4 aspect-[3/2] overflow-hidden border border-line bg-paper-2">
        {post.portada_url ? (
          <Image
            src={post.portada_url}
            alt={`Portada de «${post.titulo}» (imagen de ejemplo)`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <p className="text-xs font-medium uppercase tracking-widest text-accent">
        {formatDate(post.fecha)}
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold leading-tight group-hover:text-accent">
        {post.titulo}
      </h3>
      {post.resumen ? (
        <p className="mt-2 leading-relaxed text-ink-soft">{truncate(post.resumen, 120)}</p>
      ) : null}
    </Link>
  );
}

export function PostsPreview({ posts }: { posts: Post[] }) {
  return (
    <Section id="notas" index="03" title="Notas y columnas">
      {posts.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.08}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
          <div className="mt-12">
            <Link
              href="/notas"
              className="inline-flex items-center gap-2 font-display text-xl font-semibold hover:text-accent"
            >
              Ver todas las notas <ArrowUpRight className="size-5" />
            </Link>
          </div>
        </>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Prensa                                                                     */
/* -------------------------------------------------------------------------- */
export function PressSection({ press }: { press: Press[] }) {
  return (
    <Section id="prensa" index="04" title="Prensa y menciones">
      {press.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {press.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <a
                href={item.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid items-center gap-3 py-6 sm:grid-cols-[0.2fr_0.55fr_0.25fr]"
              >
                <span className="text-sm font-medium uppercase tracking-widest text-accent">
                  {item.medio}
                </span>
                <span className="font-display text-xl group-hover:text-accent">{item.titulo}</span>
                <span className="text-sm text-ink-soft sm:text-right">{formatDate(item.fecha)}</span>
              </a>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Multimedia                                                                 */
/* -------------------------------------------------------------------------- */
export function Multimedia({ videos }: { videos: Video[] }) {
  return (
    <Section id="multimedia" index="05" title="Multimedia">
      {videos.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {videos.map((video, i) => {
            const embed = toEmbed(video.url_embed);
            return (
              <Reveal key={video.id} delay={i * 0.08}>
                <div className="border border-line bg-paper-2">
                  <div className="relative aspect-video overflow-hidden">
                    <iframe
                      src={embed.url}
                      title={video.titulo}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 size-full"
                    />
                  </div>
                  <div className="p-5">
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
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Enlaces                                                                    */
/* -------------------------------------------------------------------------- */
export function LinksSection({ links }: { links: LinkRow[] }) {
  const groups = ['proyecto', 'red_social', 'recurso'] as const;
  return (
    <Section id="enlaces" index="06" title="Enlaces y recursos">
      {links.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-10 md:grid-cols-3">
          {groups.map((group) => {
            const items = links.filter((l) => l.categoria === group);
            if (items.length === 0) return null;
            return (
              <Reveal key={group}>
                <div>
                  <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-accent">
                    {LINK_CATEGORY_LABELS[group]}
                  </h3>
                  <ul className="space-y-2">
                    {items.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between border-b border-line py-2 text-lg transition-colors hover:text-accent"
                        >
                          {link.titulo}
                          <ArrowUpRight className="size-4 text-ink-soft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reconocimientos                                                            */
/* -------------------------------------------------------------------------- */
export function Awards({ awards }: { awards: Award[] }) {
  return (
    <Section id="reconocimientos" index="07" title="Reconocimientos">
      {awards.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((award, i) => (
            <Reveal key={award.id} delay={i * 0.05} className="bg-paper">
              <div className="h-full p-7">
                <p className="font-display text-4xl font-semibold text-accent">{award.anio ?? '—'}</p>
                <h3 className="mt-3 font-display text-xl font-semibold">{award.titulo}</h3>
                {award.entidad ? (
                  <p className="mt-1 text-sm uppercase tracking-wide text-ink-soft">
                    {award.entidad}
                  </p>
                ) : null}
                {award.descripcion ? (
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{award.descripcion}</p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */
export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-3xl font-semibold">{profile.nombre}</p>
            <p className="mt-1 text-paper/70">{profile.titular}</p>
          </div>
          <a
            href="#inicio"
            className="text-sm font-medium uppercase tracking-widest text-paper/80 hover:text-paper"
          >
            Volver arriba ↑
          </a>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-paper/20 pt-6 text-sm text-paper/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {profile.nombre}. Todos los derechos reservados.</p>
          <p>Sitio de demostración · contenido de ejemplo.</p>
        </div>
      </div>
    </footer>
  );
}
