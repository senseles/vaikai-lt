'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Kindergarten, Aukle, Burelis, Specialist, ItemType } from '@/types';
import StarRating from './StarRating';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { addToRecentlyViewed } from './RecentlyViewed';
import { toSlug } from '@/lib/utils';

type DetailItem = Kindergarten | Aukle | Burelis | Specialist;

interface DetailModalProps {
  readonly item: DetailItem | null;
  readonly itemType: ItemType;
  readonly onClose: () => void;
}

export default function DetailModal({ item, itemType, onClose }: DetailModalProps) {
  useEffect(() => {
    if (!item) return;
    addToRecentlyViewed({
      id: item.id,
      name: item.name,
      city: item.city,
      itemType,
      baseRating: item.baseRating,
    });
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    // Focus the close button when the modal opens
    const closeBtn = document.querySelector<HTMLButtonElement>('[data-modal-close]');
    closeBtn?.focus();
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [item, itemType, onClose]);

  if (!item) return null;

  const getAddress = (): string | null => {
    if (itemType === 'kindergarten') {
      return (item as Kindergarten).address ?? null;
    }
    if (itemType === 'specialist') {
      return (item as Specialist).clinic ?? null;
    }
    return null;
  };

  const address = getAddress();

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={item.name} onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-800 w-full sm:max-w-lg sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-5 animate-slide-up"
      >
        <button
          data-modal-close
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 dark:text-gray-500"
          aria-label="Uždaryti"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-8">{item.name}</h2>
        <Link
          href={`/${toSlug(item.city)}`}
          onClick={onClose}
          className="inline-block text-sm text-gray-500 dark:text-gray-400 mt-0.5 hover:text-primary dark:hover:text-primary-light transition-colors"
        >
          {item.city} &rarr;
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <StarRating rating={item.baseRating} />
          {item.baseReviewCount > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">Reitingas</span>
          )}
        </div>

        <div className="mt-4 space-y-2">{renderDetails()}</div>

        {address && <MapEmbed address={address} city={item.city} />}

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

function MapEmbed({ address, city }: { readonly address: string; readonly city: string }) {
  const [showMap, setShowMap] = useState(false);
  const query = encodeURIComponent(`${address}, ${city}, Lithuania`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;

  return (
    <div className="mt-4">
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {showMap ? (
          <div className="relative h-48">
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Žemėlapis: ${address}, ${city}`}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowMap(true)}
            className="group w-full text-left"
          >
            <div className="relative h-32 bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              <svg
                className="absolute inset-0 w-full h-full opacity-10 dark:opacity-5"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-400 dark:text-gray-300" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-grid)" />
              </svg>
              <div className="relative flex flex-col items-center gap-1">
                <svg
                  className="w-10 h-10 text-red-500 dark:text-red-400 drop-shadow-md group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
                </svg>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Paspauskite, kad pamatytumėte žemėlapį
                </span>
              </div>
            </div>
          </button>
        )}

        {/* Bottom bar with address and link to full Google Maps */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link flex items-center justify-between px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{address}, {city}</span>
          </div>
          <span className="shrink-0 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full group-hover/link:bg-blue-100 dark:group-hover/link:bg-blue-900/50 transition-colors">
            Atidaryti Google Maps
          </span>
        </a>
      </div>
    </div>
  );
}

function InfoRow({ label, value, link = false }: { readonly label: string; readonly value: string; readonly link?: boolean }) {
  return (
    <div className="flex gap-2 text-sm min-w-0">
      <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}:</span>
      {link ? (
        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate min-w-0">
          {value}
        </a>
      ) : (
        <span className="text-gray-900 dark:text-gray-200 break-words min-w-0">{value}</span>
      )}
    </div>
  );
}
