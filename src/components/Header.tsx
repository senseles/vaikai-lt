"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import type { Locale } from "@/lib/i18n";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const navLinks = [
    { href: "/#miestai", label: t('nav.cities') },
    { href: "/megstamiausieji", label: t('nav.favorites') },
    { href: "/#duk", label: t('nav.faq') },
  ];

  const handleLocaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
  };

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
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 font-medium text-sm hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                {link.label}
              </Link>
            ))}
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
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
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
          <nav className="md:hidden flex flex-col gap-1 pb-4 border-t border-gray-200 dark:border-slate-700 pt-3 animate-fade-in" aria-label="Mobilusis meniu">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-2 mt-2 ml-3">
              <select
                className="text-xs font-medium border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                value={locale}
                onChange={handleLocaleChange}
                aria-label={t('nav.language')}
              >
                <option value="lt">LT</option>
                <option value="en">EN</option>
              </select>
              <button
                onClick={toggleDark}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-200 dark:border-slate-600 text-lg"
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
