interface VerificationBadgeProps {
  status: string;
  verifiedAt?: string | Date | null;
  size?: 'sm' | 'md';
}

export default function VerificationBadge({ status, verifiedAt, size = 'sm' }: VerificationBadgeProps) {
  if (status !== 'VERIFIED') return null;

  const dateStr = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString('lt-LT', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  if (size === 'md') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-2.5 py-1">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Patikrinta</span>
        {dateStr && <span className="text-green-500 dark:text-green-500">· {dateStr}</span>}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-0.5 text-[10px] font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-full px-1.5 py-0.5"
      title={dateStr ? `Patikrinta ${dateStr}` : 'Patikrinta'}
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Patikrinta
    </span>
  );
}
