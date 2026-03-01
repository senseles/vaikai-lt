export default function FavoritesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
      <div className="h-4 w-72 bg-gray-200 dark:bg-slate-700 rounded mb-8" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="h-32 bg-gray-200 dark:bg-slate-700" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
