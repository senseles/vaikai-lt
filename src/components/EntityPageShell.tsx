'use client';

import { useEffect, useState } from 'react';
import type { ItemType } from '@/types';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import ErrorBoundary from './ErrorBoundary';
import { addToRecentlyViewed } from './RecentlyViewed';

interface EntityPageShellProps {
  readonly itemId: string;
  readonly itemType: ItemType;
  readonly itemName: string;
  readonly itemCity: string;
  readonly baseRating: number;
  readonly address?: string | null;
}

export default function EntityPageShell({ itemId, itemType, itemName, itemCity, baseRating, address }: EntityPageShellProps) {
  const [copied, setCopied] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    addToRecentlyViewed({ id: itemId, name: itemName, city: itemCity, itemType, baseRating });
  }, [itemId, itemName, itemCity, itemType, baseRating]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${itemName} | Vaikai.lt`);
    const body = encodeURIComponent(`${itemName} | Vaikai.lt\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <>
      {/* Map */}
      {address && (
        <div className="mb-6">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {showMap ? (
              <div className="relative aspect-video sm:h-64 sm:aspect-auto">
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${address}, ${itemCity}, Lithuania`)}&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Žemėlapis: ${address}, ${itemCity}`}
                />
              </div>
            ) : (
              <button onClick={() => setShowMap(true)} className="group w-full text-left">
                <div className="relative h-40 bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                      <pattern id="map-grid-page" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400 dark:text-gray-300" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#map-grid-page)" />
                  </svg>
                  <div className="relative flex flex-col items-center gap-1">
                    <svg className="w-10 h-10 text-red-500 dark:text-red-400 drop-shadow-md group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Paspauskite, kad pamatytumėte žemėlapį
                    </span>
                  </div>
                </div>
              </button>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${itemCity}, Lithuania`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center justify-between px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{address}, {itemCity}</span>
              </div>
              <span className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full group-hover/link:bg-blue-100 dark:group-hover/link:bg-blue-900/50 transition-colors whitespace-nowrap">
                Google Maps
              </span>
            </a>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-5 sm:p-6 mb-6">
        <ErrorBoundary>
          <ReviewList itemId={itemId} itemType={itemType} />
        </ErrorBoundary>
        <hr className="my-5 border-gray-200 dark:border-slate-700" />
        <ErrorBoundary>
          <ReviewForm itemId={itemId} itemType={itemType} />
        </ErrorBoundary>
      </div>

      {/* Share */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">Dalintis:</span>
        <div className="relative">
          <button
            onClick={handleCopy}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Kopijuoti nuorodą"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
            </svg>
          </button>
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded shadow">
              Nuoroda nukopijuota!
            </span>
          )}
        </div>
        <button
          onClick={handleFacebook}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
          aria-label="Dalintis Facebook"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />
          </svg>
        </button>
        <button
          onClick={handleEmail}
          className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
          aria-label="Siųsti el. paštu"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </>
  );
}
