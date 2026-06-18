import {
  getAwards,
  getExperiences,
  getLinks,
  getPosts,
  getPress,
  getProfile,
  getVideos,
} from '@mario/database/queries';

import { ContactForm, Navbar, Reveal } from '@/components/interactive';
import {
  About,
  Awards,
  Footer,
  Hero,
  LinksSection,
  Multimedia,
  PostsPreview,
  PressSection,
  Timeline,
} from '@/components/sections';

export default async function HomePage() {
  const [profile, experiences, posts, press, videos, links, awards] = await Promise.all([
    getProfile(),
    getExperiences(),
    getPosts(),
    getPress(),
    getVideos(),
    getLinks(),
    getAwards(),
  ]);

  return (
    <>
      <Navbar name={profile.nombre} />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Timeline experiences={experiences} />
        <PostsPreview posts={posts.slice(0, 3)} />
        <PressSection press={press} />
        <Multimedia videos={videos} />
        <LinksSection links={links} />
        <Awards awards={awards} />

        <section id="contacto" className="scroll-mt-24 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal>
              <header className="mb-10 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-sun/20 font-display text-sm font-bold text-terra">
                  08
                </span>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Hablemos
                </h2>
              </header>
            </Reveal>
            <Reveal delay={0.1}>
              <ContactForm redes={profile.redes} />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer profile={profile} />
    </>
  );
}
