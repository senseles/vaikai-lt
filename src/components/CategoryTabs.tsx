"use client";

import { useState } from "react";

const categories = [
  { id: "darzeliai", label: "Darželiai" },
  { id: "aukles", label: "Auklės" },
  { id: "bureliai", label: "Būreliai" },
  { id: "specialistai", label: "Specialistai" },
] as const;

type CategoryId = (typeof categories)[number]["id"];

export default function CategoryTabs() {
  const [active, setActive] = useState<CategoryId>("darzeliai");

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2 -mb-px scrollbar-none" aria-label="Kategorijų navigacija" role="tablist">
      {categories.map((cat) => (
        <button
          key={cat.id}
          role="tab"
          aria-selected={active === cat.id}
          onClick={() => setActive(cat.id)}
          className={`px-4 py-2.5 min-h-[44px] text-sm font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
            active === cat.id
              ? "bg-primary text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light hover:bg-gray-100 dark:hover:bg-slate-800"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </nav>
  );
}
