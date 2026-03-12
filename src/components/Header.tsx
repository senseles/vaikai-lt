"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/lib/LanguageContext";
import type { Locale } from "@/lib/i18n";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();
  const { data: session } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const isForumActive = pathname.startsWith('/forumas');

  const navLinks = [
    { href: "/#miestai", label: t('nav.cities'), prefetch: false as const },
    { href: "/forumas", label: "Forumas", prefetch: true as const },
    { href: "/megstamiausieji", label: t('nav.favorites'), prefetch: true as const },
    { href: "/#duk", label: t('nav.faq'), prefetch: false as const },
  ];

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
  };

  const userInitial = session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-primary hover:opacity-85 transition-opacity">
            <span className="text-2xl" aria-hidden="true">👶</span>
            <span>Vaikai<span className="text-secondary">.lt</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Pagrindinė navigacija">
            {navLinks.map((link) => {
              const active = link.href === '/forumas' ? isForumActive : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={link.prefetch}
                  className={`font-medium text-sm transition-colors ${
                    active
                      ? 'text-primary dark:text-primary-light'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light'
                  }`}
                >
                  {link.href === '/forumas' && (
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {link.label}
                    </span>
                  )}
                  {link.href !== '/forumas' && link.label}
                </Link>
              );
            })}
            <select
              className="text-xs font-medium border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 cursor-pointer"
              value={locale}
              onChange={handleLocaleChange}
              aria-label={t('nav.language')}
            >
              <option value="lt">LT</option>
              <option value="en">EN</option>
            </select>
            <button
              onClick={toggleDark}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 dark:border-slate-600 hover:border-primary dark:hover:border-primary-light transition-all text-lg"
              aria-label={t('nav.darkMode')}
            >
              {dark ? "☀️" : "🌙"}
            </button>

            {/* User auth button */}
            {session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt=""
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                      {userInitial}
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {session.user.name || session.user.email}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.user.name || 'Vartotojas'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Atsijungti
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/prisijungti"
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Prisijungti
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t('nav.openMenu')}
            aria-expanded={mobileOpen}
          >
            <div className="flex flex-col gap-1.5 w-5" aria-hidden="true">
              <span className={`block h-0.5 bg-gray-700 dark:bg-gray-300 rounded transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-gray-700 dark:bg-gray-300 rounded transition-all ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-gray-700 dark:bg-gray-300 rounded transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden flex flex-col gap-1 pb-4 border-t border-gray-200 dark:border-slate-700 pt-3 animate-slide-down" aria-label="Mobilusis meniu">
            {navLinks.map((link) => {
              const active = link.href === '/forumas' ? isForumActive : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-3 min-h-[44px] flex items-center gap-2 rounded-lg font-medium transition-colors ${
                    active
                      ? 'text-primary dark:text-primary-light bg-primary/5 dark:bg-primary-light/5'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.href === '/forumas' && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile user section */}
            {session?.user ? (
              <div className="mx-3 mt-2 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  {session.user.image ? (
                    <Image src={session.user.image} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" unoptimized />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-base font-bold">
                      {userInitial}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session.user.name || 'Vartotojas'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full py-2.5 min-h-[44px] rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Atsijungti
                </button>
              </div>
            ) : (
              <Link
                href="/prisijungti"
                className="mx-3 mt-2 py-3 min-h-[48px] flex items-center justify-center rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Prisijungti
              </Link>
            )}

            <div className="flex items-center gap-3 mt-2 px-3">
              <select
                className="text-base font-medium border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 min-h-[44px] bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                value={locale}
                onChange={handleLocaleChange}
                aria-label={t('nav.language')}
              >
                <option value="lt">LT</option>
                <option value="en">EN</option>
              </select>
              <button
                onClick={toggleDark}
                className="w-11 h-11 flex items-center justify-center rounded-full border-2 border-gray-200 dark:border-slate-600 hover:border-primary dark:hover:border-primary-light text-lg transition-colors"
                aria-label={t('nav.darkMode')}
              >
                {dark ? "☀️" : "🌙"}
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
