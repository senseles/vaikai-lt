import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { toSlug } from '@/lib/utils';
import StarRating from '@/components/StarRating';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import ErrorBoundary from '@/components/ErrorBoundary';

interface BurelisPageProps {
  readonly params: { slug: string };
}

export async function generateMetadata({ params }: BurelisPageProps) {
  const item = await prisma.burelis.findUnique({ where: { slug: params.slug } });
  if (!item) return { title: 'Nerastas | Vaikai.lt' };
  const title = `${item.name} — Būrelis ${item.city} | Vaikai.lt`;
  const description = item.description
    ? item.description.slice(0, 155)
    : `${item.name} — būrelis ${item.city} mieste. Atsiliepimai ir vertinimai.`;
  return {
    title,
    description,
    alternates: { canonical: `https://vaikai.lt/bureliai/${item.slug}` },
    openGraph: { title, description, url: `https://vaikai.lt/bureliai/${item.slug}`, siteName: 'Vaikai.lt', locale: 'lt_LT', type: 'website' },
  };
}

export default async function BurelisPage({ params }: BurelisPageProps) {
  const item = await prisma.burelis.findUnique({ where: { slug: params.slug } });
  if (!item) notFound();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Pradžia', item: 'https://vaikai.lt/' },
      { '@type': 'ListItem', position: 2, name: item.city, item: `https://vaikai.lt/${toSlug(item.city)}` },
      { '@type': 'ListItem', position: 3, name: item.name, item: `https://vaikai.lt/bureliai/${item.slug}` },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-page-enter">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <Link href={`/${toSlug(item.city)}?category=bureliai`} className="hover:text-primary transition-colors">{item.city}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{item.name}</span>
      </nav>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                  Būrelis
                </span>
                {item.category && (
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                    {item.category}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{item.name}</h1>
              <Link
                href={`/${toSlug(item.city)}?category=bureliai`}
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
            {item.price && <DetailField icon="price" label="Kaina" value={item.price} />}
            {item.ageRange && <DetailField icon="age" label="Amžiaus grupė" value={item.ageRange} />}
            {item.schedule && <DetailField icon="clock" label="Tvarkaraštis" value={item.schedule} />}
            {item.phone && <DetailField icon="phone" label="Telefonas" value={item.phone} />}
            {item.website && <DetailField icon="web" label="Svetainė" value={item.website} isLink />}
            {item.subcategory && <DetailField icon="tag" label="Kategorija" value={item.subcategory} />}
          </div>

          {item.description && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Aprašymas</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{item.description}</p>
            </div>
          )}

          <hr className="border-gray-200 dark:border-slate-700" />

          <ErrorBoundary>
            <ReviewList itemId={item.id} itemType="burelis" />
          </ErrorBoundary>
          <ErrorBoundary>
            <ReviewForm itemId={item.id} itemType="burelis" />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

const iconPaths: Record<string, string> = {
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  price: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  age: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  web: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  tag: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
};

function DetailField({ icon, label, value, isLink }: { readonly icon: string; readonly label: string; readonly value: string; readonly isLink?: boolean }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
      <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
        <svg className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[icon] ?? iconPaths.clock} />
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
