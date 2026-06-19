import type { MetadataRoute } from 'next';

import { getPosts } from '@mario/database/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const posts = await getPosts();

  const staticRoutes: MetadataRoute.Sitemap = ['', '/notas'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/notas/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
