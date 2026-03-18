'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HoneypotField from '@/components/HoneypotField';
import CaptchaWidget from '@/components/CaptchaWidget';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
}

export default function NewPostPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySlug, setCategorySlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const formLoadedAt = useRef(Date.now());

  // Load categories
  useEffect(() => {
    fetch('/api/forum/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {
        // Silently fail
      });
  }, []);

  // Restore saved author name
  useEffect(() => {
    const saved = localStorage.getItem('forum_author_name');
    if (saved) setAuthorName(saved);
  }, []);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!categorySlug) {
      errs.category = 'Pasirinkite kategoriją';
    }
    if (title.trim().length < 5) {
      errs.title = 'Pavadinimas turi būti bent 5 simbolių';
    } else if (title.trim().length > 200) {
      errs.title = 'Pavadinimas negali viršyti 200 simbolių';
    }
    if (content.trim().length < 10) {
      errs.content = 'Turinys turi būti bent 10 simbolių';
    } else if (content.trim().length > 5000) {
      errs.content = 'Turinys negali viršyti 5000 simbolių';
    }
    if (authorName.trim().length < 2) {
      errs.authorName = 'Vardas turi būti bent 2 simbolių';
    } else if (authorName.trim().length > 50) {
      errs.authorName = 'Vardas negali viršyti 50 simbolių';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    if (!captchaToken) {
      setServerError('Prašome patvirtinti, kad nesate robotas');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          categorySlug,
          title: title.trim(),
          content: content.trim(),
          authorName: authorName.trim(),
          city: city.trim() || undefined,
          captchaToken,
          _hp_website: honeypot,
          _form_loaded_at: formLoadedAt.current,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error || 'Nepavyko sukurti įrašo');
        setSubmitting(false);
        return;
      }

      const post = await res.json();
      // Save author name for reuse
      localStorage.setItem('forum_author_name', authorName.trim());

      // Redirect to the new post
      router.push(`/forumas/${post.category?.slug || categorySlug}/${post.slug}`);
    } catch {
      setServerError('Tinklo klaida. Bandykite dar kartą.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
        Naujas įrašas
      </h1>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">
        Pasidalinkite klausimu, patirtimi ar rekomendacija su kitais tėveliais.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 relative">
        <HoneypotField value={honeypot} onChange={setHoneypot} />
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Kategorija <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              setErrors((prev) => ({ ...prev, category: '' }));
            }}
            className={`w-full px-4 py-3 rounded-xl border ${errors.category ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400`}
          >
            <option value="">— Pasirinkite kategoriją —</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pavadinimas <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="Pvz.: Koks darželis geriausias Vilniuje?"
            maxLength={200}
            className={`w-full px-4 py-3 rounded-xl border ${errors.title ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 placeholder:text-slate-400`}
          />
          <div className="flex justify-between mt-1">
            {errors.title ? <p className="text-red-500 dark:text-red-400 text-xs">{errors.title}</p> : <span />}
            <p className="text-xs text-slate-400 tabular-nums">{title.length}/200</p>
          </div>
        </div>

        {/* Content — textarea with overflow protection */}
        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Turinys <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setErrors((prev) => ({ ...prev, content: '' }));
            }}
            placeholder="Aprašykite savo klausimą ar temą..."
            maxLength={5000}
            rows={8}
            className={`w-full px-4 py-3 rounded-xl border ${errors.content ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 resize-y placeholder:text-slate-400 max-w-full`}
          />
          <div className="flex justify-between mt-1">
            {errors.content ? <p className="text-red-500 dark:text-red-400 text-xs">{errors.content}</p> : <span />}
            <p className="text-xs text-slate-400 tabular-nums">{content.length}/5000</p>
          </div>
        </div>

        {/* Author Name */}
        <div>
          <label htmlFor="authorName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Jūsų vardas <span className="text-red-500">*</span>
          </label>
          <input
            id="authorName"
            type="text"
            value={authorName}
            onChange={(e) => {
              setAuthorName(e.target.value);
              setErrors((prev) => ({ ...prev, authorName: '' }));
            }}
            placeholder="Pvz.: Rūta M."
            maxLength={50}
            className={`w-full px-4 py-3 rounded-xl border ${errors.authorName ? 'border-red-400' : 'border-gray-200 dark:border-slate-600'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 placeholder:text-slate-400`}
          />
          {errors.authorName && <p className="text-red-500 text-xs mt-1">{errors.authorName}</p>}
        </div>

        {/* City (optional) */}
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Miestas <span className="text-slate-400 font-normal">(neprivaloma)</span>
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Pvz.: Vilnius"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 placeholder:text-slate-400"
          />
        </div>

        <CaptchaWidget onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} />

        {/* Server error */}
        {serverError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm">{serverError}</p>
              <button
                type="button"
                onClick={() => setServerError('')}
                className="text-red-500 dark:text-red-400 text-xs font-medium mt-1 hover:underline"
              >
                Bandyti dar kartą
              </button>
            </div>
          </div>
        )}

        {/* Buttons — stack on mobile */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <Link
            href="/forumas"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-4 py-3 rounded-xl transition-colors text-center min-h-[48px] flex items-center justify-center"
          >
            Atšaukti
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#2d6a4f] hover:bg-[#40916c] active:bg-[#1b4332] disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors min-h-[48px] sm:min-h-[44px] flex-1 sm:flex-none inline-flex items-center justify-center gap-2"
          >
            {submitting && <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>}
            {submitting ? 'Kuriama...' : 'Sukurti įrašą'}
          </button>
        </div>
      </form>
    </div>
  );
}
