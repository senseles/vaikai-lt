'use client';

/**
 * Hidden honeypot field — bots fill it, humans don't see it.
 * Rendered off-screen with aria-hidden and tabindex=-1.
 */
interface HoneypotFieldProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

export default function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <div
      style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}
      aria-hidden="true"
    >
      <label htmlFor="_hp_website">Website URL</label>
      <input
        id="_hp_website"
        name="_hp_website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
