"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  name: string;
  city: string;
  type: 'darzeliai' | 'aukles' | 'bureliai' | 'specialistai';
}

const typeLabels: Record<string, string> = {
  darzeliai: 'Darželis',
  aukles: 'Auklė',
  bureliai: 'Būrelis',
  specialistai: 'Specialistas',
};

const typeColors: Record<string, string> = {
  darzeliai: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  aukles: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  bureliai: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  specialistai: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const lowerText = text.toLocaleLowerCase('lt');
  const lowerQuery = query.toLocaleLowerCase('lt');
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-700/50 text-inherit rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
          setSelectedIdx(-1);
        }
      } catch {
        // Silently fail for suggestions
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (selectedIdx >= 0 && suggestions[selectedIdx]) {
      navigateToSearch(suggestions[selectedIdx].name);
    } else if (trimmed) {
      navigateToSearch(trimmed);
    }
  };

  const navigateToSearch = (q: string) => {
    setShowSuggestions(false);
    router.push(`/paieska?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className="w-full max-w-xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Ieškoti darželio, auklės, būrelio..."
            className="w-full px-5 py-3.5 pr-14 rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary dark:focus:border-primary-light focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 focus:outline-none transition-all text-base"
            aria-label="Paieška"
            autoComplete="off"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls="search-suggestions"
            aria-haspopup="listbox"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors"
            aria-label="Ieškoti"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Screen reader announcement for suggestion count */}
      <div className="sr-only" aria-live="polite" role="status">
        {showSuggestions && suggestions.length > 0 && `${suggestions.length} pasiūlymų`}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden animate-fade-in"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.type}-${s.name}-${i}`}
              role="option"
              aria-selected={i === selectedIdx}
              className={`px-4 py-2.5 cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                i === selectedIdx
                  ? 'bg-primary/10 dark:bg-primary/20'
                  : 'hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
              onMouseEnter={() => setSelectedIdx(i)}
              onClick={() => navigateToSearch(s.name)}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {highlightMatch(s.name, query)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.city}</div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${typeColors[s.type]}`}>
                {typeLabels[s.type]}
              </span>
            </li>
          ))}
          <li
            className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700"
            onClick={() => navigateToSearch(query)}
          >
            Ieškoti &bdquo;{query}&ldquo; visur →
          </li>
        </ul>
      )}
    </div>
  );
}
