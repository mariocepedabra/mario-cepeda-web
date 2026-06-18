import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

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

import { FloatingBlob, Reveal } from './interactive';

function Section({
  id,
  index,
  title,
  emoji,
  children,
}: {
  id: string;
  index: string;
  title: string;
  emoji?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <header className="mb-10 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-sun/20 font-display text-sm font-bold text-terra">
              {index}
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {title} {emoji ? <span aria-hidden>{emoji}</span> : null}
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
    <section id="inicio" className="relative overflow-hidden pt-28 sm:pt-36">
      <FloatingBlob color="rgba(232,163,61,0.35)" className="-left-24 top-10 size-72" />
      <FloatingBlob color="rgba(199,94,58,0.25)" className="right-[-6rem] top-40 size-80" duration={20} />
      <FloatingBlob color="rgba(95,125,87,0.20)" className="bottom-0 left-1/3 size-72" duration={24} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-terra shadow-sm">
              <Sparkles className="size-4" /> {profile.titular}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-display text-6xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
              Hola, soy <span className="text-terra">{profile.nombre}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {truncate(profile.bio.replace(/^\[.*?\]\s*/, ''), 220)}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contacto"
                className="rounded-full bg-terra px-7 py-3 font-bold text-white shadow-sm transition-transform hover:scale-105"
              >
                Hablemos
              </a>
              <a
                href="#notas"
                className="rounded-full border-2 border-ink px-7 py-3 font-bold transition-colors hover:bg-ink hover:text-cream"
              >
                Leer mis notas
              </a>
            </div>
          </Reveal>
        </div>

        {profile.foto_url ? (
          <Reveal delay={0.2}>
            <div className="relative mx-auto aspect-square w-full max-w-sm">
              <div className="blob-2 absolute inset-0 bg-gradient-to-br from-sun/40 to-terra/30" />
              <div className="blob relative size-full overflow-hidden border-4 border-white shadow-lg">
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
        <div className="rounded-[2.5rem] border border-line bg-white/60 p-8 shadow-sm sm:p-12">
          <p className="font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">
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
  const colors = ['bg-terra', 'bg-sun', 'bg-sage'];
  return (
    <Section id="trayectoria" index="02" title="Mi trayectoria">
      {experiences.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.06}>
              <div className="h-full rounded-[2rem] border border-line bg-white/60 p-6 shadow-sm transition-transform hover:-translate-y-1">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold text-white ${colors[i % colors.length]}`}
                >
                  {exp.periodo}
                </span>
                <h3 className="mt-3 font-display text-xl font-bold">{exp.titulo}</h3>
                {exp.organizacion ? (
                  <p className="mt-0.5 text-sm font-semibold text-muted">{exp.organizacion}</p>
                ) : null}
                {exp.descripcion ? (
                  <p className="mt-3 leading-relaxed text-muted">{exp.descripcion}</p>
                ) : null}
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
      <div className="overflow-hidden rounded-[2rem] border border-line bg-white/60 shadow-sm transition-transform group-hover:-translate-y-1">
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
        </div>
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-terra">
            {formatDate(post.fecha)}
          </p>
          <h3 className="mt-2 font-display text-xl font-bold leading-tight group-hover:text-terra">
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
            className="mt-10 inline-flex items-center gap-2 font-display font-bold text-terra hover:underline"
          >
            Ver todas las notas <ArrowRight className="size-5" />
          </Link>
        </>
      )}
    </Section>
  );
}

export function PressSection({ press }: { press: Press[] }) {
  return (
    <Section id="prensa" index="04" title="En la prensa">
      {press.length === 0 ? (
        <Empty>Próximamente.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {press.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <a
                href={item.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-center justify-between gap-4 rounded-[1.5rem] border border-line bg-white/60 p-5 shadow-sm transition-transform hover:-translate-y-1"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-terra">
                    {item.medio}
                  </span>
                  <p className="mt-1 font-display text-lg font-bold group-hover:text-terra">
                    {item.titulo}
                  </p>
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
                <div className="overflow-hidden rounded-[2rem] border border-line bg-white/60 shadow-sm">
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
                    <h3 className="font-display text-lg font-bold">{video.titulo}</h3>
                    {video.descripcion ? (
                      <p className="mt-1 text-sm leading-relaxed text-muted">{video.descripcion}</p>
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
                <div className="h-full rounded-[2rem] border border-line bg-white/60 p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-terra">
                    {LINK_CATEGORY_LABELS[group]}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {items.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between rounded-2xl px-3 py-2.5 font-semibold transition-colors hover:bg-cream-2 hover:text-terra"
                        >
                          {link.titulo}
                          <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1" />
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
              <div className="h-full rounded-[2rem] border border-line bg-white/60 p-6 shadow-sm">
                <Star className="size-7 fill-sun text-sun" />
                <p className="mt-3 font-display text-3xl font-extrabold text-terra">
                  {award.anio ?? '—'}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold">{award.titulo}</h3>
                {award.entidad ? (
                  <p className="mt-1 text-sm font-semibold text-muted">{award.entidad}</p>
                ) : null}
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
    <footer className="mt-10 border-t border-line bg-cream-2">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-3xl font-extrabold text-ink">{profile.nombre}</p>
            <p className="mt-1 text-muted">{profile.titular}</p>
          </div>
          <a href="#inicio" className="text-sm font-bold text-muted transition-colors hover:text-terra">
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
