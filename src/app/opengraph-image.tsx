import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Vaikai.lt — Darželiai, auklės, būreliai ir specialistai visoje Lietuvoje';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 50%, #40916c 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          {/* Logo text */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: 56 }}>👶</span>
            <span>Vaikai</span>
            <span style={{ color: '#f4a261' }}>.lt</span>
          </div>

          {/* Main heading */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              textAlign: 'center',
              padding: '0 80px',
              maxWidth: 1000,
            }}
          >
            Darželiai, auklės, būreliai ir specialistai
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              padding: '0 80px',
            }}
          >
            Atsiliepimai ir vertinimai visoje Lietuvoje
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginTop: '24px',
              padding: '16px 40px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            {[
              { emoji: '🏫', label: '1400+' },
              { emoji: '👩‍👧', label: '150+' },
              { emoji: '🎨', label: '160+' },
              { emoji: '👨‍⚕️', label: '120+' },
              { emoji: '🏙️', label: '43 miestai' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'white',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 28 }}>{stat.emoji}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
