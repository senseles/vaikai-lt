export default function BurelisLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-pulse">
      <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded mb-6" />
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 sm:p-8">
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-16 bg-purple-200 dark:bg-purple-800/40 rounded-full" />
            <div className="h-5 w-20 bg-indigo-200 dark:bg-indigo-800/40 rounded-full" />
          </div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-slate-600 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-slate-600 rounded" />
        </div>
        <div className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700/50 rounded-xl" />
            ))}
          </div>
          <div className="h-24 bg-gray-100 dark:bg-slate-700/50 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
