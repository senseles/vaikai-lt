'use client';

import { useState } from 'react';

export default function AdminNustatymai() {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/export?format=${exportFormat}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vaikai-export.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    window.location.href = '/admin';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Nustatymai</h1>
        <p className="text-sm text-gray-500 mt-1">Administravimo skydelio nustatymai</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Export */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Duomenų eksportas</h3>
          <p className="text-sm text-gray-500 mb-4">
            Eksportuokite visus duomenis (darželiai, auklės, būreliai, specialistai, atsiliepimai) į failą.
          </p>
          <div className="flex items-center gap-3">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="border border-gray-200 bg-white text-gray-700 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2.5 text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] disabled:opacity-50 font-medium transition-colors"
            >
              {exporting ? 'Eksportuojama...' : 'Eksportuoti'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Informacija apie sistemą</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Platforma</dt>
              <dd className="text-gray-900 font-medium">Next.js 14 + Prisma + SQLite</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Versija</dt>
              <dd className="text-gray-900 font-medium">2.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Autentifikacija</dt>
              <dd className="text-gray-900 font-medium">HMAC tokenai (Edge)</dd>
            </div>
          </dl>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <h3 className="text-sm font-semibold text-red-700 mb-3">Pavojinga zona</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 font-medium">Atsijungti</p>
              <p className="text-xs text-gray-500">Atsijungti nuo administravimo skydelio</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
            >
              Atsijungti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
