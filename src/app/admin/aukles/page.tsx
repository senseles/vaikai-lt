'use client';

import AdminTable from '@/components/admin/AdminTable';
import type { ColumnDef, FieldDef } from '@/components/admin/AdminTable';

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
    key: 'experience',
    label: 'Patirtis',
    render: (val) => <span className="text-gray-500 dark:text-gray-400 text-sm">{String(val ?? '—')}</span>,
    hideOnMobile: true,
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
          <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600">{r.toFixed(1)}</span>
        </span>
      );
    },
  },
  {
    key: 'hourlyRate',
    label: 'Kaina',
    render: (val) => <span className="text-gray-500 dark:text-gray-400 text-sm">{String(val ?? '—')}</span>,
    hideOnMobile: true,
  },
];

const fields: FieldDef[] = [
  { key: 'name', label: 'Vardas', type: 'text', required: true, placeholder: 'Vardas Pavardė' },
  { key: 'city', label: 'Miestas', type: 'text', required: true, placeholder: 'Vilnius' },
  { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 ...' },
  { key: 'email', label: 'El. paštas', type: 'text', placeholder: 'el@pastas.lt' },
  { key: 'experience', label: 'Patirtis', type: 'text', placeholder: '5 metai' },
  { key: 'ageRange', label: 'Amžiaus grupė', type: 'text', placeholder: '1-6 m.' },
  { key: 'hourlyRate', label: 'Valandinis tarifas', type: 'text', placeholder: '15 €/val.' },
  { key: 'languages', label: 'Kalbos', type: 'text', placeholder: 'Lietuvių, anglų' },
  { key: 'availability', label: 'Prieinamumas', type: 'text', placeholder: 'Darbo dienomis' },
  { key: 'description', label: 'Aprašymas', type: 'textarea' },
];

export default function AdminAukles() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Auklės</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tvarkykite auklių sąrašą</p>
      </div>
      <AdminTable
        apiPath="/api/admin/aukles"
        columns={columns}
        fields={fields}
        entityLabel="auklių"
        perPage={25}
      />
    </div>
  );
}
