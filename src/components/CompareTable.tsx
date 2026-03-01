'use client';

import { useEffect } from 'react';
import type { Kindergarten } from '@/types';
import StarRating from './StarRating';

interface CompareTableProps {
  readonly items: Kindergarten[];
  readonly onClose: () => void;
}

const fields: { key: keyof Kindergarten | 'rating'; label: string }[] = [
  { key: 'type', label: 'Tipas' },
  { key: 'address', label: 'Adresas' },
  { key: 'phone', label: 'Telefonas' },
  { key: 'language', label: 'Kalba' },
  { key: 'hours', label: 'Darbo laikas' },
  { key: 'ageFrom', label: 'Amžius nuo' },
  { key: 'groups', label: 'Grupės' },
  { key: 'rating', label: 'Įvertinimas' },
];

export default function CompareTable({ items, onClose }: CompareTableProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (items.length < 2) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Palyginimo lentelė" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 animate-backdrop" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-800 w-full sm:max-w-3xl rounded-t-2xl sm:rounded-xl max-h-[90vh] sm:max-h-[80vh] overflow-auto overscroll-contain p-4 sm:p-5 animate-modal-enter"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Palyginimas</h2>
          <button onClick={onClose} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-gray-500 transition-colors" aria-label="Uždaryti">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-5 sm:px-5 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr>
              <th scope="col" className="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium" />
              {items.map((item) => (
                <th key={item.id} scope="col" className="text-left py-2 px-2 font-semibold text-gray-900 dark:text-white">{item.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100 dark:border-slate-700">
              <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">Miestas</td>
              {items.map((item) => (
                <td key={item.id} className="py-2 px-2 text-gray-900 dark:text-gray-200">{item.city}</td>
              ))}
            </tr>
            {fields.map(({ key, label }) => (
              <tr key={key} className="border-t border-gray-100 dark:border-slate-700">
                <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{label}</td>
                {items.map((item) => (
                  <td key={item.id} className="py-2 px-2 text-gray-900 dark:text-gray-200">
                    {key === 'rating' ? (
                      <StarRating rating={item.baseRating} size="sm" />
                    ) : key === 'type' ? (
                      item.type === 'valstybinis' ? 'Valstybinis' : 'Privatus'
                    ) : (
                      String(item[key] ?? '—')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
