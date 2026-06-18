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
    <section id={id} className="scroll-mt-24 border-t border-line">
      <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <div className="flex items-baseline gap-3 lg:flex-col lg:items-start lg:gap-2">
              <span className="font-mono text-sm text-accent">{index}</span>
              <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-muted">{title}</h2>
            </div>
          </Reveal>
          <div className="lg:col-span-9">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-muted">{children}</p>;
}

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section
      id="inicio"
      className="mx-auto max-w-screen-xl px-6 pb-20 pt-36 lg:px-10 lg:pb-28 lg:pt-44"
    >
      <Reveal>
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">
          {profile.titular}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="mt-6 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          {profile.nombre}
        </h1>
      </Reveal>

      <div className="mt-14 grid gap-10 border-t border-line pt-10 lg:grid-cols-12">
        <Reveal delay={0.1} className="lg:col-span-7">
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            {truncate(profile.bio.replace(/^\[.*?\]\s*/, ''), 240)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contacto"
              className="bg-fg px-6 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent"
            >
              Contáctame
            </a>
            <a
              href="#notas"
              className="border border-fg px-6 py-3 text-sm font-medium transition-colors hover:bg-fg hover:text-bg"
            >
              Ver notas
            </a>
          </div>
        </Reveal>

        {profile.foto_url ? (
          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="relative aspect-square w-full max-w-xs overflow-hidden border border-line lg:ml-auto">
              <Image
                src={profile.foto_url}
                alt={`Retrato de ${profile.nombre} (imagen de ejemplo)`}
                fill
                sizes="(max-width: 1024px) 100vw, 20rem"
                className="object-cover"
                priority
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

export function About({ profile }: { profile: Profile }) {
  const bio = profile.bio.replace(/^\[.*?\]\s*/, '');
  return (
    <Section id="sobre-mi" index="01" title="Sobre mí">
      <Reveal>
        <p className="max-w-2xl text-2xl font-medium leading-snug tracking-tight">
          {profile.titular}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="mt-6 max-w-2xl space-y-4 text-lg leading-relaxed text-muted">
          <p>{bio}</p>
          <p>{bio}</p>
        </div>
      </Reveal>
    </Section>
  );
}

export function Timeline({ experiences }: { experiences: Experience[] }) {
  return (
    <Section id="trayectoria" index="02" title="Trayectoria">
      {experiences.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="border-t border-line">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.05}>
              <div className="grid gap-2 border-b border-line py-6 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <p className="font-mono text-sm text-muted">{exp.periodo}</p>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{exp.titulo}</h3>
                  {exp.organizacion ? (
                    <p className="mt-0.5 text-sm text-accent">{exp.organizacion}</p>
                  ) : null}
                  {exp.descripcion ? (
                    <p className="mt-2 max-w-2xl leading-relaxed text-muted">{exp.descripcion}</p>
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

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/notas/${post.slug}`} className="group block">
      <div className="relative mb-4 aspect-[3/2] overflow-hidden bg-zinc-100">
        {post.portada_url ? (
          <Image
            src={post.portada_url}
            alt={`Portada de «${post.titulo}» (imagen de ejemplo)`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
          />
        ) : null}
      </div>
      <p className="font-mono text-xs text-muted">{formatDate(post.fecha)}</p>
      <h3 className="mt-1.5 text-xl font-semibold leading-tight tracking-tight group-hover:text-accent">
        {post.titulo}
      </h3>
      {post.resumen ? (
        <p className="mt-1.5 leading-relaxed text-muted">{truncate(post.resumen, 110)}</p>
      ) : null}
    </Link>
  );
}

export function PostsPreview({ posts }: { posts: Post[] }) {
  return (
    <Section id="notas" index="03" title="Notas">
      {posts.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <>
          <div className="grid gap-10 sm:grid-cols-2">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.08}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
          <Link
            href="/notas"
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium hover:text-accent"
          >
            Ver todas las notas <ArrowUpRight className="size-4" />
          </Link>
        </>
      )}
    </Section>
  );
}

export function PressSection({ press }: { press: Press[] }) {
  return (
    <Section id="prensa" index="04" title="Prensa">
      {press.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="border-t border-line">
          {press.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.04}>
              <a
                href={item.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid items-baseline gap-1 border-b border-line py-5 sm:grid-cols-[8rem_1fr_7rem] sm:gap-4"
              >
                <span className="font-mono text-xs uppercase tracking-widest text-accent">
                  {item.medio}
                </span>
                <span className="text-lg tracking-tight group-hover:text-accent">{item.titulo}</span>
                <span className="font-mono text-xs text-muted sm:text-right">
                  {formatDate(item.fecha)}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}

export function Multimedia({ videos }: { videos: Video[] }) {
  return (
    <Section id="multimedia" index="05" title="Multimedia">
      {videos.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          {videos.map((video, i) => {
            const embed = toEmbed(video.url_embed);
            return (
              <Reveal key={video.id} delay={i * 0.08}>
                <div>
                  <div className="relative aspect-video overflow-hidden border border-line">
                    <iframe
                      src={embed.url}
                      title={video.titulo}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 size-full"
                    />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{video.titulo}</h3>
                  {video.descripcion ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted">{video.descripcion}</p>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </Section>
  );
}

export function LinksSection({ links }: { links: LinkRow[] }) {
  const groups = ['proyecto', 'red_social', 'recurso'] as const;
  return (
    <Section id="enlaces" index="06" title="Enlaces">
      {links.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-10 sm:grid-cols-3">
          {groups.map((group) => {
            const items = links.filter((l) => l.categoria === group);
            if (items.length === 0) return null;
            return (
              <Reveal key={group}>
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-muted">
                    {LINK_CATEGORY_LABELS[group]}
                  </p>
                  <ul className="mt-3">
                    {items.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between border-b border-line py-2.5 transition-colors hover:text-accent"
                        >
                          {link.titulo}
                          <ArrowUpRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

export function Awards({ awards }: { awards: Award[] }) {
  return (
    <Section id="reconocimientos" index="07" title="Reconocimientos">
      {awards.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="border-t border-line">
          {awards.map((award, i) => (
            <Reveal key={award.id} delay={i * 0.05}>
              <div className="grid gap-2 border-b border-line py-6 sm:grid-cols-[6rem_1fr] sm:gap-6">
                <p className="font-mono text-2xl font-semibold text-accent">{award.anio ?? '—'}</p>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{award.titulo}</h3>
                  {award.entidad ? <p className="mt-0.5 text-sm text-muted">{award.entidad}</p> : null}
                  {award.descripcion ? (
                    <p className="mt-2 max-w-2xl leading-relaxed text-muted">{award.descripcion}</p>
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

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-screen-xl px-6 py-14 lg:px-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-2xl font-semibold tracking-tight">{profile.nombre}</p>
            <p className="mt-1 text-muted">{profile.titular}</p>
          </div>
          <a href="#inicio" className="font-mono text-xs uppercase tracking-widest text-muted hover:text-fg">
            ↑ Inicio
          </a>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-line pt-6 font-mono text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {profile.nombre}</p>
          <p>Sitio de demostración · contenido de ejemplo</p>
        </div>
      </div>
    </footer>
  );
}
