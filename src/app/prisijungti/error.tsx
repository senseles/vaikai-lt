'use client';

import Link from 'next/link';

export default function LoginError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Prisijungimo klaida
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Nepavyko įkelti prisijungimo puslapio. Pabandykite dar kartą.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Bandyti dar kartą
          </button>
          <Link
            href="/"
            className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Grįžti į pradžią
          </Link>
        </div>
      </div>
    </div>
  );
}
