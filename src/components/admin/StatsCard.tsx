'use client';

interface StatsCardProps {
  readonly icon: string;
  readonly label: string;
  readonly count: number;
  readonly change?: number;
  readonly color?: 'blue' | 'green' | 'orange' | 'teal' | 'purple' | 'red';
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
    badge: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-300',
    badge: 'text-green-600 dark:text-green-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-100 dark:border-orange-800',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'text-orange-600 dark:text-orange-400',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-100 dark:border-teal-800',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    text: 'text-teal-700 dark:text-teal-300',
    badge: 'text-teal-600 dark:text-teal-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-700 dark:text-purple-300',
    badge: 'text-purple-600 dark:text-purple-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
    badge: 'text-red-600 dark:text-red-400',
  },
};

export default function StatsCard({ icon, label, count, change, color = 'blue' }: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-start gap-3`}>
      <div className={`${c.iconBg} rounded-lg p-2.5 text-xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-bold ${c.text}`}>{count.toLocaleString('lt-LT')}</p>
        <p className={`text-sm ${c.text} opacity-80 truncate`}>{label}</p>
        {change !== undefined && change !== 0 && (
          <p className={`text-xs mt-1 font-medium ${change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {change > 0 ? '+' : ''}{change}% nuo praites savaites
          </p>
        )}
      </div>
    </div>
  );
}
