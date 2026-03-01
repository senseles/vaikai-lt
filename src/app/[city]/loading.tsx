export default function CityLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-6" />

      {/* Title skeleton */}
      <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-4 w-80 bg-gray-200 dark:bg-slate-700 rounded mb-6" />

      {/* Category tabs skeleton */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-28 bg-gray-200 dark:bg-slate-700 rounded-full" />
        ))}
      </div>

      {/* Cards grid skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="h-32 bg-gray-200 dark:bg-slate-700" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
