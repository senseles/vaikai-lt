export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 dark:bg-slate-700 rounded mb-6" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl" />
        ))}
      </div>
      <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded-lg mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
