export type PlaceholderCategory = 'darzeliai' | 'aukles' | 'bureliai' | 'specialistai';

interface PlaceholderImageProps {
  readonly category: PlaceholderCategory;
  readonly name: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

const categoryConfig: Record<PlaceholderCategory, { from: string; via: string; to: string; icon: string; label: string }> = {
  darzeliai: {
    from: '#2d6a4f',
    via: '#40916c',
    to: '#52b788',
    icon: 'M3 21V9l9-7 9 7v12H3z M9 21v-6h6v6 M10 3v4h4V3',
    label: 'Darželis',
  },
  aukles: {
    from: '#c2185b',
    via: '#e76f51',
    to: '#f4a261',
    icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    label: 'Auklė',
  },
  bureliai: {
    from: '#4361ee',
    via: '#5a4fcf',
    to: '#7209b7',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    label: 'Būrelis',
  },
  specialistai: {
    from: '#0077b6',
    via: '#0096c7',
    to: '#00b4d8',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    label: 'Specialistas',
  },
};

const sizeClasses: Record<NonNullable<PlaceholderImageProps['size']>, string> = {
  sm: 'h-32 min-h-[8rem]',
  md: 'h-40 min-h-[10rem]',
  lg: 'h-48 min-h-[12rem]',
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function PlaceholderImage({ category, name, size = 'sm' }: PlaceholderImageProps) {
  const config = categoryConfig[category];
  const firstLetter = name.charAt(0).toUpperCase();
  const hash = hashCode(name);
  const uid = `ph-${category}-${hash}`;

  // Generate deterministic variations based on name hash
  const cx1 = 280 + (hash % 120);
  const cy1 = 10 + (hash % 40);
  const r1 = 50 + (hash % 40);
  const cx2 = 30 + (hash % 80);
  const cy2 = 130 + (hash % 40);
  const r2 = 30 + (hash % 30);
  const patternRotate = hash % 360;

  return (
    <div className={`relative w-full ${sizeClasses[size]} rounded-t-xl overflow-hidden select-none`} style={{ aspectRatio: '400/200' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.from} />
            <stop offset="50%" stopColor={config.via} />
            <stop offset="100%" stopColor={config.to} />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="200" fill={`url(#${uid}-bg)`} />
        <rect width="400" height="200" fill={`url(#${uid}-glow)`} />

        {/* Decorative shapes with name-based variation */}
        <circle cx={cx1} cy={cy1} r={r1} fill="white" opacity="0.06" />
        <circle cx={cx2} cy={cy2} r={r2} fill="white" opacity="0.05" />
        <circle cx={200 + (hash % 60) - 30} cy={180} r={70} fill="white" opacity="0.04" />

        {/* Subtle diagonal pattern */}
        <g transform={`rotate(${patternRotate} 200 100)`} opacity="0.04">
          <line x1="0" y1="0" x2="400" y2="200" stroke="white" strokeWidth="0.5" />
          <line x1="100" y1="0" x2="400" y2="150" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="300" y2="200" stroke="white" strokeWidth="0.5" />
        </g>

        {/* Category icon — larger, more prominent */}
        <g transform="translate(165, 35) scale(3)" opacity="0.15" fill="white" stroke="none">
          <path d={config.icon} />
        </g>

        {/* First letter — larger with slight shadow */}
        <text
          x="200"
          y="120"
          textAnchor="middle"
          dominantBaseline="central"
          fill="black"
          fontSize="80"
          fontWeight="bold"
          opacity="0.08"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {firstLetter}
        </text>
        <text
          x="200"
          y="118"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="80"
          fontWeight="bold"
          opacity="0.92"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {firstLetter}
        </text>

        {/* Category label at bottom */}
        <text
          x="200"
          y="178"
          textAnchor="middle"
          fill="white"
          fontSize="11"
          fontWeight="500"
          opacity="0.5"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="2"
        >
          {config.label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
