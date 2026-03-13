import { MetadataRoute } from 'next';
import { CITY_SLUG_LIST } from '@/lib/cities';
import prisma from '@/lib/prisma';

const BASE_URL = 'https://vaikai.lt';

const CATEGORIES = ['darzeliai', 'aukles', 'bureliai', 'specialistai'] as const;

/**
 * Generate sitemap index entries.
 * ID 0: static pages + city pages (with category variants)
 * ID 1: forum pages (categories + individual posts)
 */
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }];
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  if (id === 0) {
    return generateStaticAndCitySitemap();
  }
  if (id === 1) {
    return generateForumSitemap();
  }
  return [];
}

async function generateStaticAndCitySitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/paieska`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/privatumo-politika`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Base city pages (no category filter)
  const cityPages: MetadataRoute.Sitemap = CITY_SLUG_LIST.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // City + category pages: /{city}?category=darzeliai, etc.
  const cityCategoryPages: MetadataRoute.Sitemap = CITY_SLUG_LIST.flatMap((slug) =>
    CATEGORIES.map((category) => ({
      url: `${BASE_URL}/${slug}?category=${category}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...cityPages, ...cityCategoryPages];
}

async function generateForumSitemap(): Promise<MetadataRoute.Sitemap> {
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

  const latestForumDate = forumPosts.length > 0
    ? forumPosts[0].updatedAt
    : new Date();

  const forumMainPage: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/forumas`,
      lastModified: latestForumDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const forumCategoryPages: MetadataRoute.Sitemap = forumCategories.map((cat) => {
    const latestPost = forumPosts.find((p) => p.category.slug === cat.slug);
    return {
      url: `${BASE_URL}/forumas/${cat.slug}`,
      lastModified: latestPost?.updatedAt ?? cat.createdAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    };
  });

  const forumPostPages: MetadataRoute.Sitemap = forumPosts.map((post) => ({
    url: `${BASE_URL}/forumas/${post.category.slug}/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [...forumMainPage, ...forumCategoryPages, ...forumPostPages];
}
