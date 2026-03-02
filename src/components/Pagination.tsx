'use client';

import { useCallback } from 'react';

interface PaginationProps {
  /** Current page number (1-based) */
  readonly currentPage: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Total number of results (for display) */
  readonly totalResults?: number;
  /** Items per page (for "showing X-Y of Z" text) */
  readonly perPage?: number;
  /** Callback when page changes */
  readonly onPageChange: (page: number) => void;
  /** Optional: scroll to top on page change */
  readonly scrollToTop?: boolean;
  /** Optional: label for screen readers */
  readonly ariaLabel?: string;
}

/**
 * Generates the array of page numbers to display, with ellipsis.
 * Examples:
 *   page=1, total=5  -> [1, 2, 3, 4, 5]
 *   page=1, total=10 -> [1, 2, 3, -1, 9, 10]
 *   page=5, total=10 -> [1, 2, -1, 4, 5, 6, -1, 9, 10]
 *   page=10, total=10 -> [1, 2, -1, 8, 9, 10]
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

export default function Pagination({
  currentPage,
  totalPages,
  totalResults,
  perPage = 12,
  onPageChange,
  scrollToTop = true,
  ariaLabel = 'Puslapiu navigacija',
}: PaginationProps) {
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages, onPageChange, scrollToTop]);

  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalResults ?? currentPage * perPage);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-8 space-y-3">
      {/* Result count */}
      {totalResults !== undefined && totalResults > 0 && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Rodoma {start}&ndash;{end} is {totalResults} rezultatu
        </p>
      )}

      <nav aria-label={ariaLabel} className="flex items-center justify-center">
        {/* Desktop: full pagination with page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {/* Previous button */}
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-2 min-h-[40px] text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100 dark:active:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors flex items-center gap-1"
            aria-label="Ankstesnis puslapis"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Ankstesnis</span>
          </button>

          {/* Page numbers */}
          {pageNumbers.map((pageNum, idx) => {
            if (pageNum === -1) {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-10 h-10 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500"
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={isActive}
                aria-label={`Puslapis ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
                className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/25 cursor-default'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 active:bg-gray-200 dark:active:bg-slate-600 border border-gray-200 dark:border-slate-600'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next button */}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-2 min-h-[40px] text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100 dark:active:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors flex items-center gap-1"
            aria-label="Kitas puslapis"
          >
            <span>Kitas</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Mobile: compact pagination */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Previous */}
          <button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2.5 min-h-[44px] text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100 dark:active:bg-slate-600 transition-colors flex items-center gap-1"
            aria-label="Ankstesnis puslapis"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Atgal
          </button>

          {/* Current page indicator */}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums px-2">
            {currentPage} / {totalPages}
          </span>

          {/* Next */}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2.5 min-h-[44px] text-sm font-medium border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100 dark:active:bg-slate-600 transition-colors flex items-center gap-1"
            aria-label="Kitas puslapis"
          >
            Pirmyn
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  );
}
