import Link from 'next/link';

interface SuggestButtonProps {
  readonly searchQuery?: string;
  readonly city?: string;
  readonly resultCount: number;
  readonly variant?: 'inline' | 'block';
}

export default function SuggestButton({ searchQuery, city, resultCount, variant = 'block' }: SuggestButtonProps) {
  // Show when results are few (<3) or zero
  if (resultCount >= 3) return null;

  const params = new URLSearchParams();
  if (searchQuery) params.set('name', searchQuery);
  if (city) params.set('city', city);
  const href = `/pasiulyti${params.toString() ? `?${params.toString()}` : ''}`;

  if (variant === 'inline' && resultCount > 0) {
    return (
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Žinote dar? Pasiūlykite naują įrašą mūsų platformai.
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Pasiūlyti
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border border-primary/10 dark:border-primary/20 text-center">
      <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
        {resultCount === 0 ? 'Neradote ko ieškojote?' : 'Nerandi? Pasiūlyk!'}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Pasiūlykite naują įrašą — mes peržiūrėsime ir pridėsime į platformą.
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Pasiūlyti
      </Link>
    </div>
  );
}
