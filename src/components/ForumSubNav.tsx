'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const subNavItems = [
  { href: '/forumas', label: 'Visos kategorijos', matchExact: true },
  { href: '/forumas?view=naujausi', label: 'Naujausi', param: 'naujausi' },
  { href: '/forumas?view=populiariausi', label: 'Populiariausi', param: 'populiariausi' },
  { href: '/forumas/naujas', label: 'Sukurti naują', isCreate: true },
];

export default function ForumSubNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  const isForumRoot = pathname === '/forumas';

  return (
    <div className="sticky top-16 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav
          className="flex items-center gap-1 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 py-2"
          aria-label="Forumo navigacija"
        >
          {subNavItems.map((item) => {
            let active = false;
            if (item.matchExact) {
              active = isForumRoot && !view;
            } else if (item.param) {
              active = isForumRoot && view === item.param;
            } else {
              active = pathname === '/forumas/naujas';
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-4 py-2 min-h-[44px] flex items-center rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${
                  item.isCreate
                    ? 'bg-[#2d6a4f] hover:bg-[#40916c] text-white ml-auto'
                    : active
                    ? 'bg-[#2d6a4f]/10 dark:bg-green-900/30 text-[#2d6a4f] dark:text-green-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {item.isCreate && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {item.label}
                  </span>
                )}
                {!item.isCreate && item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
