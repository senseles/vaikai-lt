'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import StarRating from './StarRating';
import type { ItemType } from '@/types';

interface CompareItem {
  id: string;
  name: string;
  city: string;
  baseRating: number;
  baseReviewCount: number;
  [key: string]: unknown;
}

interface CompareTableProps {
  readonly items: CompareItem[];
  readonly itemType: ItemType;
  readonly onClose: () => void;
}

const fieldsByType: Record<ItemType, { key: string; label: string }[]> = {
  kindergarten: [
    { key: 'type', label: 'Tipas' },
    { key: 'address', label: 'Adresas' },
    { key: 'phone', label: 'Telefonas' },
    { key: 'language', label: 'Kalba' },
    { key: 'hours', label: 'Darbo laikas' },
    { key: 'ageFrom', label: 'Amžius nuo' },
    { key: 'groups', label: 'Grupės' },
  ],
  aukle: [
    { key: 'phone', label: 'Telefonas' },
    { key: 'hourlyRate', label: 'Kaina' },
    { key: 'experience', label: 'Patirtis' },
    { key: 'ageRange', label: 'Amžiaus grupė' },
    { key: 'languages', label: 'Kalbos' },
    { key: 'availability', label: 'Prieinamumas' },
  ],
  burelis: [
    { key: 'category', label: 'Kategorija' },
    { key: 'price', label: 'Kaina' },
    { key: 'schedule', label: 'Tvarkaraštis' },
    { key: 'ageRange', label: 'Amžiaus grupė' },
    { key: 'phone', label: 'Telefonas' },
  ],
  specialist: [
    { key: 'specialty', label: 'Specializacija' },
    { key: 'clinic', label: 'Klinika' },
    { key: 'price', label: 'Kaina' },
    { key: 'phone', label: 'Telefonas' },
    { key: 'languages', label: 'Kalbos' },
  ],
};

export default function CompareTable({ items, itemType, onClose }: CompareTableProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ y: number; scrollTop: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = modalRef.current?.scrollTop ?? 0;
    dragStartRef.current = { y: e.touches[0].clientY, scrollTop };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current) return;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    if (dragStartRef.current.scrollTop <= 0 && dy > 0) {
      setDragY(dy);
      setIsDragging(true);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragY > 100) onClose();
    setDragY(0);
    setIsDragging(false);
    dragStartRef.current = null;
  }, [dragY, onClose]);

  if (items.length < 2) return null;

  const fields = fieldsByType[itemType] || fieldsByType.kindergarten;
  const bestRatingIdx = items.reduce((best, item, i) =>
    item.baseRating > items[best].baseRating ? i : best, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="Palyginimo lentelė" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 animate-backdrop" style={{ opacity: isDragging ? Math.max(0, 1 - dragY / 300) : 1 }} />
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative bg-white dark:bg-slate-800 w-full sm:max-w-3xl rounded-t-2xl sm:rounded-xl h-[100dvh] sm:h-auto sm:max-h-[80vh] overflow-auto overscroll-contain p-4 sm:p-5 animate-modal-enter"
        style={{
          transform: isDragging ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : undefined,
        }}
      >
        <div className="sm:hidden flex justify-center pb-3 -mt-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
        </div>

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
              {items.map((item, i) => (
                <th key={item.id} scope="col" className="text-left py-2 px-2">
                  <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                  {i === bestRatingIdx && items[bestRatingIdx].baseRating > 0 && (
                    <span className="ml-1.5 inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      TOP
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-100 dark:border-slate-700">
              <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">Miestas</td>
              {items.map((item) => (
                <td key={item.id} className="py-2.5 px-2 text-gray-900 dark:text-gray-200">{item.city}</td>
              ))}
            </tr>
            {fields.map(({ key, label }) => (
              <tr key={key} className="border-t border-gray-100 dark:border-slate-700">
                <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{label}</td>
                {items.map((item) => (
                  <td key={item.id} className="py-2.5 px-2 text-gray-900 dark:text-gray-200">
                    {String(item[key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-gray-100 dark:border-slate-700">
              <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">Įvertinimas</td>
              {items.map((item, i) => (
                <td key={item.id} className={`py-2.5 px-2 ${i === bestRatingIdx && item.baseRating > 0 ? 'bg-green-50 dark:bg-green-900/10 rounded' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={item.baseRating} size="sm" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{item.baseRating.toFixed(1)}</span>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
