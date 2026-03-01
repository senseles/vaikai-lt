'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleReject(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Slapukų pranešimas"
      className="fixed bottom-16 md:bottom-0 inset-x-0 z-50 p-3 sm:p-4 animate-slide-up"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              Šis tinklalapis naudoja tik būtinus funkcinius slapukus naršymo patirčiai gerinti.
              Reklaminių ar stebėjimo slapukų nenaudojame.
            </p>
            <Link
              href="/privatumo-politika"
              className="text-sm text-primary dark:text-green-400 hover:underline mt-1 inline-block"
            >
              Skaityti privatumo politiką
            </Link>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-5 py-2.5 min-h-[44px] rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 active:bg-gray-300 dark:active:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              Atmesti
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-5 py-2.5 min-h-[44px] rounded-lg text-white font-medium transition-colors bg-primary hover:bg-primary-dark active:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              Sutinku
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
