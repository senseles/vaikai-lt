import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { CITY_NAMES } from '@/lib/cities';
import StarRating from '@/components/StarRating';
import FavoriteButton from '@/components/FavoriteButton';
import EntityPageShell from '@/components/EntityPageShell';

interface PageProps {
  readonly params: { city: string; slug: string };
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cityName = CITY_NAMES[params.city];
  if (!cityName) notFound();

  const item = await prisma.burelis.findUnique({ where: { slug: params.slug } });
  if (!item || item.city !== cityName) notFound();

  const title = `${item.name} — būrelis ${cityName} | Vaikai.lt`;
  const description = item.description
    ? item.description.slice(0, 160)
    : `${item.name}${item.category ? ` (${item.category})` : ''} — būrelis ${cityName} mieste. Atsiliepimai ir vertinimai.`;
  const url = `https://vaikai.lt/${params.city}/bureliai/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url, languages: { lt: url, 'x-default': url } },
    openGraph: { title, description, url, siteName: 'Vaikai.lt', locale: 'lt_LT', type: 'website' },
    twitter: { card: 'summary_large_image' as const, title, description },
  };
}

export default async function BurelisPage({ params }: PageProps) {
  const cityName = CITY_NAMES[params.city];
  if (!cityName) notFound();

  const item = await prisma.burelis.findUnique({ where: { slug: params.slug } });
  if (!item || item.city !== cityName) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: item.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressCountry: 'LT',
    },
    ...(item.phone ? { telephone: item.phone } : {}),
    ...(item.website ? { url: item.website } : {}),
    ...(item.baseRating > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: item.baseRating,
        reviewCount: item.baseReviewCount || 1,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pradžia', item: 'https://vaikai.lt/' },
      { '@type': 'ListItem', position: 2, name: cityName, item: `https://vaikai.lt/${params.city}` },
      { '@type': 'ListItem', position: 3, name: 'Būreliai', item: `https://vaikai.lt/${params.city}?category=bureliai` },
      { '@type': 'ListItem', position: 4, name: item.name },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <Link href={`/${params.city}`} className="hover:text-primary transition-colors">{cityName}</Link>
        <span className="mx-2">/</span>
        <Link href={`/${params.city}?category=bureliai`} className="hover:text-primary transition-colors">Būreliai</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{item.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white break-words">{item.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{cityName}{item.area ? `, ${item.area}` : ''}</p>
          </div>
          <FavoriteButton itemId={item.id} itemType="burelis" />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {item.category && (
            <span className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-full font-medium">{item.category}</span>
          )}
          {item.ageRange && (
            <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full">{item.ageRange}</span>
          )}
        </div>
        {item.baseRating > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <StarRating rating={item.baseRating} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {item.baseRating.toFixed(1)} ({item.baseReviewCount} {item.baseReviewCount === 1 ? 'atsiliepimas' : 'atsiliepimai'})
            </span>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informacija</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {item.category && <InfoItem label="Kategorija" value={item.category} />}
          {item.subcategory && <InfoItem label="Subkategorija" value={item.subcategory} />}
          {item.price && <InfoItem label="Kaina" value={item.price} />}
          {item.ageRange && <InfoItem label="Amžiaus grupė" value={item.ageRange} />}
          {item.schedule && <InfoItem label="Tvarkaraštis" value={item.schedule} />}
          {item.phone && <InfoItem label="Telefonas" value={item.phone} />}
          {item.website && <InfoItem label="Svetainė" value={item.website} link />}
          {item.area && <InfoItem label="Rajonas" value={item.area} />}
        </dl>
        {item.description && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
          </div>
        )}
      </div>

      {/* Interactive: Reviews, Share (no map for bureliai) */}
      <EntityPageShell
        itemId={item.id}
        itemType="burelis"
        itemName={item.name}
        itemCity={item.city}
        baseRating={item.baseRating}
      />

      {/* Back link */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
        <Link
          href={`/${params.city}?category=bureliai`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Grįžti į {cityName} būrelių sąrašą
        </Link>
      </div>
    </div>
  );
}

function InfoItem({ label, value, link = false }: { label: string; value: string; link?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{label}</dt>
      {link ? (
        <dd>
          <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
            {value}
          </a>
        </dd>
      ) : (
        <dd className="text-gray-900 dark:text-gray-200 break-words">{value}</dd>
      )}
    </div>
  );
}
