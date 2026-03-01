'use client';

import { useEffect, useState } from 'react';

interface CityFilterProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export default function CityFilter({ value, onChange }: CityFilterProps) {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/cities')
      .then((r) => r.json())
      .then((data) => setCities(data))
      .catch(() => {});
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:w-auto border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2.5 min-h-[44px] text-base sm:text-sm bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
      aria-label="Pasirinkti miestą"
    >
      <option value="">Visi miestai</option>
      {cities.map((city) => (
        <option key={city} value={city}>{city}</option>
      ))}
    </select>
  );
}
