export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-primary-bg via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-10 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="h-6 w-64 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-6" />
          <div className="h-10 w-96 max-w-full bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-4" />
          <div className="h-5 w-80 max-w-full bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-8" />
          {/* Search bar skeleton */}
          <div className="h-14 max-w-2xl bg-white dark:bg-slate-800 rounded-2xl mx-auto border border-gray-200 dark:border-slate-700" />
          {/* Stats skeleton */}
          <div className="mt-8 sm:mt-14 grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center min-h-[4.5rem] sm:min-h-[5rem]">
                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded mb-1" />
                <div className="h-6 w-12 bg-gray-200 dark:bg-slate-700 rounded mb-1" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Forum CTA skeleton */}
      <section className="bg-white dark:bg-slate-800 border-y border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-10 text-center">
          <div className="h-7 w-72 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-3" />
          <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-5" />
          <div className="h-12 w-52 bg-gray-200 dark:bg-slate-700 rounded-xl mx-auto" />
        </div>
      </section>

      {/* City selector skeleton */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
