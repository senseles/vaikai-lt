'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PasswordResetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>(token ? 'reset' : 'request');

  // If token provided in URL, go to reset step
  useEffect(() => {
    if (token) setStep('reset');
  }, [token]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Įveskite el. pašto adresą');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        // In dev mode, if token returned, redirect to reset form
        if (data._devToken) {
          setTimeout(() => {
            window.location.href = `/slaptazodis?token=${data._devToken}`;
          }, 1500);
        }
      } else {
        setError(data.error || 'Klaida. Bandykite dar kartą.');
      }
    } catch {
      setError('Tinklo klaida. Bandykite vėliau.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Slaptažodis turi būti bent 6 simbolių');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Slaptažodžiai nesutampa');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        // Auto-login after password reset
        setTimeout(async () => {
          // Try to get email from token to auto-login
          const result = await signIn('credentials', {
            redirect: false,
          });
          if (result?.ok) {
            router.push('/');
          } else {
            router.push('/prisijungti');
          }
        }, 2000);
      } else {
        setError(data.error || 'Klaida. Bandykite dar kartą.');
      }
    } catch {
      setError('Tinklo klaida. Bandykite vėliau.');
    } finally {
      setLoading(false);
    }
  };

  if (success && step === 'request') {
    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Patikrinkite el. paštą</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jei šis el. paštas yra registruotas, atsiuntėme slaptažodžio atstatymo nuorodą.
          </p>
          <Link href="/prisijungti" className="inline-block mt-4 text-sm text-primary hover:underline">
            Grįžti į prisijungimą
          </Link>
        </div>
      </div>
    );
  }

  if (success && step === 'reset') {
    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Slaptažodis pakeistas!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nukreipiame į prisijungimo puslapį...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
        <span className="mx-2">/</span>
        <Link href="/prisijungti" className="hover:text-primary transition-colors">Prisijungimas</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">Slaptažodžio atstatymas</span>
      </nav>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {step === 'request' ? 'Pamiršote slaptažodį?' : 'Naujas slaptažodis'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          {step === 'request'
            ? 'Įveskite el. pašto adresą ir atsiųsime atstatymo nuorodą'
            : 'Įveskite naują slaptažodį'}
        </p>

        {step === 'request' ? (
          <form onSubmit={handleRequestReset} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                El. paštas
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jus@pavyzdys.lt"
                className="w-full px-4 py-3 min-h-[48px] rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 min-h-[48px] rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Siunčiama...' : 'Siųsti atstatymo nuorodą'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Naujas slaptažodis
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mažiausiai 6 simboliai"
                className="w-full px-4 py-3 min-h-[48px] rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pakartokite slaptažodį
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Pakartokite slaptažodį"
                className="w-full px-4 py-3 min-h-[48px] rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 min-h-[48px] rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Keičiama...' : 'Pakeisti slaptažodį'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          <Link href="/prisijungti" className="text-primary dark:text-primary-light font-medium hover:underline">
            Grįžti į prisijungimą
          </Link>
        </p>
      </div>
    </div>
  );
}
