'use client';

interface TypeFilterProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

const options = [
  { value: '', label: 'Visi' },
  { value: 'valstybinis', label: 'Valstybiniai' },
  { value: 'privatus', label: 'Privatūs' },
] as const;

export default function TypeFilter({ value, onChange }: TypeFilterProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === opt.value ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
