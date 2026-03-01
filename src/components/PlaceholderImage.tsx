export type PlaceholderCategory = 'darzeliai' | 'aukles' | 'bureliai' | 'specialistai';

interface PlaceholderImageProps {
  readonly category: PlaceholderCategory;
  readonly name: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

const categoryConfig: Record<PlaceholderCategory, { from: string; to: string; icon: string }> = {
  darzeliai: {
    from: '#2d6a4f',
    to: '#52b788',
    icon: 'M3 21V9l9-7 9 7v12H3z M9 21v-6h6v6 M10 3v4h4V3',
  },
  aukles: {
    from: '#e76f51',
    to: '#f4a261',
    icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  },
  bureliai: {
    from: '#4361ee',
    to: '#7209b7',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  specialistai: {
    from: '#0077b6',
    to: '#00b4d8',
    icon: 'M4.8 2.1L3 3.9l1.4 1.4C2.9 6.7 2 8.8 2 11c0 4.4 3.6 8 8 8 2.2 0 4.3-.9 5.7-2.4L17.1 18l1.8-1.8L4.8 2.1zM10 19c-4.4 0-8-3.6-8-8 0-1.8.6-3.4 1.6-4.8L14.8 17.4C13.4 18.4 11.8 19 10 19zM15 4h2v8.2l-2-2V4zM20 7h2v5.2l-2-2V7z',
  },
};

const sizeClasses: Record<NonNullable<PlaceholderImageProps['size']>, string> = {
  sm: 'h-28 min-h-[7rem]',
  md: 'h-36 min-h-[9rem]',
  lg: 'h-44 min-h-[11rem]',
};

export default function PlaceholderImage({ category, name, size = 'sm' }: PlaceholderImageProps) {
  const config = categoryConfig[category];
  const firstLetter = name.charAt(0).toUpperCase();
  const gradientId = `grad-${category}-${name.replace(/\s/g, '').slice(0, 8)}`;

  return (
    <div className={`relative w-full ${sizeClasses[size]} rounded-t-xl overflow-hidden select-none`} style={{ aspectRatio: '400/180' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 180"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.from} />
            <stop offset="100%" stopColor={config.to} />
          </linearGradient>
        </defs>
        <rect width="400" height="180" fill={`url(#${gradientId})`} />

        {/* Decorative circles */}
        <circle cx="320" cy="30" r="60" fill="white" opacity="0.07" />
        <circle cx="360" cy="140" r="40" fill="white" opacity="0.05" />
        <circle cx="50" cy="150" r="50" fill="white" opacity="0.05" />

        {/* Category icon */}
        <g transform="translate(170, 50) scale(2.5)" opacity="0.25" fill="white" stroke="none">
          <path d={config.icon} />
        </g>

        {/* First letter */}
        <text
          x="200"
          y="110"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="72"
          fontWeight="bold"
          opacity="0.9"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {firstLetter}
        </text>
      </svg>
    </div>
  );
}
