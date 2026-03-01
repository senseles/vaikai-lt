'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body: Record<string, string> = { email, password };
      if (mode === 'register' && name) body.name = name;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Klaida');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Tinklo klaida. Bandykite vėliau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8" aria-label="Navigacija">
        <Link href="/" className="hover:text-primary transition-colors">Pradžia</Link>
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
            ? 'Prisijunkite, kad galėtumėte rašyti atsiliepimus'
            : 'Sukurkite paskyrą ir dalinkitės savo patirtimi'}
        </p>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-slate-700 p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 min-h-[44px] text-sm font-medium rounded-md transition-colors ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Prisijungti
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 min-h-[44px] text-sm font-medium rounded-md transition-colors ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Registruotis
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setName(e.target.value)}
                placeholder="Jūsų vardas"
                className="w-full px-4 py-3 min-h-[48px] rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              El. paštas <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jus@pavyzdys.lt"
              className="w-full px-4 py-3 min-h-[48px] rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slaptažodis <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Mažiausiai 6 simboliai' : '••••••••'}
              className="w-full px-4 py-3 min-h-[48px] rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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
            className="w-full py-3 min-h-[48px] rounded-lg bg-primary hover:bg-primary-dark active:bg-primary-dark text-white font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Palaukite...' : mode === 'login' ? 'Prisijungti' : 'Registruotis'}
          </button>
        </form>
      </div>
    </div>
  );
}
