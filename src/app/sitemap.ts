import { MetadataRoute } from 'next';
import { CITY_SLUG_LIST } from '@/lib/cities';

const BASE_URL = 'https://vaikai.lt';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/megstamiausieji`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
    { url: `${BASE_URL}/paieska`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/privatumo-politika`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const cityPages: MetadataRoute.Sitemap = CITY_SLUG_LIST.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages];
}
