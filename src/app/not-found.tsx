import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Puslapis nerastas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Atsiprašome, bet šis puslapis neegzistuoja arba buvo perkeltas.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Grįžti į pradžią
        </Link>
      </div>
    </div>
  );
}
