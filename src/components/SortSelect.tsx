'use client';

interface SortSelectProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

const options = [
  { value: 'rating', label: 'Pagal įvertinimą' },
  { value: 'name', label: 'Pagal pavadinimą' },
  { value: 'reviews', label: 'Pagal atsiliepimus' },
  { value: 'price_asc', label: 'Kaina: mažiausia' },
  { value: 'price_desc', label: 'Kaina: didžiausia' },
] as const;

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
