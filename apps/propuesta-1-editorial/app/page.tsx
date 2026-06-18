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

        <section id="contacto" className="scroll-mt-20 border-t border-line py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Reveal>
              <header className="mb-12 flex items-baseline gap-4">
                <span className="font-display text-lg text-accent">08</span>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Contacto
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
