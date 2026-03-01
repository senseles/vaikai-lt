'use client';

interface PriceFilterProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

const ranges = [
  { value: '', label: 'Visos kainos' },
  { value: '0-100', label: 'Iki 100 €' },
  { value: '100-300', label: '100–300 €' },
  { value: '300-500', label: '300–500 €' },
  { value: '500+', label: 'Virš 500 €' },
] as const;

export default function PriceFilter({ value, onChange }: PriceFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {ranges.map((r) => (
        <option key={r.value} value={r.value}>{r.label}</option>
      ))}
    </select>
  );
}
