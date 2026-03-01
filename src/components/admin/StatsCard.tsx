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
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    iconBg: 'bg-blue-100',
    text: 'text-blue-700',
    badge: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    iconBg: 'bg-green-100',
    text: 'text-green-700',
    badge: 'text-green-600',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    iconBg: 'bg-orange-100',
    text: 'text-orange-700',
    badge: 'text-orange-600',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    iconBg: 'bg-teal-100',
    text: 'text-teal-700',
    badge: 'text-teal-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconBg: 'bg-purple-100',
    text: 'text-purple-700',
    badge: 'text-purple-600',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    iconBg: 'bg-red-100',
    text: 'text-red-700',
    badge: 'text-red-600',
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
          <p className={`text-xs mt-1 font-medium ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change > 0 ? '+' : ''}{change}% nuo praeitės savaitės
          </p>
        )}
      </div>
    </div>
  );
}
