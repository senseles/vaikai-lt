'use client';

import { useState, useEffect } from 'react';
import CaptchaWidget from '@/components/CaptchaWidget';
import HoneypotField from '@/components/HoneypotField';

type EntityType = 'KINDERGARTEN' | 'AUKLE' | 'BURELIS' | 'SPECIALIST';

const ENTITY_LABELS: Record<EntityType, string> = {
  KINDERGARTEN: 'Darželis',
  AUKLE: 'Auklė',
  BURELIS: 'Būrelis',
  SPECIALIST: 'Specialistas',
};

const ENTITY_DESCRIPTIONS: Record<EntityType, string> = {
  KINDERGARTEN: 'Vaikų darželis, lopšelis-darželis ar ikimokyklinio ugdymo įstaiga',
  AUKLE: 'Vaikų auklė ar prižiūrėtoja',
  BURELIS: 'Vaikų būrelis, studija ar popamokinė veikla',
  SPECIALIST: 'Vaikų specialistas — logopedas, psichologas, gydytojas ir kt.',
};

interface SubmissionFormProps {
  readonly defaultName?: string;
  readonly defaultCity?: string;
  readonly defaultType?: string;
}

export default function SubmissionForm({ defaultName, defaultCity, defaultType }: SubmissionFormProps) {
  const [step, setStep] = useState<1 | 2>(defaultType ? 2 : 1);
  const [entityType, setEntityType] = useState<EntityType | ''>(
    (defaultType?.toUpperCase() as EntityType) || '',
  );

  // Common fields
  const [name, setName] = useState(defaultName || '');
  const [city, setCity] = useState(defaultCity || '');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  // Entity-specific fields
  const [hours, setHours] = useState('');
  const [experience, setExperience] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [category, setCategory] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic] = useState('');
  const [price, setPrice] = useState('');

  // Submitter info
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');

  // Security
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [formLoadedAt, setFormLoadedAt] = useState(0);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormLoadedAt(Date.now());
  }, []);

  function selectType(type: EntityType) {
    setEntityType(type);
    setStep(2);
  }

  function validateFields(): boolean {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Pavadinimas privalomas';
    if (name.trim().length > 200) errors.name = 'Pavadinimas per ilgas';
    if (!city.trim()) errors.city = 'Miestas privalomas';
    if (!submitterName.trim()) errors.submitterName = 'Jūsų vardas privalomas';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Neteisingas el. pašto adresas';
    if (submitterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) errors.submitterEmail = 'Neteisingas el. pašto adresas';
    if (description.length > 5000) errors.description = 'Aprašymas per ilgas (max 5000 simbolių)';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validateFields()) return;
    if (!captchaToken) {
      setError('Prašome patvirtinti, kad nesate robotas.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          entityType,
          name: name.trim(),
          city: city.trim(),
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          website: website.trim() || undefined,
          description: description.trim() || undefined,
          hours: hours.trim() || undefined,
          experience: experience.trim() || undefined,
          ageRange: ageRange.trim() || undefined,
          category: category.trim() || undefined,
          specialty: specialty.trim() || undefined,
          clinic: clinic.trim() || undefined,
          price: price.trim() || undefined,
          submitterName: submitterName.trim(),
          submitterEmail: submitterEmail.trim() || undefined,
          submitterPhone: submitterPhone.trim() || undefined,
          captchaToken,
          _hp_website: honeypot,
          _form_loaded_at: formLoadedAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Įvyko klaida. Bandykite vėliau.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Tinklo klaida. Bandykite vėliau.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">Pasiūlymas pateiktas!</h2>
        <p className="text-green-700 dark:text-green-400">
          Ačiū! Jūsų pasiūlymas bus peržiūrėtas administratoriaus. Įrašas bus pridėtas po patvirtinimo.
        </p>
      </div>
    );
  }

  const inputCls = 'w-full rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
  const errorCls = 'text-red-500 text-xs mt-1';

  return (
    <div>
      {/* Step 1: Type selection */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Ką norite pasiūlyti?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(ENTITY_LABELS) as EntityType[]).map((type) => (
              <button
                key={type}
                onClick={() => selectType(type)}
                className="text-left p-4 rounded-xl border-2 border-gray-200 dark:border-slate-600 hover:border-primary dark:hover:border-primary bg-white dark:bg-slate-800 transition-colors group"
              >
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {ENTITY_LABELS[type]}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {ENTITY_DESCRIPTIONS[type]}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Form fields */}
      {step === 2 && entityType && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex items-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              &larr; Grįžti
            </button>
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              {ENTITY_LABELS[entityType]}
            </span>
          </div>

          {/* Common fields */}
          <fieldset className="space-y-4 mb-6">
            <legend className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Pagrindinė informacija
            </legend>

            <div>
              <label className={labelCls} htmlFor="s-name">Pavadinimas / Vardas *</label>
              <input id="s-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={200} required />
              {fieldErrors.name && <p className={errorCls}>{fieldErrors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="s-city">Miestas *</label>
                <input id="s-city" className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} required />
                {fieldErrors.city && <p className={errorCls}>{fieldErrors.city}</p>}
              </div>
              <div>
                <label className={labelCls} htmlFor="s-address">Adresas</label>
                <input id="s-address" className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} maxLength={300} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="s-phone">Telefonas</label>
                <input id="s-phone" className={inputCls} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+370 6XX XXXXX" maxLength={30} />
              </div>
              <div>
                <label className={labelCls} htmlFor="s-email">El. paštas</label>
                <input id="s-email" className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
                {fieldErrors.email && <p className={errorCls}>{fieldErrors.email}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="s-website">Svetainė</label>
              <input id="s-website" className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." maxLength={300} />
            </div>

            {/* Entity-specific fields */}
            {entityType === 'KINDERGARTEN' && (
              <div>
                <label className={labelCls} htmlFor="s-hours">Darbo laikas</label>
                <input id="s-hours" className={inputCls} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="pvz. 7:00–18:00" maxLength={200} />
              </div>
            )}

            {entityType === 'AUKLE' && (
              <>
                <div>
                  <label className={labelCls} htmlFor="s-experience">Patirtis</label>
                  <input id="s-experience" className={inputCls} value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="pvz. 5 metų patirtis su vaikais" maxLength={500} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="s-ageRange">Amžiaus grupė</label>
                  <input id="s-ageRange" className={inputCls} value={ageRange} onChange={(e) => setAgeRange(e.target.value)} placeholder="pvz. 1–6 metų" maxLength={100} />
                </div>
              </>
            )}

            {entityType === 'BURELIS' && (
              <>
                <div>
                  <label className={labelCls} htmlFor="s-category">Kategorija</label>
                  <input id="s-category" className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="pvz. Sportas, Menas, Muzika" maxLength={100} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="s-ageRange-b">Amžiaus grupė</label>
                    <input id="s-ageRange-b" className={inputCls} value={ageRange} onChange={(e) => setAgeRange(e.target.value)} placeholder="pvz. 5–12 metų" maxLength={100} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="s-price">Kaina</label>
                    <input id="s-price" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="pvz. 40€/mėn." maxLength={100} />
                  </div>
                </div>
              </>
            )}

            {entityType === 'SPECIALIST' && (
              <>
                <div>
                  <label className={labelCls} htmlFor="s-specialty">Specializacija</label>
                  <input id="s-specialty" className={inputCls} value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="pvz. Logopedas, Psichologas" maxLength={200} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="s-clinic">Klinika / Įstaiga</label>
                    <input id="s-clinic" className={inputCls} value={clinic} onChange={(e) => setClinic(e.target.value)} maxLength={200} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="s-price-s">Kaina</label>
                    <input id="s-price-s" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="pvz. 50€/vizitas" maxLength={100} />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={labelCls} htmlFor="s-desc">Aprašymas</label>
              <textarea
                id="s-desc"
                className={`${inputCls} min-h-[100px] resize-y`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={5000}
                rows={4}
                placeholder="Papildoma informacija apie šią įstaigą ar asmenį..."
              />
              {fieldErrors.description && <p className={errorCls}>{fieldErrors.description}</p>}
              <p className="text-xs text-gray-400 mt-1">{description.length}/5000</p>
            </div>
          </fieldset>

          {/* Submitter info */}
          <fieldset className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
            <legend className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Jūsų kontaktinė informacija
            </legend>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 mb-3">
              Ši informacija nėra vieša — naudojama tik pasiūlymo peržiūrai.
            </p>

            <div>
              <label className={labelCls} htmlFor="s-sname">Jūsų vardas *</label>
              <input id="s-sname" className={inputCls} value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} maxLength={100} required />
              {fieldErrors.submitterName && <p className={errorCls}>{fieldErrors.submitterName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="s-semail">Jūsų el. paštas</label>
                <input id="s-semail" className={inputCls} type="email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} maxLength={200} />
                {fieldErrors.submitterEmail && <p className={errorCls}>{fieldErrors.submitterEmail}</p>}
              </div>
              <div>
                <label className={labelCls} htmlFor="s-sphone">Jūsų telefonas</label>
                <input id="s-sphone" className={inputCls} type="tel" value={submitterPhone} onChange={(e) => setSubmitterPhone(e.target.value)} maxLength={30} />
              </div>
            </div>
          </fieldset>

          <HoneypotField value={honeypot} onChange={setHoneypot} />

          <CaptchaWidget
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken('')}
          />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !captchaToken}
            className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Siunčiama...' : 'Pasiūlyti'}
          </button>
        </form>
      )}
    </div>
  );
}
