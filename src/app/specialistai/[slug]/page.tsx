import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { toSlug } from '@/lib/utils';
import StarRating from '@/components/StarRating';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import ErrorBoundary from '@/components/ErrorBoundary';

interface SpecialistPageProps {
  readonly params: { slug: string };
}

export async function generateMetadata({ params }: SpecialistPageProps) {
  const item = await prisma.specialist.findUnique({ where: { slug: params.slug } });
  if (!item) return { title: 'Nerastas | ManoVaikai.lt' };
  const title = `${item.name}${item.specialty ? ` — ${item.specialty}` : ''} ${item.city} | ManoVaikai.lt`;
  const description = item.description
    ? item.description.slice(0, 155)
    : `${item.name}${item.specialty ? ` (${item.specialty})` : ''} — specialistas ${item.city} mieste. Atsiliepimai ir vertinimai.`;
  return {
    title,
    description,
    alternates: { canonical: `https://manovaikai.lt/specialistai/${item.slug}` },
    openGraph: { title, description, url: `https://manovaikai.lt/specialistai/${item.slug}`, siteName: 'ManoVaikai.lt', locale: 'lt_LT', type: 'website' },
  };
}

export default async function SpecialistPage({ params }: SpecialistPageProps) {
  const item = await prisma.specialist.findUnique({ where: { slug: params.slug } });
  if (!item) notFound();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pradžia', item: 'https://manovaikai.lt/' },
      { '@type': 'ListItem', position: 2, name: item.city, item: `https://manovaikai.lt/${toSlug(item.city)}` },
      { '@type': 'ListItem', position: 3, name: item.name, item: `https://manovaikai.lt/specialistai/${item.slug}` },
    ],
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: item.name,
    ...(item.specialty ? { medicalSpecialty: item.specialty } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: item.city,
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-page-enter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <Link href={`/${toSlug(item.city)}?category=specialistai`} className="hover:text-primary transition-colors">{item.city}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{item.name}</span>
      </nav>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
                  Specialistas
                </span>
                {item.specialty && (
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400">
                    {item.specialty}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{item.name}</h1>
              <Link
                href={`/${toSlug(item.city)}?category=specialistai`}
                className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1 hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.city}
              </Link>
            </div>
            {item.baseRating > 0 && (
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{item.baseRating.toFixed(1)}</div>
                <StarRating rating={item.baseRating} />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.baseReviewCount} {item.baseReviewCount === 1 ? 'atsiliepimas' : 'atsiliepimai'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.clinic && <DetailField icon="clinic" label="Klinika" value={item.clinic} />}
            {item.price && <DetailField icon="price" label="Kaina" value={item.price} />}
            {item.phone && <DetailField icon="phone" label="Telefonas" value={item.phone} />}
            {item.website && <DetailField icon="web" label="Svetainė" value={item.website} isLink />}
            {item.languages && <DetailField icon="language" label="Kalbos" value={item.languages} />}
          </div>

          {item.description && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Aprašymas</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
            </div>
          )}

          <hr className="border-gray-200 dark:border-slate-700" />

          <ErrorBoundary>
            <ReviewList itemId={item.id} itemType="specialist" />
          </ErrorBoundary>
          <ErrorBoundary>
            <ReviewForm itemId={item.id} itemType="specialist" />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

const iconPaths: Record<string, string> = {
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  price: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  clinic: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  web: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  language: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
};

function DetailField({ icon, label, value, isLink }: { readonly icon: string; readonly label: string; readonly value: string; readonly isLink?: boolean }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
      <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
        <svg className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon] ?? iconPaths.phone} />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        {isLink ? (
          <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline break-all">
            {value}
          </a>
        ) : (
          <div className="text-sm font-medium text-gray-900 dark:text-white break-words">{value}</div>
        )}
      </div>
    </div>
  );
}
