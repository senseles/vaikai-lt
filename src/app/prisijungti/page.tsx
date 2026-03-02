'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Mode = 'login' | 'register';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Silpnas', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Vidutinis', color: 'bg-yellow-500' };
  if (score <= 3) return { score: 3, label: 'Geras', color: 'bg-blue-500' };
  return { score: 4, label: 'Stiprus', color: 'bg-green-500' };
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'El. pastas yra privalomas';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Neteisingas el. pasto formatas';
        return '';
      case 'password':
        if (!value) return 'Slaptazodis yra privalomas';
        if (value.length < 6) return 'Slaptazodis turi buti bent 6 simboliu';
        return '';
      case 'name':
        // Name is optional for registration but validate if provided
        if (mode === 'register' && value.trim() && value.trim().length < 2) return 'Vardas turi buti bent 2 simboliu';
        return '';
      default:
        return '';
    }
  }, [mode]);

  const handleBlur = useCallback((field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: err || undefined }));
  }, [validateField]);

  const validateAll = useCallback((): boolean => {
    const errors: FieldErrors = {};

    const emailErr = validateField('email', email);
    if (emailErr) errors.email = emailErr;

    const passErr = validateField('password', password);
    if (passErr) errors.password = passErr;

    if (mode === 'register') {
      const nameErr = validateField('name', name);
      if (nameErr) errors.name = nameErr;
    }

    setFieldErrors(errors);
    setTouched({ email: true, password: true, name: true });
    return Object.keys(errors).length === 0;
  }, [email, password, name, mode, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateAll()) return;

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body: Record<string, string> = { email: email.trim(), password };
      if (mode === 'register' && name.trim()) body.name = name.trim();

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Ivyko klaida. Bandykite dar karta.');
        setLoading(false);
        return;
      }

      // Show success state briefly before redirect
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 800);
    } catch {
      setError('Tinklo klaida. Patikrinkite interneto rysio ir bandykite veliau.');
      setLoading(false);
    }
  };

  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setError('');
    setFieldErrors({});
    setTouched({});
    setSuccess(false);
  }, []);

  const inputBaseClass = "w-full px-4 py-3 min-h-[48px] rounded-lg border bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-base transition-all duration-200";
  const inputNormalClass = `${inputBaseClass} border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-primary focus:border-primary`;
  const inputErrorClass = `${inputBaseClass} border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-400`;

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400 animate-check-draw" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeDasharray="20" strokeDashoffset="0">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {mode === 'login' ? 'Sekmingai prisijungta!' : 'Paskyra sukurta!'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nukreipiame i pagrindini puslapi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradzia</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">
          {mode === 'login' ? 'Prisijungimas' : 'Registracija'}
        </span>
      </nav>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {mode === 'login' ? 'Prisijungimas' : 'Registracija'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          {mode === 'login'
            ? 'Prisijunkite, kad galetumete rasyti atsiliepimus'
            : 'Sukurkite paskyra ir dalinkites savo patirtimi'}
        </p>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-slate-700 p-1 mb-6" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 min-h-[44px] text-sm font-medium rounded-md transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Prisijungti
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 min-h-[44px] text-sm font-medium rounded-md transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Registruotis
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name field (registration only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vardas
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (touched.name) {
                    const err = validateField('name', e.target.value);
                    setFieldErrors(prev => ({ ...prev, name: err || undefined }));
                  }
                }}
                onBlur={() => handleBlur('name', name)}
                placeholder="Jusu vardas"
                className={touched.name && fieldErrors.name ? inputErrorClass : inputNormalClass}
                aria-invalid={touched.name && !!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              />
              {touched.name && fieldErrors.name && (
                <p id="name-error" className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fieldErrors.name}
                </p>
              )}
            </div>
          )}

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              El. pastas <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) {
                    const err = validateField('email', e.target.value);
                    setFieldErrors(prev => ({ ...prev, email: err || undefined }));
                  }
                }}
                onBlur={() => handleBlur('email', email)}
                placeholder="jus@pavyzdys.lt"
                className={touched.email && fieldErrors.email ? inputErrorClass : inputNormalClass}
                aria-invalid={touched.email && !!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {/* Validation icon */}
              {touched.email && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {fieldErrors.email ? (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              )}
            </div>
            {touched.email && fieldErrors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slaptazodis <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) {
                    const err = validateField('password', e.target.value);
                    setFieldErrors(prev => ({ ...prev, password: err || undefined }));
                  }
                }}
                onBlur={() => handleBlur('password', password)}
                placeholder={mode === 'register' ? 'Maziausiai 6 simboliai' : ''}
                className={`${touched.password && fieldErrors.password ? inputErrorClass : inputNormalClass} pr-12`}
                aria-invalid={touched.password && !!fieldErrors.password}
                aria-describedby={fieldErrors.password ? 'password-error' : mode === 'register' ? 'password-strength' : undefined}
              />
              {/* Show/hide password toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                aria-label={showPassword ? 'Slpti slaptazodi' : 'Rodyti slaptazodi'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {touched.password && fieldErrors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {fieldErrors.password}
              </p>
            )}

            {/* Password strength indicator (registration only) */}
            {mode === 'register' && password.length > 0 && (
              <div id="password-strength" className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        level <= passwordStrength.score
                          ? passwordStrength.color
                          : 'bg-gray-200 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Stiprumas: <span className="font-medium">{passwordStrength.label}</span>
                </p>
              </div>
            )}
          </div>

          {/* Global error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-start gap-2 animate-shake">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 min-h-[48px] rounded-lg bg-primary hover:bg-primary-dark active:bg-primary-dark text-white font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Palaukite...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Prisijungti' : 'Registruotis'}</span>
            )}
          </button>
        </form>

        {/* Mode switch hint */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          {mode === 'login' ? (
            <>
              Neturite paskyros?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-primary dark:text-primary-light font-medium hover:underline"
              >
                Registruokites
              </button>
            </>
          ) : (
            <>
              Jau turite paskyra?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-primary dark:text-primary-light font-medium hover:underline"
              >
                Prisijunkite
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
