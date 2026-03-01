export default function ForumLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-[#2d6a4f] to-[#40916c] py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="h-10 w-64 bg-white/20 rounded-lg animate-pulse mx-auto mb-3" />
          <div className="h-5 w-96 max-w-full bg-white/15 rounded-lg animate-pulse mx-auto mb-6" />
          <div className="h-12 w-48 bg-white/20 rounded-xl animate-pulse mx-auto mb-6" />
          <div className="flex items-center justify-center gap-6">
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="h-8 w-40 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top posts skeleton */}
      <section className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse mb-6" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-16 bg-green-50 dark:bg-green-900/20 rounded-full animate-pulse" />
                        <div className="h-3 w-20 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 space-y-2">
                  <div className="h-4 w-full bg-gray-100 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
