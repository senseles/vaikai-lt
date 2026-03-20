'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { ItemType } from '@/types';

interface EntityData {
  id: string;
  name: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'textarea';
}

const FIELDS_BY_TYPE: Record<ItemType, FieldConfig[]> = {
  kindergarten: [
    { key: 'name', label: 'Pavadinimas' },
    { key: 'address', label: 'Adresas' },
    { key: 'phone', label: 'Telefonas' },
    { key: 'website', label: 'Svetainė' },
    { key: 'language', label: 'Kalba' },
    { key: 'hours', label: 'Darbo laikas' },
    { key: 'description', label: 'Aprašymas', type: 'textarea' },
  ],
  aukle: [
    { key: 'name', label: 'Vardas' },
    { key: 'phone', label: 'Telefonas' },
    { key: 'email', label: 'El. paštas' },
    { key: 'hourlyRate', label: 'Valandinis įkainis' },
    { key: 'languages', label: 'Kalbos' },
    { key: 'experience', label: 'Patirtis' },
    { key: 'ageRange', label: 'Amžiaus grupė' },
    { key: 'availability', label: 'Prieinamumas' },
    { key: 'description', label: 'Aprašymas', type: 'textarea' },
  ],
  burelis: [
    { key: 'name', label: 'Pavadinimas' },
    { key: 'category', label: 'Kategorija' },
    { key: 'price', label: 'Kaina' },
    { key: 'ageRange', label: 'Amžiaus grupė' },
    { key: 'schedule', label: 'Tvarkaraštis' },
    { key: 'phone', label: 'Telefonas' },
    { key: 'website', label: 'Svetainė' },
    { key: 'description', label: 'Aprašymas', type: 'textarea' },
  ],
  specialist: [
    { key: 'name', label: 'Vardas' },
    { key: 'specialty', label: 'Specializacija' },
    { key: 'clinic', label: 'Klinika' },
    { key: 'price', label: 'Kaina' },
    { key: 'phone', label: 'Telefonas' },
    { key: 'website', label: 'Svetainė' },
    { key: 'languages', label: 'Kalbos' },
    { key: 'description', label: 'Aprašymas', type: 'textarea' },
  ],
};

const ENTITY_TYPE_MAP: Record<ItemType, string> = {
  kindergarten: 'KINDERGARTEN',
  aukle: 'AUKLE',
  burelis: 'BURELIS',
  specialist: 'SPECIALIST',
};

interface SuggestEditButtonProps {
  readonly entityId: string;
  readonly entityType: ItemType;
  readonly entityData: EntityData;
  readonly variant?: 'button' | 'compact';
}

export default function SuggestEditButton({ entityId, entityType, entityData, variant = 'button' }: SuggestEditButtonProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const formStartTime = useRef(0);

  // Don't render for non-authenticated users
  if (status === 'loading') return null;
  if (!session?.user) return null;

  const fields = FIELDS_BY_TYPE[entityType];

  const handleOpen = () => {
    // Pre-fill form with current values
    const initial: Record<string, string> = {};
    for (const field of fields) {
      const val = entityData[field.key];
      initial[field.key] = val != null ? String(val) : '';
    }
    setFormData(initial);
    setReason('');
    setError('');
    setSuccess(false);
    formStartTime.current = Date.now();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Compute changed fields only
    const proposedChanges: Record<string, string> = {};
    for (const field of fields) {
      const original = entityData[field.key] != null ? String(entityData[field.key]) : '';
      const current = formData[field.key] || '';
      if (current !== original) {
        proposedChanges[field.key] = current;
      }
    }

    if (Object.keys(proposedChanges).length === 0) {
      setError('Nepakeitėte jokių duomenų.');
      setSubmitting(false);
      return;
    }

    if (!reason.trim()) {
      setError('Nurodykite pataisymo priežastį.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/submissions/corrections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          entityType: ENTITY_TYPE_MAP[entityType],
          entityId,
          proposedChanges,
          reason: reason.trim(),
          submitterName: session.user.name || session.user.email || 'Naudotojas',
          submitterEmail: session.user.email || undefined,
          _formStartTime: formStartTime.current,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Nepavyko pateikti pataisymo.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Tinklo klaida. Bandykite dar kartą.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {variant === 'compact' ? (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
          title="Siūlyti pataisymą"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Siūlyti pataisymą
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Siūlyti pataisymą
        </button>
      )}

      {open && <EditModal
        fields={fields}
        formData={formData}
        setFormData={setFormData}
        reason={reason}
        setReason={setReason}
        submitting={submitting}
        success={success}
        error={error}
        onSubmit={handleSubmit}
        onClose={handleClose}
        modalRef={modalRef}
        entityName={entityData.name}
      />}
    </>
  );
}

function EditModal({
  fields,
  formData,
  setFormData,
  reason,
  setReason,
  submitting,
  success,
  error,
  onSubmit,
  onClose,
  modalRef,
  entityName,
}: {
  readonly fields: FieldConfig[];
  readonly formData: Record<string, string>;
  readonly setFormData: (fn: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  readonly reason: string;
  readonly setReason: (v: string) => void;
  readonly submitting: boolean;
  readonly success: boolean;
  readonly error: string;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onClose: () => void;
  readonly modalRef: React.RefObject<HTMLDivElement>;
  readonly entityName: string;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Siūlyti pataisymą</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{entityName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-900 dark:text-white font-medium">Pataisymas pateiktas!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administratorius peržiūrės jūsų pasiūlymą.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
              Uždaryti
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              Pakeiskite laukus, kuriuos norite pataisyti. Nepakeisti laukai bus ignoruojami.
            </p>

            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className={inputCls}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData((prev: Record<string, string>) => ({ ...prev, [field.key]: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <input
                    type="text"
                    className={inputCls}
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData((prev: Record<string, string>) => ({ ...prev, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Pataisymo priežastis <span className="text-red-500">*</span>
              </label>
              <textarea
                className={inputCls}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Pvz.: Pasikeitė darbo laikas, neteisingas telefono numeris..."
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm"
              >
                {submitting ? 'Siunčiama...' : 'Pateikti pataisymą'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Atšaukti
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
