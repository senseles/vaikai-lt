'use client';

interface PriceFilterProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

const ranges = [
  { value: '', label: 'Visos kainos' },
  { value: '0-5', label: 'Iki 5 €/val.' },
  { value: '5-10', label: '5–10 €/val.' },
  { value: '10-15', label: '10–15 €/val.' },
  { value: '15+', label: 'Virš 15 €/val.' },
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
