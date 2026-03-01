'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Suvestinė', icon: '■', exact: true },
  { href: '/admin/darzeliai', label: 'Darželiai', icon: '▣' },
  { href: '/admin/aukles', label: 'Auklės', icon: '♀' },
  { href: '/admin/bureliai', label: 'Būreliai', icon: '◈' },
  { href: '/admin/specialistai', label: 'Specialistai', icon: '✚' },
  { href: '/admin/atsiliepimai', label: 'Atsiliepimai', icon: '★' },
  { href: '/admin/forumas', label: 'Forumas', icon: '◬' },
  { href: '/admin/nustatymai', label: 'Nustatymai', icon: '⚙' },
];

export default function AdminShell({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Check auth on mount
  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (r.ok) setAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setLoginError('Neteisingas slaptažodis');
      }
    } catch {
      setLoginError('Tinklo klaida. Bandykite dar kartą.');
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = useCallback(() => {
    document.cookie = 'admin_token=; path=/; max-age=0';
    setAuthenticated(false);
    setPassword('');
    router.push('/admin');
  }, [router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const isActive = (item: typeof NAV_ITEMS[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  // Find current page label for the header
  const currentPageLabel = NAV_ITEMS.find((item) => isActive(item))?.label ?? 'Admin';

  // Loading state
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-[3px] border-gray-200 border-t-[#2d6a4f] rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-400">Tikrinama...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#2d6a4f] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">V</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Vaikai.lt Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Prisijunkite prie administravimo skydelio</p>
          </div>
          <form onSubmit={login} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slaptažodis</label>
              <input
                type="password"
                placeholder="Įveskite slaptažodį"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn || !password}
              className="w-full bg-[#2d6a4f] text-white rounded-lg py-3 text-sm font-medium hover:bg-[#40916c] disabled:opacity-50 transition-colors"
            >
              {loggingIn ? 'Jungiamasi...' : 'Prisijungti'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            <Link href="/" className="hover:text-gray-600 transition-colors">← Grįžti į svetainę</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile overlay — closes sidebar when clicking outside */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full bg-slate-900 text-white transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 flex flex-col`}
      >
        {/* Logo + close button on mobile */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#2d6a4f] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">V</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate">Vaikai.lt</h1>
              <p className="text-xs text-slate-400">Administravimas</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Uždaryti meniu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  active
                    ? 'bg-[#2d6a4f] text-white font-medium shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="w-5 text-center text-base flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full flex-shrink-0 opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-slate-700/50">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="w-5 text-center">←</span>
            <span>Į svetainę</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors mt-0.5"
          >
            <span className="w-5 text-center">⏻</span>
            <span>Atsijungti</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen transition-all duration-300">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Meniu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-semibold text-gray-800">
              {currentPageLabel}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <span>←</span> Svetainė
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
