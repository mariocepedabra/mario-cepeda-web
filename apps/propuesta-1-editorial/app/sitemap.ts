import type { MetadataRoute } from 'next';

import { getNarinoProfiles, getPosts } from '@mario/database/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
  const [posts, narino] = await Promise.all([getPosts(), getNarinoProfiles()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/pensamiento',
    '/trabajo',
    '/libros',
    '/narino',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/pensamiento/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const narinoRoutes: MetadataRoute.Sitemap = narino.map((p) => ({
    url: `${base}/narino/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...narinoRoutes];
}
