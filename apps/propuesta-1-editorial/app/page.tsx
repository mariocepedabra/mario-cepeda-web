import { getPosts, getProfile, getVideos } from '@mario/database/queries';

import {
  FeaturedStories,
  Hero,
  LatestFeed,
  MultimediaStrip,
  SectionAccess,
} from '@/components/home-sections';

export default async function HomePage() {
  const [profile, posts, videos] = await Promise.all([
    getProfile(),
    getPosts(),
    getVideos(),
  ]);

  return (
    <main>
      <Hero profile={profile} />
      <FeaturedStories posts={posts} />
      <SectionAccess />
      <LatestFeed posts={posts} />
      <MultimediaStrip videos={videos} />
    </main>
  );
}
