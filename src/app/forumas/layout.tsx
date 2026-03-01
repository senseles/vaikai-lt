import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tėvų forumas — Vaikai.lt',
  description:
    'Tėvų forumas apie darželius, aukles, būrelius, specialistus ir vaikų auginimą. Klauskite, dalinkitės patirtimi ir gaukite patarimų iš kitų tėvelių.',
  alternates: {
    canonical: '/forumas',
  },
  openGraph: {
    title: 'Tėvų forumas — Vaikai.lt',
    description:
      'Diskusijos apie vaikų ugdymą, darželius, aukles ir daugiau. Prisijunkite prie bendruomenės!',
    url: 'https://vaikai.lt/forumas',
  },
};

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Breadcrumb */}
      <nav
        aria-label="Naršymo kelias"
        className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <ol className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <Link
                href="/"
                className="hover:text-[#2d6a4f] dark:hover:text-green-400 transition-colors"
              >
                Pradžia
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <Link
                href="/forumas"
                className="hover:text-[#2d6a4f] dark:hover:text-green-400 transition-colors font-medium"
              >
                Forumas
              </Link>
            </li>
          </ol>
        </div>
      </nav>

      {children}
    </div>
  );
}
