import Link from 'next/link';
import prisma from '@/lib/prisma';
import CityPageClient from './CityPageClient';

interface CityPageProps {
  readonly params: { city: string };
  readonly searchParams: { category?: string; type?: string; sort?: string; page?: string };
}

const cityNames: Record<string, string> = {
  vilnius: 'Vilnius', kaunas: 'Kaunas', klaipeda: 'Klaipėda',
  siauliai: 'Šiauliai', panevezys: 'Panevėžys', palanga: 'Palanga',
  silute: 'Šilutė', taurage: 'Tauragė', telsiai: 'Telšiai',
  mazeikiai: 'Mažeikiai', kedainiai: 'Kėdainiai', marijampole: 'Marijampolė',
  utena: 'Utena', alytus: 'Alytus', jonava: 'Jonava',
  visaginas: 'Visaginas', druskininkai: 'Druskininkai', elektrenai: 'Elektrėnai',
  ukmerge: 'Ukmergė',
};

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
  const cityName = cityNames[params.city] ?? params.city;
  return {
    title: `Darželiai, auklės, būreliai — ${cityName} | Vaikai.lt`,
    description: `Darželių, auklių, būrelių ir specialistų sąrašas ${cityName} mieste. Atsiliepimai ir vertinimai.`,
  };
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const citySlug = params.city;
  const cityName = cityNames[citySlug] ?? citySlug;
  const category = (searchParams.category ?? 'darzeliai') as 'darzeliai' | 'aukles' | 'bureliai' | 'specialistai';
  const type = searchParams.type ?? '';
  const sort = (searchParams.sort ?? 'rating') as SortField;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const skip = (page - 1) * PER_PAGE;
  const orderBy = getOrderBy(sort);

  // Build where clauses
  const kindergartenWhere: Record<string, unknown> = { city: cityName };
  if (type) kindergartenWhere.type = type;

  const cityWhere = { city: cityName };

  // Fetch data for active category + counts for all
  const [kindergartens, kindergartenTotal, aukles, aukleTotal, bureliai, burelisTotal, specialists, specialistTotal] = await Promise.all([
    category === 'darzeliai'
      ? prisma.kindergarten.findMany({ where: kindergartenWhere, orderBy, skip, take: PER_PAGE })
      : Promise.resolve([]),
    prisma.kindergarten.count({ where: kindergartenWhere }),
    category === 'aukles'
      ? prisma.aukle.findMany({ where: cityWhere, orderBy, skip, take: PER_PAGE })
      : Promise.resolve([]),
    prisma.aukle.count({ where: cityWhere }),
    category === 'bureliai'
      ? prisma.burelis.findMany({ where: cityWhere, orderBy, skip, take: PER_PAGE })
      : Promise.resolve([]),
    prisma.burelis.count({ where: cityWhere }),
    category === 'specialistai'
      ? prisma.specialist.findMany({ where: cityWhere, orderBy, skip, take: PER_PAGE })
      : Promise.resolve([]),
    prisma.specialist.count({ where: cityWhere }),
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
      />
    </div>
  );
}
