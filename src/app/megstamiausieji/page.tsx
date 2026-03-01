import type { Metadata } from 'next';
import FavoritesClient from './FavoritesClient';

export const metadata: Metadata = {
  title: 'Mėgstamiausieji | Vaikai.lt',
  description: 'Jūsų mėgstamiausi darželiai, auklės, būreliai ir specialistai.',
};

export default function FavoritesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">❤️ Mėgstamiausieji</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Jūsų išsaugoti darželiai, auklės, būreliai ir specialistai.</p>
      <FavoritesClient />
    </div>
  );
}
