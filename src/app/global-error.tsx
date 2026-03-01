'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="lt">
      <body className="bg-white dark:bg-slate-900">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <p className="text-6xl font-bold text-red-500 mb-4">Klaida</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Kažkas nutiko ne taip
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Atsiprašome, įvyko nenumatyta klaida. Pabandykite perkrauti puslapį.
            </p>
            <button
              onClick={reset}
              className="inline-block bg-green-700 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Bandyti dar kartą
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
