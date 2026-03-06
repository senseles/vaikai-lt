'use client';

export default function CardSkeleton({ count = 6 }: { readonly count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse"
        >
          <div className="h-36 bg-gray-200 dark:bg-slate-700" />
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
              <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-full w-16" />
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-full w-12" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
