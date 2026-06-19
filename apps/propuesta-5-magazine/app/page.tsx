import {
  getAwards,
  getExperiences,
  getLinks,
  getPosts,
  getPress,
  getProfile,
  getVideos,
} from '@mario/database/queries';

import { Navbar } from '@/components/interactive';
import {
  Awards,
  Footer,
  Hero,
  InsiderBand,
  LinksSection,
  Multimedia,
  PersonalIntro,
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
        <Hero profile={profile} posts={posts.slice(0, 3)} />
        <PersonalIntro profile={profile} />
        <PostsPreview posts={posts.slice(3)} />
        <Timeline experiences={experiences} />
        <Awards awards={awards} />
        <PressSection press={press} />
        <Multimedia videos={videos} />
        <LinksSection links={links} />
        <InsiderBand profile={profile} />
      </main>
      <Footer profile={profile} />
    </>
  );
}
