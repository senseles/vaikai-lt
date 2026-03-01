import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import CityPageClient from './CityPageClient';

interface CityPageProps {
  readonly params: { city: string };
  readonly searchParams: { category?: string; type?: string; sort?: string; page?: string; sub?: string; spec?: string; area?: string; price?: string };
}

const cityNames: Record<string, string> = {
  vilnius: 'Vilnius', kaunas: 'Kaunas', klaipeda: 'Klaipėda',
  siauliai: 'Šiauliai', panevezys: 'Panevėžys', palanga: 'Palanga',
  silute: 'Šilutė', taurage: 'Tauragė', telsiai: 'Telšiai',
  mazeikiai: 'Mažeikiai', kedainiai: 'Kėdainiai', marijampole: 'Marijampolė',
  utena: 'Utena', alytus: 'Alytus', jonava: 'Jonava',
  visaginas: 'Visaginas', druskininkai: 'Druskininkai', elektrenai: 'Elektrėnai',
  ukmerge: 'Ukmergė', akmene: 'Akmenė', anyksciai: 'Anykščiai',
  birzai: 'Biržai', ignalina: 'Ignalina', joniskis: 'Joniškis',
  jurbarkas: 'Jurbarkas', kaisiadorys: 'Kaišiadorys', kelme: 'Kelmė',
  kretinga: 'Kretinga', kupiskis: 'Kupiškis', lazdijai: 'Lazdijai',
  moletai: 'Molėtai', pakruojis: 'Pakruojis', pasvalys: 'Pasvalys',
  plunge: 'Plungė', prienai: 'Prienai', radviliskis: 'Radviliškis',
  raseiniai: 'Raseiniai', rokiskis: 'Rokiškis', trakai: 'Trakai',
  varena: 'Varėna', vilkaviskis: 'Vilkaviškis', zarasai: 'Zarasai',
  sakiai: 'Šakiai',
};

/** Tell Next.js which city slugs are valid — unknown slugs get 404 before rendering */
export function generateStaticParams() {
  return Object.keys(cityNames).map((city) => ({ city }));
}
export const dynamicParams = false;

type SortField = 'rating' | 'name' | 'reviews' | 'price_asc' | 'price_desc';

function getOrderBy(sort: SortField): Record<string, 'asc' | 'desc'> {
  switch (sort) {
    case 'rating': return { baseRating: 'desc' };
    case 'reviews': return { baseReviewCount: 'desc' };
    case 'name': return { name: 'asc' };
    case 'price_asc': return { baseRating: 'asc' };  // fallback — price is string, sorted client-side
    case 'price_desc': return { baseRating: 'desc' };
    default: return { baseRating: 'desc' };
  }
}

const PER_PAGE = 12;

export async function generateMetadata({ params }: CityPageProps) {
  const cityName = cityNames[params.city];
  if (!cityName) return { title: 'Puslapis nerastas | Vaikai.lt' };
  const title = `Darželiai, auklės, būreliai — ${cityName} | Vaikai.lt`;
  const description = `Darželių, auklių, būrelių ir specialistų sąrašas ${cityName} mieste. Atsiliepimai ir vertinimai.`;
  const url = `https://vaikai.lt/${params.city}`;
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
      siteName: 'Vaikai.lt',
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
  const cityName = cityNames[citySlug];

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
  if (spec) specialistWhere.specialty = { contains: spec };
  if (area) specialistWhere.area = area;

  // Fetch distinct areas for this city (from all entity types)
  const [kgAreas, aukleAreas, burelisAreas, specAreas] = await Promise.all([
    prisma.kindergarten.findMany({ where: { city: cityName, area: { not: null } }, select: { area: true }, distinct: ['area'] }),
    prisma.aukle.findMany({ where: { city: cityName, area: { not: null } }, select: { area: true }, distinct: ['area'] }),
    prisma.burelis.findMany({ where: { city: cityName, area: { not: null } }, select: { area: true }, distinct: ['area'] }),
    prisma.specialist.findMany({ where: { city: cityName, area: { not: null } }, select: { area: true }, distinct: ['area'] }),
  ]);
  const areaSet = new Set([...kgAreas, ...aukleAreas, ...burelisAreas, ...specAreas].map(a => a.area).filter(Boolean) as string[]);
  const allAreas = Array.from(areaSet).sort((a, b) => a.localeCompare(b, 'lt'));

  // Fetch data for ALL categories so every tab has data ready
  const [kindergartens, kindergartenTotal, aukles, aukleTotal, bureliai, burelisTotal, specialists, specialistTotal] = await Promise.all([
    prisma.kindergarten.findMany({ where: kindergartenWhere, orderBy, skip: category === 'darzeliai' ? skip : 0, take: PER_PAGE }),
    prisma.kindergarten.count({ where: kindergartenWhere }),
    prisma.aukle.findMany({ where: aukleWhere, orderBy, skip: category === 'aukles' ? skip : 0, take: PER_PAGE }),
    prisma.aukle.count({ where: aukleWhere }),
    prisma.burelis.findMany({ where: burelisWhere, orderBy, skip: category === 'bureliai' ? skip : 0, take: PER_PAGE }),
    prisma.burelis.count({ where: burelisWhere }),
    prisma.specialist.findMany({ where: specialistWhere, orderBy, skip: category === 'specialistai' ? skip : 0, take: PER_PAGE }),
    prisma.specialist.count({ where: specialistWhere }),
  ]);

  // Serialize dates for client component
  const serialize = <T extends { createdAt: Date; updatedAt?: Date }>(items: T[]) =>
    items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString(), updatedAt: (i as { updatedAt?: Date }).updatedAt?.toISOString() ?? '' }));

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
    '@id': `https://vaikai.lt/${citySlug}#${kg.slug}`,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* JSON-LD structured data for kindergartens */}
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
        currentPage={page}
        areas={allAreas}
      />
    </div>
  );
}
