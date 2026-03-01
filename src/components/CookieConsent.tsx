'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'accepted') {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleAccept(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Slapukų pranešimas"
      className="fixed bottom-0 inset-x-0 z-50 p-4 animate-slide-up"
    >
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 text-center sm:text-left">
          Šis tinklalapis naudoja slapukus (cookies), kad pagerintų jūsų naršymo patirtį.
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 px-6 py-2 rounded-lg text-white font-medium transition-colors bg-[#2d6a4f] hover:bg-[#245a42] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        >
          Sutinku
        </button>
      </div>
    </div>
  );
}
