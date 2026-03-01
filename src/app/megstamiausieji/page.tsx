import type { Metadata } from 'next';
import Link from 'next/link';
import FavoritesClient from './FavoritesClient';

export const metadata: Metadata = {
  title: 'Mėgstamiausieji | Vaikai.lt',
  description: 'Jūsų mėgstamiausi darželiai, auklės, būreliai ir specialistai.',
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">Mėgstamiausieji</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">❤️ Mėgstamiausieji</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Jūsų išsaugoti darželiai, auklės, būreliai ir specialistai.</p>
      <FavoritesClient />
    </div>
  );
}
