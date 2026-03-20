'use client';

import { useState } from 'react';
import AdminTable from '@/components/admin/AdminTable';
import type { ColumnDef, FieldDef } from '@/components/admin/AdminTable';
import ReviewsModal from '@/components/admin/ReviewsModal';

const columns: ColumnDef[] = [
  {
    key: 'name',
    label: 'Vardas',
    render: (val) => <span className="font-medium text-gray-900 dark:text-gray-100">{String(val ?? '')}</span>,
  },
  {
    key: 'city',
    label: 'Miestas',
    render: (val) => <span className="text-gray-600 dark:text-gray-400">{String(val ?? '')}</span>,
  },
  {
    key: 'specialty',
    label: 'Specializacija',
    render: (val) => {
      const spec = String(val ?? '');
      if (!spec || spec === '—') return <span className="text-gray-300 dark:text-gray-600">—</span>;
      return (
        <span className="text-xs px-2 py-1 rounded-full font-medium bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          {spec}
        </span>
      );
    },
  },
  {
    key: 'baseRating',
    label: 'Įvertinimas',
    render: (val) => {
      const r = Number(val ?? 0);
      if (r === 0) return <span className="text-gray-300 dark:text-gray-600">—</span>;
      return (
        <span className="inline-flex items-center gap-1 text-sm">
          <span className="text-yellow-500">★</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{r.toFixed(1)}</span>
        </span>
      );
    },
  },
  {
    key: 'clinic',
    label: 'Klinika',
    render: (val) => <span className="text-gray-500 dark:text-gray-400 text-sm">{String(val ?? '—')}</span>,
    hideOnMobile: true,
  },
];

const fields: FieldDef[] = [
  { key: 'name', label: 'Vardas', type: 'text', required: true, placeholder: 'Vardas Pavardė' },
  { key: 'city', label: 'Miestas', type: 'text', required: true, placeholder: 'Vilnius' },
  { key: 'region', label: 'Rajonas / Seniūnija', type: 'text', placeholder: 'pvz. Pavilnys' },
  { key: 'area', label: 'Mikrorajonas', type: 'text', placeholder: 'pvz. Pašilaičiai' },
  { key: 'address', label: 'Adresas', type: 'text', placeholder: 'Gatvė 1' },
  { key: 'specialty', label: 'Specializacija', type: 'text', placeholder: 'Logopedas, psichologas...' },
  { key: 'clinic', label: 'Klinika', type: 'text', placeholder: 'Klinikos pavadinimas' },
  { key: 'price', label: 'Kaina', type: 'text', placeholder: '40 €/vizitas' },
  { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 ...' },
  { key: 'email', label: 'El. paštas', type: 'text', placeholder: 'el@pastas.lt' },
  { key: 'website', label: 'Svetainė', type: 'text', placeholder: 'https://...' },
  { key: 'languages', label: 'Kalbos', type: 'text', placeholder: 'Lietuvių, anglų' },
  { key: 'description', label: 'Aprašymas', type: 'textarea' },
  { key: 'imageUrl', label: 'Nuotraukos URL', type: 'text', placeholder: 'https://...' },
];

export default function AdminSpecialistai() {
  const [reviewTarget, setReviewTarget] = useState<{ id: string; name: string } | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Specialistai</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tvarkykite specialistų sąrašą</p>
      </div>
      <AdminTable
        apiPath="/api/admin/specialistai"
        columns={columns}
        fields={fields}
        entityLabel="specialistų"
        perPage={25}
        extraActions={(item) => (
          <button
            onClick={() => setReviewTarget({ id: String(item.id), name: String(item.name) })}
            className="px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
            title="Atsiliepimai"
          >
            💬
          </button>
        )}
      />
      {reviewTarget && (
        <ReviewsModal itemId={reviewTarget.id} itemType="specialist" itemName={reviewTarget.name} onClose={() => setReviewTarget(null)} />
      )}
    </div>
  );
}
