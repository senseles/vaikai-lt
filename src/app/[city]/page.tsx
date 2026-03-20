import Link from 'next/link';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { CITY_NAMES, CITY_SLUG_LIST } from '@/lib/cities';
import CityPageClient from './CityPageClient';

interface CityPageProps {
  readonly params: { city: string };
  readonly searchParams: { category?: string; type?: string; sort?: string; page?: string; sub?: string; spec?: string; area?: string; price?: string };
}

/** Tell Next.js which city slugs are valid — unknown slugs get 404 before rendering */
export function generateStaticParams() {
  return CITY_SLUG_LIST.map((city) => ({ city }));
}
export const dynamicParams = false;
export const revalidate = 300; // ISR: regenerate every 5 minutes

type SortField = 'rating' | 'name' | 'reviews';

function getOrderBy(sort: SortField): Record<string, 'asc' | 'desc'> {
  switch (sort) {
    case 'rating': return { baseRating: 'desc' };
    case 'reviews': return { baseReviewCount: 'desc' };
    case 'name': return { name: 'asc' };
    default: return { baseRating: 'desc' };
  }
}

const PER_PAGE = 12;

export async function generateMetadata({ params }: CityPageProps) {
  const cityName = CITY_NAMES[params.city];
  if (!cityName) return { title: 'Puslapis nerastas | ManoVaikai.lt' };
  const title = `Darželiai, auklės, būreliai — ${cityName} | ManoVaikai.lt`;
  const description = `Darželių, auklių, būrelių ir specialistų sąrašas ${cityName} mieste. Atsiliepimai ir vertinimai.`;
  const url = `https://manovaikai.lt/${params.city}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { lt: url, 'x-default': url },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'ManoVaikai.lt',
      locale: 'lt_LT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
    },
  };
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const citySlug = params.city;
  const cityName = CITY_NAMES[citySlug];

  // Return 404 for unknown city slugs
  if (!cityName) {
    notFound();
  }

  const category = (searchParams.category ?? 'darzeliai') as 'darzeliai' | 'aukles' | 'bureliai' | 'specialistai';
  const type = searchParams.type ?? '';
  const sort = (searchParams.sort ?? 'rating') as SortField;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const skip = (page - 1) * PER_PAGE;
  const orderBy = getOrderBy(sort);

  // Build where clauses
  const kindergartenWhere: Record<string, unknown> = { city: cityName };
  if (type) kindergartenWhere.type = type;

  const sub = searchParams.sub ?? '';
  const spec = searchParams.spec ?? '';
  const area = searchParams.area ?? '';

  // Apply area filter to all categories
  if (area) kindergartenWhere.area = area;

  const aukleWhere: Record<string, unknown> = { city: cityName };
  if (area) aukleWhere.area = area;

  const burelisWhere: Record<string, unknown> = { city: cityName };
  if (sub) burelisWhere.category = sub;
  if (area) burelisWhere.area = area;

  const specialistWhere: Record<string, unknown> = { city: cityName };
  if (spec) specialistWhere.specialty = { contains: spec, mode: 'insensitive' as const };
  if (area) specialistWhere.area = area;

  // Cache key based on all query params
  const cacheKey = `city-${citySlug}-${category}-${type}-${sort}-${page}-${sub}-${spec}-${area}`;

  const getCityData = unstable_cache(
    async () => {
      const [
        kgAreas_, aukleAreas_, burelisAreas_, specAreas_,
        kindergartens_, kindergartenTotal_, aukles_, aukleTotal_, bureliai_, burelisTotal_, specialists_, specialistTotal_,
        forumPostCount_,
      ] = await Promise.all([
        prisma.kindergarten.findMany({ where: { city: cityName, area: { not: null } }, select: { area: true }, distinct: ['area'] }),
        prisma.aukle.findMany({ where: { city: cityName, area: { not: null } }, select: { area: true }, distinct: ['area'] }),
        prisma.burelis.findMany({ where: { city: cityName, area: { not: null } }, select: { area: true }, distinct: ['area'] }),
        prisma.specialist.findMany({ where: { city: cityName, area: { not: null } }, select: { area: true }, distinct: ['area'] }),
        prisma.kindergarten.findMany({ where: kindergartenWhere, orderBy, skip: category === 'darzeliai' ? skip : 0, take: PER_PAGE }),
        prisma.kindergarten.count({ where: kindergartenWhere }),
        prisma.aukle.findMany({ where: aukleWhere, orderBy, skip: category === 'aukles' ? skip : 0, take: PER_PAGE }),
        prisma.aukle.count({ where: aukleWhere }),
        prisma.burelis.findMany({ where: burelisWhere, orderBy, skip: category === 'bureliai' ? skip : 0, take: PER_PAGE }),
        prisma.burelis.count({ where: burelisWhere }),
        prisma.specialist.findMany({ where: specialistWhere, orderBy, skip: category === 'specialistai' ? skip : 0, take: PER_PAGE }),
        prisma.specialist.count({ where: specialistWhere }),
        prisma.forumPost.count({ where: { city: cityName } }),
      ]);
      return {
        kgAreas: kgAreas_, aukleAreas: aukleAreas_, burelisAreas: burelisAreas_, specAreas: specAreas_,
        kindergartens: kindergartens_, kindergartenTotal: kindergartenTotal_,
        aukles: aukles_, aukleTotal: aukleTotal_,
        bureliai: bureliai_, burelisTotal: burelisTotal_,
        specialists: specialists_, specialistTotal: specialistTotal_,
        forumPostCount: forumPostCount_,
      };
    },
    [cacheKey],
    { revalidate: 300 }
  );

  const {
    kgAreas, aukleAreas, burelisAreas, specAreas,
    kindergartens, kindergartenTotal, aukles, aukleTotal, bureliai, burelisTotal, specialists, specialistTotal,
    forumPostCount,
  } = await getCityData();
  const areaSet = new Set([...kgAreas, ...aukleAreas, ...burelisAreas, ...specAreas].map(a => a.area).filter(Boolean) as string[]);
  const allAreas = Array.from(areaSet).sort((a, b) => a.localeCompare(b, 'lt'));

  // Serialize dates for client component (handles both Date objects and cached strings)
  const serialize = <T extends { createdAt: Date | string; updatedAt?: Date | string }>(items: T[]) =>
    items.map((i) => ({
      ...i,
      createdAt: typeof i.createdAt === 'string' ? i.createdAt : i.createdAt.toISOString(),
      updatedAt: typeof (i as { updatedAt?: Date | string }).updatedAt === 'string'
        ? (i as { updatedAt?: string }).updatedAt ?? ''
        : ((i as { updatedAt?: Date }).updatedAt?.toISOString() ?? ''),
    }));

  const totalPages = {
    darzeliai: Math.max(1, Math.ceil(kindergartenTotal / PER_PAGE)),
    aukles: Math.max(1, Math.ceil(aukleTotal / PER_PAGE)),
    bureliai: Math.max(1, Math.ceil(burelisTotal / PER_PAGE)),
    specialistai: Math.max(1, Math.ceil(specialistTotal / PER_PAGE)),
  };

  // Build LocalBusiness JSON-LD for top kindergartens in this city
  const localBusinessJsonLd = kindergartens.slice(0, 5).map((kg) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://manovaikai.lt/${citySlug}#${kg.slug}`,
    name: kg.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressCountry: 'LT',
      ...(kg.address ? { streetAddress: kg.address } : {}),
    },
    ...(kg.phone ? { telephone: kg.phone } : {}),
    ...(kg.website ? { url: kg.website } : {}),
    ...(kg.baseRating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: kg.baseRating,
        reviewCount: kg.baseReviewCount || 1,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  }));

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pradžia', item: 'https://manovaikai.lt/' },
      { '@type': 'ListItem', position: 2, name: cityName, item: `https://manovaikai.lt/${citySlug}` },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {localBusinessJsonLd.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      )}

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{cityName}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {cityName}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Darželiai: {kindergartenTotal} · Auklės: {aukleTotal} · Būreliai: {burelisTotal} · Specialistai: {specialistTotal}
      </p>

      {forumPostCount > 0 && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <Link
            href={`/forumas?city=${encodeURIComponent(cityName)}`}
            className="inline-flex items-center gap-2 text-[#2d6a4f] dark:text-green-400 font-medium hover:underline"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            Diskusijos apie {cityName}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({forumPostCount} {forumPostCount === 1 ? 'įrašas' : forumPostCount < 10 ? 'įrašai' : 'įrašų'} forume)
            </span>
          </Link>
        </div>
      )}

      <Suspense fallback={
        <div className="animate-pulse">
          <div className="flex gap-2 mb-6">{[1,2,3,4].map(i => <div key={i} className="h-10 w-28 bg-gray-200 dark:bg-slate-700 rounded-full" />)}</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />)}</div>
        </div>
      }>
        <CityPageClient
          citySlug={citySlug}
          kindergartens={serialize(kindergartens) as never[]}
          aukles={serialize(aukles) as never[]}
          bureliai={serialize(bureliai) as never[]}
          specialists={serialize(specialists) as never[]}
          initialCategory={category}
          initialType={type}
          initialSort={sort}
          totalPages={totalPages}
          totalCounts={{
            darzeliai: kindergartenTotal,
            aukles: aukleTotal,
            bureliai: burelisTotal,
            specialistai: specialistTotal,
          }}
          currentPage={page}
          perPage={PER_PAGE}
          areas={allAreas}
        />
      </Suspense>
    </div>
  );
}
