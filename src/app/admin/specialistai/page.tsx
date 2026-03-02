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
          <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-600">{r.toFixed(1)}</span>
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
  { key: 'specialty', label: 'Specializacija', type: 'text', placeholder: 'Logopedas, psichologas...' },
  { key: 'clinic', label: 'Klinika', type: 'text', placeholder: 'Klinikos pavadinimas' },
  { key: 'price', label: 'Kaina', type: 'text', placeholder: '40 €/vizitas' },
  { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 ...' },
  { key: 'website', label: 'Svetainė', type: 'text', placeholder: 'https://...' },
  { key: 'languages', label: 'Kalbos', type: 'text', placeholder: 'Lietuvių, anglų' },
  { key: 'description', label: 'Aprašymas', type: 'textarea' },
];

export default function AdminSpecialistai() {
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
      />
    </div>
  );
}
