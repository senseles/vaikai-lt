export default function LoginLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 animate-pulse">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-6">
          <div className="h-8 w-40 bg-gray-200 dark:bg-slate-700 rounded mx-auto" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-slate-700 rounded mx-auto" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
