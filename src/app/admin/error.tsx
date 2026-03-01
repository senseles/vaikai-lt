'use client';

import Link from 'next/link';

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Administravimo klaida
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Nepavyko įkelti administravimo skydelio. Patikrinkite prisijungimo duomenis ir bandykite dar kartą.
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
