import Link from 'next/link';

interface PaginationServerProps {
  /** Current page number (1-based) */
  readonly currentPage: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Total number of results (for display) */
  readonly totalResults?: number;
  /** Items per page (for "showing X-Y of Z" text) */
  readonly perPage?: number;
  /** Function to build href for a given page number */
  readonly buildHref: (page: number) => string;
  /** Optional: label for screen readers */
  readonly ariaLabel?: string;
}

/**
 * Generates the array of page numbers to display, with ellipsis.
 * Returns -1 for ellipsis markers.
 */
function getPageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: number[] = [];

  // Always show first 2 pages
  pages.push(1, 2);

  // Calculate the window around current page
  const windowStart = Math.max(3, current - 1);
  const windowEnd = Math.min(total - 2, current + 1);

  // Add ellipsis before window if needed
  if (windowStart > 3) {
    pages.push(-1);
  }

  // Add window pages
  for (let i = windowStart; i <= windowEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis after window if needed
  if (windowEnd < total - 2) {
    pages.push(-1);
  }

  // Always show last 2 pages
  if (!pages.includes(total - 1)) pages.push(total - 1);
  if (!pages.includes(total)) pages.push(total);

  return pages;
}

export default function PaginationServer({
  currentPage,
  totalPages,
  totalResults,
  perPage = 20,
  buildHref,
  ariaLabel = 'Puslapiu navigacija',
}: PaginationServerProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalResults ?? currentPage * perPage);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-6 sm:mt-8 space-y-3">
      {/* Result count */}
      {totalResults !== undefined && totalResults > 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Rodoma {start}&ndash;{end} is {totalResults} irasu
        </p>
      )}

      <nav aria-label={ariaLabel} className="flex items-center justify-center">
        {/* Desktop: full pagination with page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {/* Previous button */}
          {currentPage > 1 ? (
            <Link
              href={buildHref(currentPage - 1)}
              className="px-3 py-2 min-h-[40px] text-sm font-medium border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100 dark:active:bg-slate-600 transition-colors flex items-center gap-1"
              aria-label="Ankstesnis puslapis"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Ankstesnis</span>
            </Link>
          ) : (
            <span
              className="px-3 py-2 min-h-[40px] text-sm font-medium border border-gray-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 rounded-lg opacity-30 cursor-not-allowed flex items-center gap-1"
              aria-disabled="true"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Ankstesnis</span>
            </span>
          )}

          {/* Page numbers */}
          {pageNumbers.map((pageNum, idx) => {
            if (pageNum === -1) {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-10 h-10 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = pageNum === currentPage;
            if (isActive) {
              return (
                <span
                  key={pageNum}
                  aria-label={`Puslapis ${pageNum}`}
                  aria-current="page"
                  className="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg bg-[#2d6a4f] text-white shadow-sm cursor-default"
                >
                  {pageNum}
                </span>
              );
            }

            return (
              <Link
                key={pageNum}
                href={buildHref(pageNum)}
                aria-label={`Puslapis ${pageNum}`}
                className="w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 border border-gray-200 dark:border-slate-700 transition-colors"
              >
                {pageNum}
              </Link>
            );
          })}

          {/* Next button */}
          {currentPage < totalPages ? (
            <Link
              href={buildHref(currentPage + 1)}
              className="px-3 py-2 min-h-[40px] text-sm font-medium border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100 dark:active:bg-slate-600 transition-colors flex items-center gap-1"
              aria-label="Kitas puslapis"
            >
              <span>Kitas</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span
              className="px-3 py-2 min-h-[40px] text-sm font-medium border border-gray-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 rounded-lg opacity-30 cursor-not-allowed flex items-center gap-1"
              aria-disabled="true"
            >
              <span>Kitas</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>

        {/* Mobile: compact pagination */}
        <div className="flex sm:hidden items-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={buildHref(currentPage - 1)}
              className="px-4 py-2.5 min-h-[44px] text-sm font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              aria-label="Ankstesnis puslapis"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Atgal
            </Link>
          ) : (
            <span className="px-4 py-2.5 min-h-[44px] text-sm font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 rounded-lg opacity-30 cursor-not-allowed flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Atgal
            </span>
          )}

          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tabular-nums px-2">
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={buildHref(currentPage + 1)}
              className="px-4 py-2.5 min-h-[44px] text-sm font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              aria-label="Kitas puslapis"
            >
              Pirmyn
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="px-4 py-2.5 min-h-[44px] text-sm font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 rounded-lg opacity-30 cursor-not-allowed flex items-center gap-1">
              Pirmyn
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}
