import { MetadataRoute } from 'next';

const BASE_URL = 'https://vaikai.lt';

/** Only include cities that have valid routes (match VALID_CITY_SLUGS in middleware + cityNames in [city]/page.tsx) */
const VALID_CITY_SLUGS = [
  'vilnius', 'kaunas', 'klaipeda', 'siauliai', 'panevezys', 'palanga',
  'silute', 'taurage', 'telsiai', 'mazeikiai', 'kedainiai', 'marijampole',
  'utena', 'alytus', 'jonava', 'visaginas', 'druskininkai', 'elektrenai',
  'ukmerge', 'akmene', 'anyksciai', 'birzai', 'ignalina', 'joniskis',
  'jurbarkas', 'kaisiadorys', 'kelme', 'kretinga', 'kupiskis', 'lazdijai',
  'moletai', 'pakruojis', 'pasvalys', 'plunge', 'prienai', 'radviliskis',
  'raseiniai', 'rokiskis', 'trakai', 'varena', 'vilkaviskis', 'zarasai',
  'sakiai',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/megstamiausieji`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${BASE_URL}/paieska`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE_URL}/privatumo-politika`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const cityPages: MetadataRoute.Sitemap = VALID_CITY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages];
}
