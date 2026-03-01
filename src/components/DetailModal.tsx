'use client';

import { useEffect } from 'react';
import type { Kindergarten, Aukle, Burelis, Specialist, ItemType } from '@/types';
import StarRating from './StarRating';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';

type DetailItem = Kindergarten | Aukle | Burelis | Specialist;

interface DetailModalProps {
  readonly item: DetailItem | null;
  readonly itemType: ItemType;
  readonly onClose: () => void;
}

export default function DetailModal({ item, itemType, onClose }: DetailModalProps) {
  useEffect(() => {
    if (!item) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  const renderDetails = () => {
    switch (itemType) {
      case 'kindergarten': {
        const k = item as Kindergarten;
        return (
          <>
            {k.address && <InfoRow label="Adresas" value={k.address} />}
            {k.phone && <InfoRow label="Telefonas" value={k.phone} />}
            {k.website && <InfoRow label="Svetainė" value={k.website} link />}
            {k.language && <InfoRow label="Kalba" value={k.language} />}
            {k.hours && <InfoRow label="Darbo laikas" value={k.hours} />}
            {k.ageFrom != null && <InfoRow label="Amžius nuo" value={`${k.ageFrom} m.`} />}
            {k.groups != null && <InfoRow label="Grupės" value={String(k.groups)} />}
            {k.description && <p className="mt-3 text-gray-600 text-sm">{k.description}</p>}
          </>
        );
      }
      case 'aukle': {
        const a = item as Aukle;
        return (
          <>
            {a.phone && <InfoRow label="Telefonas" value={a.phone} />}
            {a.email && <InfoRow label="El. paštas" value={a.email} />}
            {a.hourlyRate && <InfoRow label="Kaina" value={a.hourlyRate} />}
            {a.languages && <InfoRow label="Kalbos" value={a.languages} />}
            {a.experience && <InfoRow label="Patirtis" value={a.experience} />}
            {a.ageRange && <InfoRow label="Amžiaus grupė" value={a.ageRange} />}
            {a.availability && <InfoRow label="Prieinamumas" value={a.availability} />}
            {a.description && <p className="mt-3 text-gray-600 text-sm">{a.description}</p>}
          </>
        );
      }
      case 'burelis': {
        const b = item as Burelis;
        return (
          <>
            {b.category && <InfoRow label="Kategorija" value={b.category} />}
            {b.price && <InfoRow label="Kaina" value={b.price} />}
            {b.ageRange && <InfoRow label="Amžiaus grupė" value={b.ageRange} />}
            {b.schedule && <InfoRow label="Tvarkaraštis" value={b.schedule} />}
            {b.phone && <InfoRow label="Telefonas" value={b.phone} />}
            {b.website && <InfoRow label="Svetainė" value={b.website} link />}
            {b.description && <p className="mt-3 text-gray-600 text-sm">{b.description}</p>}
          </>
        );
      }
      case 'specialist': {
        const s = item as Specialist;
        return (
          <>
            {s.specialty && <InfoRow label="Specializacija" value={s.specialty} />}
            {s.clinic && <InfoRow label="Klinika" value={s.clinic} />}
            {s.price && <InfoRow label="Kaina" value={s.price} />}
            {s.phone && <InfoRow label="Telefonas" value={s.phone} />}
            {s.website && <InfoRow label="Svetainė" value={s.website} link />}
            {s.languages && <InfoRow label="Kalbos" value={s.languages} />}
            {s.description && <p className="mt-3 text-gray-600 text-sm">{s.description}</p>}
          </>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-y-auto p-5 animate-slide-up"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-400"
          aria-label="Uždaryti"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-gray-900 pr-8">{item.name}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{item.city}</p>

        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={item.baseRating} />
          <span className="text-sm text-gray-500">({item.baseReviewCount} atsiliepimai)</span>
        </div>

        <div className="mt-4 space-y-2">{renderDetails()}</div>

        <hr className="my-5" />
        <ReviewList itemId={item.id} itemType={itemType} />
        <ReviewForm itemId={item.id} itemType={itemType} />
      </div>
    </div>
  );
}

function InfoRow({ label, value, link = false }: { readonly label: string; readonly value: string; readonly link?: boolean }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 min-w-[100px]">{label}:</span>
      {link ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
          {value}
        </a>
      ) : (
        <span className="text-gray-900">{value}</span>
      )}
    </div>
  );
}
