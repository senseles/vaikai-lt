import Link from 'next/link';

export default function ForumPostNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-[#2d6a4f] mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Įrašas nerastas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Šis forumo įrašas neegzistuoja arba buvo ištrintas.
        </p>
        <Link
          href="/forumas"
          className="inline-block bg-[#2d6a4f] hover:bg-[#40916c] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Grįžti į forumą
        </Link>
      </div>
    </div>
  );
}
