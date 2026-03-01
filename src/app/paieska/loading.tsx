export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      {/* Search header skeleton */}
      <div className="h-8 w-64 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-5 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-8" />

      {/* Results skeleton */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
            <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
