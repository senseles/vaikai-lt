'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-accent mb-4">Klaida</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Kažkas nutiko ne taip
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Atsiprašome, įvyko nenumatyta klaida. Pabandykite dar kartą.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Bandyti dar kartą
        </button>
      </div>
    </div>
  );
}
