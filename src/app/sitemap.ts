import { MetadataRoute } from 'next';
import { CITY_SLUG_LIST, CITY_NAMES } from '@/lib/cities';
import prisma from '@/lib/prisma';

const BASE_URL = 'https://manovaikai.lt';

const CATEGORIES = ['darzeliai', 'aukles', 'bureliai', 'specialistai'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/paieska`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/pasiulyti`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/megstamiausieji`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/prisijungti`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/registracija`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/privatumo-politika`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // City pages
  const cityPages: MetadataRoute.Sitemap = CITY_SLUG_LIST.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // City + category pages
  const cityCategoryPages: MetadataRoute.Sitemap = CITY_SLUG_LIST.flatMap((slug) =>
    CATEGORIES.map((category) => ({
      url: `${BASE_URL}/${slug}?category=${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  // Build city name → slug reverse map
  const cityNameToSlug: Record<string, string> = {};
  for (const [slug, name] of Object.entries(CITY_NAMES)) {
    cityNameToSlug[name as string] = slug;
  }

  // Entity detail pages
  const [kindergartens, aukles, bureliai, specialists] = await Promise.all([
    prisma.kindergarten.findMany({ select: { slug: true, city: true, updatedAt: true } }),
    prisma.aukle.findMany({ select: { slug: true, city: true, updatedAt: true } }),
    prisma.burelis.findMany({ select: { slug: true, city: true, updatedAt: true } }),
    prisma.specialist.findMany({ select: { slug: true, city: true, updatedAt: true } }),
  ]);

  const entityPages: MetadataRoute.Sitemap = [
    ...kindergartens.map((e) => ({
      url: `${BASE_URL}/${cityNameToSlug[e.city] ?? 'vilnius'}/darzeliai/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...aukles.map((e) => ({
      url: `${BASE_URL}/${cityNameToSlug[e.city] ?? 'vilnius'}/aukles/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...bureliai.map((e) => ({
      url: `${BASE_URL}/${cityNameToSlug[e.city] ?? 'vilnius'}/bureliai/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...specialists.map((e) => ({
      url: `${BASE_URL}/${cityNameToSlug[e.city] ?? 'vilnius'}/specialistai/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];

  // Forum pages
  const [forumCategories, forumPosts] = await Promise.all([
    prisma.forumCategory.findMany({
      select: { slug: true, createdAt: true },
      orderBy: { order: 'asc' },
    }),
    prisma.forumPost.findMany({
      select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const latestForumDate = forumPosts.length > 0 ? forumPosts[0].updatedAt : new Date();

  const forumPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/forumas`,
      lastModified: latestForumDate,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    ...forumCategories.map((cat) => {
      const latestPost = forumPosts.find((p) => p.category.slug === cat.slug);
      return {
        url: `${BASE_URL}/forumas/${cat.slug}`,
        lastModified: latestPost?.updatedAt ?? cat.createdAt,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      };
    }),
    ...forumPosts.map((post) => ({
      url: `${BASE_URL}/forumas/${post.category.slug}/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];

  return [
    ...staticPages,
    ...cityPages,
    ...cityCategoryPages,
    ...entityPages,
    ...forumPages,
  ];
}
