import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Play } from 'lucide-react';

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

import { HeroBackdrop, Reveal } from './interactive';

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
    <section id={id} className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <header className="mb-12">
            <span className="font-display text-sm font-medium tracking-widest text-accent">
              {index}
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
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
  return <p className="text-muted">{children}</p>;
}

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden pt-16"
    >
      <HeroBackdrop />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Reveal>
            <p className="font-display text-sm font-medium uppercase tracking-[0.3em] text-accent-2">
              {profile.titular}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-5 font-display text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              <span className="text-gradient">{profile.nombre}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {truncate(profile.bio.replace(/^\[.*?\]\s*/, ''), 220)}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#contacto"
                className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-7 py-3 font-medium text-[#0b0b16] transition-opacity hover:opacity-90"
              >
                Contáctame
              </a>
              <a
                href="#notas"
                className="glass glass-hover rounded-full px-7 py-3 font-medium"
              >
                Ver mis notas
              </a>
            </div>
          </Reveal>
        </div>

        {profile.foto_url ? (
          <Reveal delay={0.2}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/40 to-accent-2/30 blur-2xl" />
              <div className="glass relative size-full overflow-hidden rounded-3xl">
                <Image
                  src={profile.foto_url}
                  alt={`Retrato de ${profile.nombre} (imagen de ejemplo)`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 24rem"
                  className="object-cover"
                  priority
                />
              </div>
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
        <div className="glass rounded-3xl p-8 sm:p-12">
          <p className="font-display text-2xl font-medium leading-snug text-fg sm:text-3xl">
            {profile.titular}
          </p>
          <div className="mt-6 grid gap-5 text-lg leading-relaxed text-muted md:grid-cols-2">
            <p>{bio}</p>
            <p>{bio}</p>
          </div>
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
        <div className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:h-full before:w-px before:bg-gradient-to-b before:from-accent before:to-transparent sm:before:left-2">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.05}>
              <div className="relative pl-8 sm:pl-10">
                <span className="absolute left-0 top-2 size-3.5 rounded-full bg-gradient-to-br from-accent to-accent-2 ring-4 ring-bg sm:left-0.5" />
                <div className="glass glass-hover rounded-2xl p-6">
                  <p className="font-display text-sm text-accent-2">{exp.periodo}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">{exp.titulo}</h3>
                  {exp.organizacion ? (
                    <p className="mt-0.5 text-sm text-muted">{exp.organizacion}</p>
                  ) : null}
                  {exp.descripcion ? (
                    <p className="mt-3 leading-relaxed text-muted">{exp.descripcion}</p>
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
      <div className="glass glass-hover overflow-hidden rounded-2xl">
        <div className="relative aspect-[3/2] overflow-hidden">
          {post.portada_url ? (
            <Image
              src={post.portada_url}
              alt={`Portada de «${post.titulo}» (imagen de ejemplo)`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
        </div>
        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-accent-2">
            {formatDate(post.fecha)}
          </p>
          <h3 className="mt-2 font-display text-xl font-semibold leading-tight group-hover:text-accent">
            {post.titulo}
          </h3>
          {post.resumen ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">{truncate(post.resumen, 110)}</p>
          ) : null}
        </div>
      </div>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.08}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
          <Link
            href="/notas"
            className="mt-10 inline-flex items-center gap-2 font-display font-semibold text-accent-2 hover:text-accent"
          >
            Ver todas las notas <ArrowUpRight className="size-5" />
          </Link>
        </>
      )}
    </Section>
  );
}

export function PressSection({ press }: { press: Press[] }) {
  return (
    <Section id="prensa" index="04" title="Prensa y menciones">
      {press.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="space-y-3">
          {press.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <a
                href={item.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="glass glass-hover group flex items-center justify-between gap-4 rounded-2xl p-5"
              >
                <div>
                  <span className="text-xs font-medium uppercase tracking-widest text-accent-2">
                    {item.medio}
                  </span>
                  <p className="mt-1 font-display text-lg group-hover:text-accent">{item.titulo}</p>
                </div>
                <span className="shrink-0 text-sm text-muted">{formatDate(item.fecha)}</span>
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
        <div className="grid gap-6 md:grid-cols-2">
          {videos.map((video, i) => {
            const embed = toEmbed(video.url_embed);
            return (
              <Reveal key={video.id} delay={i * 0.08}>
                <div className="glass overflow-hidden rounded-2xl">
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
                  <div className="flex items-start gap-3 p-5">
                    <Play className="mt-1 size-4 shrink-0 text-accent-2" />
                    <div>
                      <h3 className="font-display text-lg font-semibold">{video.titulo}</h3>
                      {video.descripcion ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {video.descripcion}
                        </p>
                      ) : null}
                    </div>
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

export function LinksSection({ links }: { links: LinkRow[] }) {
  const groups = ['proyecto', 'red_social', 'recurso'] as const;
  return (
    <Section id="enlaces" index="06" title="Enlaces y recursos">
      {links.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {groups.map((group) => {
            const items = links.filter((l) => l.categoria === group);
            if (items.length === 0) return null;
            return (
              <Reveal key={group}>
                <div className="glass h-full rounded-2xl p-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-accent-2">
                    {LINK_CATEGORY_LABELS[group]}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {items.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between border-b border-line py-2.5 transition-colors last:border-0 hover:text-accent-2"
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {awards.map((award, i) => (
            <Reveal key={award.id} delay={i * 0.05}>
              <div className="glass glass-hover h-full rounded-2xl p-6">
                <p className="font-display text-4xl font-bold text-gradient">{award.anio ?? '—'}</p>
                <h3 className="mt-3 font-display text-lg font-semibold">{award.titulo}</h3>
                {award.entidad ? <p className="mt-1 text-sm text-muted">{award.entidad}</p> : null}
                {award.descripcion ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{award.descripcion}</p>
                ) : null}
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
    <footer className="relative border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-3xl font-semibold text-gradient">{profile.nombre}</p>
            <p className="mt-1 text-muted">{profile.titular}</p>
          </div>
          <a href="#inicio" className="text-sm text-muted transition-colors hover:text-fg">
            Volver arriba ↑
          </a>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {profile.nombre}</p>
          <p>Sitio de demostración · contenido de ejemplo</p>
        </div>
      </div>
    </footer>
  );
}
