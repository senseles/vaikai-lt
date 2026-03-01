import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

const BASE_URL = 'https://vaikai.lt';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all distinct cities from all models
  const [kg, au, bu, sp] = await Promise.all([
    prisma.kindergarten.findMany({ select: { city: true }, distinct: ['city'] }),
    prisma.aukle.findMany({ select: { city: true }, distinct: ['city'] }),
    prisma.burelis.findMany({ select: { city: true }, distinct: ['city'] }),
    prisma.specialist.findMany({ select: { city: true }, distinct: ['city'] }),
  ]);

  const citySet = new Set<string>();
  for (const list of [kg, au, bu, sp]) {
    for (const item of list) {
      citySet.add(item.city);
    }
  }

  // Convert city name → slug (same logic as toSlug in utils)
  function toSlug(text: string): string {
    const map: Record<string, string> = {
      ą: 'a', č: 'c', ę: 'e', ė: 'e', į: 'i', š: 's', ų: 'u', ū: 'u', ž: 'z',
      Ą: 'a', Č: 'c', Ę: 'e', Ė: 'e', Į: 'i', Š: 's', Ų: 'u', Ū: 'u', Ž: 'z',
    };
    return text
      .split('')
      .map((c) => map[c] ?? c)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const citySlugs = Array.from(citySet).map(toSlug);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/megstamiausieji`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
  ];

  const cityPages: MetadataRoute.Sitemap = citySlugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages];
}
