import { getPosts, getProfile, getSettings, getVideos } from '@mario/database/queries';

import {
  FeaturedStories,
  Hero,
  LatestFeed,
  MultimediaStrip,
  SectionAccess,
} from '@/components/home-sections';

export default async function HomePage() {
  const [profile, posts, videos, content] = await Promise.all([
    getProfile(),
    getPosts(),
    getVideos(),
    getSettings(),
  ]);

  return (
    <main>
      <Hero profile={profile} content={content} />
      <FeaturedStories posts={posts} />
      <SectionAccess content={content} />
      <LatestFeed posts={posts} />
      <MultimediaStrip videos={videos} />
    </main>
  );
}
