'use client';

import { useEffect, useState } from 'react';
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
            {k.description && <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{k.description}</p>}
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
            {a.description && <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{a.description}</p>}
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
            {b.description && <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{b.description}</p>}
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
            {s.description && <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{s.description}</p>}
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
        className="relative bg-white dark:bg-slate-800 w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-y-auto p-5 animate-slide-up"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-gray-500"
          aria-label="Uždaryti"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-8">{item.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.city}</p>

        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={item.baseRating} />
          <span className="text-sm text-gray-500 dark:text-gray-400">({item.baseReviewCount} atsiliepimai)</span>
        </div>

        <div className="mt-4 space-y-2">{renderDetails()}</div>

        <hr className="my-5 border-gray-200 dark:border-slate-700" />
        <ReviewList itemId={item.id} itemType={itemType} />
        <ReviewForm itemId={item.id} itemType={itemType} />

        <ShareButtons itemName={item.name} />
      </div>
    </div>
  );
}

function ShareButtons({ itemName }: { readonly itemName: string }) {
  const [copied, setCopied] = useState(false);

  const shareText = `${itemName} | Vaikai.lt`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(shareText);
    const body = encodeURIComponent(`${shareText}\n${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="mt-5 pt-4 border-t border-gray-200 dark:border-slate-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Dalintis</p>
      <div className="flex gap-2">
        {/* Copy link */}
        <div className="relative">
          <button
            onClick={handleCopyLink}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Kopijuoti nuorodą"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
            </svg>
          </button>
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded shadow">
              Nuoroda nukopijuota!
            </span>
          )}
        </div>

        {/* Facebook */}
        <button
          onClick={handleFacebookShare}
          className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
          aria-label="Dalintis Facebook"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />
          </svg>
        </button>

        {/* Email */}
        <button
          onClick={handleEmailShare}
          className="w-9 h-9 rounded-full bg-gray-500 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
          aria-label="Siųsti el. paštu"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, link = false }: { readonly label: string; readonly value: string; readonly link?: boolean }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}:</span>
      {link ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
          {value}
        </a>
      ) : (
        <span className="text-gray-900 dark:text-gray-200">{value}</span>
      )}
    </div>
  );
}
