export default function PostLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Back link skeleton */}
      <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-6" />

      {/* Post skeleton */}
      <article className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            {/* Vote buttons skeleton */}
            <div className="hidden sm:flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse" />
              <div className="w-6 h-4 bg-gray-200 dark:bg-slate-600 rounded animate-pulse" />
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse" />
            </div>

            <div className="flex-1 space-y-3">
              {/* Category badge skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-6 w-20 bg-green-50 dark:bg-green-900/20 rounded-full animate-pulse" />
              </div>

              {/* Title skeleton */}
              <div className="h-7 w-3/4 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />

              {/* Meta skeleton */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
              </div>

              {/* Content skeleton */}
              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="h-8 w-24 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-8 w-24 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Comments skeleton */}
      <div className="mt-8 space-y-6">
        {/* Comment form skeleton */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-3">
          <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-100 dark:bg-slate-600 rounded-lg animate-pulse" />
          <div className="h-24 w-full bg-gray-100 dark:bg-slate-600 rounded-lg animate-pulse" />
          <div className="flex justify-end">
            <div className="h-9 w-28 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Comments list skeleton */}
        <div>
          <div className="h-5 w-36 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <div className="w-9 h-20 rounded-lg bg-gray-100 dark:bg-slate-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-full bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-100 dark:bg-slate-600 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
