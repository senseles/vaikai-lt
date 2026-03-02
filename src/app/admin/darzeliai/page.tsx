'use client';

import AdminTable from '@/components/admin/AdminTable';
import type { ColumnDef, FieldDef } from '@/components/admin/AdminTable';

const columns: ColumnDef[] = [
  {
    key: 'name',
    label: 'Pavadinimas',
    render: (val) => <span className="font-medium text-gray-900 dark:text-gray-100">{String(val ?? '')}</span>,
  },
  {
    key: 'city',
    label: 'Miestas',
    render: (val) => <span className="text-gray-600 dark:text-gray-400">{String(val ?? '')}</span>,
  },
  {
    key: 'type',
    label: 'Tipas',
    render: (val) => {
      const t = String(val ?? '');
      return (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          t === 'privatus' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {t === 'privatus' ? 'Privatus' : 'Valstybinis'}
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
    key: 'baseReviewCount',
    label: 'Atsiliepimai',
    render: (val) => <span className="text-gray-500 dark:text-gray-400 text-sm">{Number(val ?? 0)}</span>,
    hideOnMobile: true,
  },
];

const fields: FieldDef[] = [
  { key: 'name', label: 'Pavadinimas', type: 'text', required: true, placeholder: 'Darželio pavadinimas' },
  { key: 'city', label: 'Miestas', type: 'text', required: true, placeholder: 'Vilnius' },
  { key: 'type', label: 'Tipas', type: 'select', options: [{ value: 'valstybinis', label: 'Valstybinis' }, { value: 'privatus', label: 'Privatus' }] },
  { key: 'address', label: 'Adresas', type: 'text', placeholder: 'Gatvė 1' },
  { key: 'phone', label: 'Telefonas', type: 'text', placeholder: '+370 ...' },
  { key: 'website', label: 'Svetainė', type: 'text', placeholder: 'https://...' },
  { key: 'language', label: 'Kalba', type: 'text', placeholder: 'Lietuvių' },
  { key: 'ageFrom', label: 'Amžius nuo (metai)', type: 'number' },
  { key: 'groups', label: 'Grupių skaičius', type: 'number' },
  { key: 'hours', label: 'Darbo laikas', type: 'text', placeholder: '7:00 – 18:00' },
  { key: 'description', label: 'Aprašymas', type: 'textarea' },
];

export default function AdminDarzeliai() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Darželiai</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tvarkykite darželių sąrašą</p>
      </div>
      <AdminTable
        apiPath="/api/admin/darzeliai"
        columns={columns}
        fields={fields}
        entityLabel="darželių"
        perPage={25}
      />
    </div>
  );
}
