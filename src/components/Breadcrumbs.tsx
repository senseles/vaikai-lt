import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  readonly items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Navigacijos kelias" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link href="/" className="hover:text-primary dark:hover:text-primary-light transition-colors">
            Pradžia
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {item.href ? (
              <Link href={item.href} className="hover:text-primary dark:hover:text-primary-light transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700 dark:text-gray-200 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
