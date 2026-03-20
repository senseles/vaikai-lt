'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface FieldConfig {
  readonly key: string;
  readonly label: string;
  readonly type?: 'text' | 'textarea';
}

const KINDERGARTEN_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Pavadinimas' },
  { key: 'address', label: 'Adresas' },
  { key: 'phone', label: 'Telefonas' },
  { key: 'website', label: 'Svetainė' },
  { key: 'hours', label: 'Darbo laikas' },
  { key: 'language', label: 'Kalba' },
  { key: 'description', label: 'Aprašymas', type: 'textarea' },
];

const AUKLE_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Vardas' },
  { key: 'phone', label: 'Telefonas' },
  { key: 'email', label: 'El. paštas' },
  { key: 'experience', label: 'Patirtis' },
  { key: 'hourlyRate', label: 'Valandinis tarifas' },
  { key: 'languages', label: 'Kalbos' },
  { key: 'availability', label: 'Prieinamumas' },
  { key: 'description', label: 'Aprašymas', type: 'textarea' },
];

const BURELIS_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Pavadinimas' },
  { key: 'address', label: 'Adresas' },
  { key: 'phone', label: 'Telefonas' },
  { key: 'website', label: 'Svetainė' },
  { key: 'price', label: 'Kaina' },
  { key: 'schedule', label: 'Tvarkaraštis' },
  { key: 'description', label: 'Aprašymas', type: 'textarea' },
];

const SPECIALIST_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Vardas' },
  { key: 'phone', label: 'Telefonas' },
  { key: 'website', label: 'Svetainė' },
  { key: 'clinic', label: 'Klinika' },
  { key: 'price', label: 'Kaina' },
  { key: 'languages', label: 'Kalbos' },
  { key: 'description', label: 'Aprašymas', type: 'textarea' },
];

const FIELDS_BY_TYPE: Record<string, FieldConfig[]> = {
  kindergarten: KINDERGARTEN_FIELDS,
  aukle: AUKLE_FIELDS,
  burelis: BURELIS_FIELDS,
  specialist: SPECIALIST_FIELDS,
};

const ENTITY_TYPE_MAP: Record<string, string> = {
  kindergarten: 'KINDERGARTEN',
  aukle: 'AUKLE',
  burelis: 'BURELIS',
  specialist: 'SPECIALIST',
};

interface SuggestEditModalProps {
  readonly entityId: string;
  readonly entityType: string;
  readonly entityName: string;
  readonly currentData: Record<string, unknown>;
  readonly onClose: () => void;
}

function SuggestEditModalInner({ entityId, entityType, entityName, currentData, onClose }: SuggestEditModalProps) {
  const fields = FIELDS_BY_TYPE[entityType] ?? KINDERGARTEN_FIELDS;
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) {
      initial[f.key] = String(currentData[f.key] ?? '');
    }
    return initial;
  });
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const hasChanges = fields.some((f) => {
    const original = String(currentData[f.key] ?? '');
    return formData[f.key] !== original;
  });

  const handleSubmit = async () => {
    if (!hasChanges) {
      setError('Nėra pakeitimų');
      return;
    }
    setSaving(true);
    setError('');

    const proposedChanges: Record<string, string> = {};
    for (const f of fields) {
      const original = String(currentData[f.key] ?? '');
      if (formData[f.key] !== original) {
        proposedChanges[f.key] = formData[f.key];
      }
    }

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: ENTITY_TYPE_MAP[entityType],
          name: entityName,
          city: String(currentData.city ?? ''),
          submitterName: 'Prisijungęs naudotojas',
          description: JSON.stringify({
            isCorrection: true,
            entityId,
            proposedChanges,
            reason: reason.trim() || 'Duomenų pataisymas',
          }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Nepavyko pateikti');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko pateikti pasiūlymo');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Ačiū!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Jūsų pasiūlymas pateiktas. Administratorius peržiūrės ir patvirtins pakeitimus.</p>
          <button onClick={onClose} className="px-6 py-2 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42]">Uždaryti</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Siūlyti pataisymą</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{entityName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
        </div>

        {error && <div className="mx-6 mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded">{error}</div>}

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pakeiskite neteisingus duomenis. Pakeitimai bus peržiūrėti administratoriaus.</p>

          {fields.map((f) => {
            const original = String(currentData[f.key] ?? '');
            const changed = formData[f.key] !== original;
            return (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {f.label}
                  {changed && <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">● pakeista</span>}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    value={formData[f.key]}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-700 dark:text-gray-200 ${changed ? 'border-amber-400 dark:border-amber-500' : 'border-gray-300 dark:border-slate-600'}`}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[f.key]}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-slate-700 dark:text-gray-200 ${changed ? 'border-amber-400 dark:border-amber-500' : 'border-gray-300 dark:border-slate-600'}`}
                  />
                )}
              </div>
            );
          })}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priežastis (neprivaloma)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Pvz. telefonas pasikeitė, adresas neteisingas..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <span className="text-xs text-gray-400">{hasChanges ? 'Yra pakeitimų' : 'Nėra pakeitimų'}</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">Atšaukti</button>
            <button
              onClick={handleSubmit}
              disabled={saving || !hasChanges}
              className="px-4 py-2 text-sm bg-[#2d6a4f] text-white rounded-lg hover:bg-[#245a42] disabled:opacity-50"
            >
              {saving ? 'Siunčiama...' : 'Pateikti pataisymą'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SuggestEditButtonProps {
  readonly entityId: string;
  readonly entityType: string;
  readonly entityName: string;
  readonly currentData: Record<string, unknown>;
}

export default function SuggestEditButton({ entityId, entityType, entityName, currentData }: SuggestEditButtonProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-[#2d6a4f] dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        ✏️ Siūlyti pataisymą
      </button>
      {open && (
        <SuggestEditModalInner
          entityId={entityId}
          entityType={entityType}
          entityName={entityName}
          currentData={currentData}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
