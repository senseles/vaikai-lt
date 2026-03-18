export type PlaceholderCategory = 'darzeliai' | 'aukles' | 'bureliai' | 'specialistai';

interface PlaceholderImageProps {
  readonly category: PlaceholderCategory;
  readonly name: string;
  readonly size?: 'sm' | 'md' | 'lg';
}

const categoryConfig: Record<PlaceholderCategory, { from: string; via: string; to: string; label: string }> = {
  darzeliai: { from: '#2d6a4f', via: '#40916c', to: '#52b788', label: 'Darželis' },
  aukles: { from: '#c2185b', via: '#e76f51', to: '#f4a261', label: 'Auklė' },
  bureliai: { from: '#4361ee', via: '#5a4fcf', to: '#7209b7', label: 'Būrelis' },
  specialistai: { from: '#0077b6', via: '#0096c7', to: '#00b4d8', label: 'Specialistas' },
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

function DarzeliaiScene({ hash }: { hash: number }) {
  const treeX = 60 + (hash % 20);
  const tree2X = 310 + (hash % 30);
  return (
    <g opacity="0.35">
      <circle cx={340} cy={35} r={20} fill="white" opacity="0.5" />
      <g stroke="white" strokeWidth="1.5" opacity="0.3">
        <line x1="340" y1="8" x2="340" y2="2" />
        <line x1="358" y1="17" x2="363" y2="12" />
        <line x1="367" y1="35" x2="373" y2="35" />
        <line x1="358" y1="53" x2="363" y2="58" />
        <line x1="322" y1="17" x2="317" y2="12" />
      </g>
      <rect x="140" y="70" width="120" height="75" rx="3" fill="white" opacity="0.25" />
      <polygon points="130,70 200,30 270,70" fill="white" opacity="0.3" />
      <rect x="230" y="40" width="14" height="30" rx="2" fill="white" opacity="0.2" />
      <rect x="155" y="82" width="20" height="20" rx="3" fill="white" opacity="0.35" />
      <rect x="225" y="82" width="20" height="20" rx="3" fill="white" opacity="0.35" />
      <line x1="165" y1="82" x2="165" y2="102" stroke="white" strokeWidth="1" opacity="0.15" />
      <line x1="155" y1="92" x2="175" y2="92" stroke="white" strokeWidth="1" opacity="0.15" />
      <line x1="235" y1="82" x2="235" y2="102" stroke="white" strokeWidth="1" opacity="0.15" />
      <line x1="225" y1="92" x2="245" y2="92" stroke="white" strokeWidth="1" opacity="0.15" />
      <rect x="188" y="112" width="24" height="33" rx="12" fill="white" opacity="0.3" />
      <circle cx="206" cy="130" r="2" fill="white" opacity="0.4" />
      <rect x={treeX} y="100" width="6" height="45" rx="2" fill="white" opacity="0.2" />
      <circle cx={treeX + 3} cy="85" r="20" fill="white" opacity="0.2" />
      <circle cx={treeX - 8} cy="95" r="14" fill="white" opacity="0.15" />
      <circle cx={treeX + 14} cy="93" r="15" fill="white" opacity="0.15" />
      <rect x={tree2X} y="105" width="5" height="40" rx="2" fill="white" opacity="0.2" />
      <circle cx={tree2X + 2} cy="90" r="18" fill="white" opacity="0.2" />
      <circle cx={tree2X - 7} cy="98" r="12" fill="white" opacity="0.15" />
      <circle cx={tree2X + 12} cy="96" r="13" fill="white" opacity="0.15" />
      <line x1="30" y1="145" x2="370" y2="145" stroke="white" strokeWidth="1" opacity="0.15" />
    </g>
  );
}

function AuklesScene({ hash }: { hash: number }) {
  const starY = 30 + (hash % 20);
  return (
    <g opacity="0.35">
      <path d="M200 130 C200 130 160 105 160 80 C160 60 180 50 200 70 C220 50 240 60 240 80 C240 105 200 130 200 130Z" fill="white" opacity="0.25" />
      <path d="M145 120 C145 120 155 145 200 150 C245 145 255 120 255 120" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
      <path d="M145 120 C138 112 130 118 135 125" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
      <path d="M148 115 C140 108 132 114 137 121" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
      <path d="M255 120 C262 112 270 118 265 125" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
      <path d="M252 115 C260 108 268 114 263 121" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
      <g fill="white" opacity="0.3">
        <circle cx="120" cy={starY} r="2" />
        <circle cx="280" cy={starY + 10} r="2.5" />
        <circle cx="310" cy="60" r="1.5" />
        <circle cx="90" cy="70" r="1.5" />
        <circle cx="150" cy="40" r="2" />
        <circle cx="250" cy="45" r="2" />
      </g>
      <g opacity="0.2">
        <circle cx="95" cy="110" r="8" fill="white" />
        <path d="M95 118 L95 140 M88 126 L102 126 M95 140 L88 152 M95 140 L102 152" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g opacity="0.2">
        <circle cx="305" cy="108" r="6" fill="white" />
        <path d="M305 114 L305 130 M300 120 L310 120 M305 130 L300 140 M305 130 L310 140" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </g>
  );
}

function BureliaiScene({ hash }: { hash: number }) {
  const noteX = 100 + (hash % 15);
  return (
    <g opacity="0.35">
      <ellipse cx="160" cy="95" rx="40" ry="32" fill="white" opacity="0.2" transform="rotate(-15 160 95)" />
      <circle cx="145" cy="85" r="5" fill="white" opacity="0.35" />
      <circle cx="155" cy="75" r="4" fill="white" opacity="0.3" />
      <circle cx="168" cy="78" r="4.5" fill="white" opacity="0.3" />
      <circle cx="175" cy="90" r="4" fill="white" opacity="0.35" />
      <circle cx="148" cy="100" r="6" fill="white" opacity="0.15" />
      <line x1="185" y1="105" x2="220" y2="140" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
      <path d="M182 102 L190 108 L186 112 L178 106Z" fill="white" opacity="0.3" />
      <g transform={`translate(${noteX}, 55)`} opacity="0.3">
        <ellipse cx="0" cy="30" rx="8" ry="6" fill="white" transform="rotate(-20 0 30)" />
        <line x1="7" y1="27" x2="7" y2="0" stroke="white" strokeWidth="2" />
        <path d="M7 0 C7 0 18 3 18 12" stroke="white" strokeWidth="2" fill="none" />
      </g>
      <circle cx="270" cy="85" r="22" fill="none" stroke="white" strokeWidth="2" opacity="0.25" />
      <path d="M252 73 C260 85 260 85 252 97" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />
      <path d="M288 73 C280 85 280 85 288 97" fill="none" stroke="white" strokeWidth="1.5" opacity="0.2" />
      <line x1="248" y1="85" x2="292" y2="85" stroke="white" strokeWidth="1.5" opacity="0.15" />
      <path d="M320 50 L323 58 L332 58 L325 63 L328 72 L320 66 L312 72 L315 63 L308 58 L317 58Z" fill="white" opacity="0.25" />
      <g fill="white" opacity="0.2">
        <circle cx="70" cy="70" r="3" />
        <circle cx="80" cy="130" r="2" />
        <circle cx="340" cy="120" r="2.5" />
        <circle cx="55" cy="100" r="1.5" />
      </g>
    </g>
  );
}

function SpecialistaiScene({ hash }: { hash: number }) {
  const shieldX = 280 + (hash % 15);
  return (
    <g opacity="0.35">
      <path d="M170 55 C170 55 155 55 155 70 L155 100 C155 120 175 130 195 120" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
      <path d="M210 55 C210 55 225 55 225 70 L225 95 C225 110 210 118 195 120" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
      <circle cx="195" cy="122" r="8" fill="white" opacity="0.25" />
      <circle cx="195" cy="122" r="4" fill="white" opacity="0.15" />
      <circle cx="170" cy="52" r="5" fill="white" opacity="0.25" />
      <circle cx="210" cy="52" r="5" fill="white" opacity="0.25" />
      <path d={`M${shieldX} 60 L${shieldX} 105 C${shieldX} 125 ${shieldX + 25} 135 ${shieldX + 25} 135 C${shieldX + 25} 135 ${shieldX + 50} 125 ${shieldX + 50} 105 L${shieldX + 50} 60Z`} fill="white" opacity="0.15" />
      <rect x={shieldX + 20} y={75} width="10" height="40" rx="2" fill="white" opacity="0.25" />
      <rect x={shieldX + 10} y={90} width="30" height="10" rx="2" fill="white" opacity="0.25" />
      <rect x="75" y="65" width="40" height="55" rx="4" fill="white" opacity="0.15" />
      <rect x="85" y="58" width="20" height="12" rx="3" fill="white" opacity="0.2" />
      <line x1="82" y1="82" x2="108" y2="82" stroke="white" strokeWidth="1.5" opacity="0.2" />
      <line x1="82" y1="90" x2="105" y2="90" stroke="white" strokeWidth="1.5" opacity="0.2" />
      <line x1="82" y1="98" x2="100" y2="98" stroke="white" strokeWidth="1.5" opacity="0.2" />
      <line x1="82" y1="106" x2="103" y2="106" stroke="white" strokeWidth="1.5" opacity="0.2" />
      <polyline points="30,145 80,145 95,145 105,125 115,155 125,135 135,145 370,145" fill="none" stroke="white" strokeWidth="1.5" opacity="0.15" />
    </g>
  );
}

const sceneComponents: Record<PlaceholderCategory, React.ComponentType<{ hash: number }>> = {
  darzeliai: DarzeliaiScene,
  aukles: AuklesScene,
  bureliai: BureliaiScene,
  specialistai: SpecialistaiScene,
};

export default function PlaceholderImage({ category, name, size = 'sm' }: PlaceholderImageProps) {
  const config = categoryConfig[category];
  const hash = hashCode(name);
  const uid = `ph-${category}-${hash}`;
  const Scene = sceneComponents[category];

  const dots = Array.from({ length: 8 }, (_, i) => ({
    cx: 30 + ((hash * (i + 1) * 37) % 340),
    cy: 20 + ((hash * (i + 1) * 23) % 130),
    r: 1 + ((hash * (i + 1)) % 3),
  }));

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
        <g fill="white" opacity="0.06">
          {dots.map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />
          ))}
        </g>
        <Scene hash={hash} />
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
