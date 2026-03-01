export default function CategoryLoading() {
  return (
    <>
      {/* Category header skeleton */}
      <section className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="h-4 w-72 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                <div className="h-4 w-28 bg-green-50 dark:bg-green-900/20 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Sort tabs skeleton */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
              <div className="h-9 w-24 bg-white dark:bg-slate-600 rounded-lg animate-pulse" />
              <div className="h-9 w-28 rounded-lg animate-pulse" />
              <div className="h-9 w-24 rounded-lg animate-pulse" />
            </div>
            <div className="h-10 w-44 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </section>

      {/* Post list skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="block p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-start gap-4">
                {/* Vote skeleton */}
                <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-slate-700 animate-pulse" />

                {/* Content skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                  {/* Comment preview skeleton */}
                  <div className="pl-3 border-l-2 border-gray-200 dark:border-slate-600">
                    <div className="h-3 w-4/5 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                  {/* Meta skeleton */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-3 w-16 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                    <div className="h-3 w-10 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                    <div className="h-3 w-10 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
