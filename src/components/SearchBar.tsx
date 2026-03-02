"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  name: string;
  city: string;
  slug: string;
  type: 'darzeliai' | 'aukles' | 'bureliai' | 'specialistai';
  itemType: string;
  rating: number;
  citySlug: string;
  url: string;
}

const typeLabels: Record<string, string> = {
  darzeliai: 'Darzelis',
  aukles: 'Aukle',
  bureliai: 'Burelis',
  specialistai: 'Specialistas',
};

const typeIcons: Record<string, string> = {
  darzeliai: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  aukles: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  bureliai: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  specialistai: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
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

interface SearchBarProps {
  /** Auto-focus the input on mount */
  readonly autoFocus?: boolean;
  /** Compact mode for use in headers or tight spaces */
  readonly compact?: boolean;
}

export default function SearchBar({ autoFocus, compact }: SearchBarProps = {}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const abortRef = useRef<AbortController | null>(null);

  // Fetch suggestions with debounce (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
          setSelectedIdx(-1);
        }
      } catch {
        // Silently fail for suggestions (including abort)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      controller.abort();
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

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const navigateToSuggestion = useCallback((suggestion: Suggestion) => {
    setShowSuggestions(false);
    setQuery("");
    router.push(suggestion.url);
  }, [router]);

  const navigateToSearch = useCallback((q: string) => {
    setShowSuggestions(false);
    router.push(`/paieska?q=${encodeURIComponent(q)}`);
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (selectedIdx >= 0 && suggestions[selectedIdx]) {
      navigateToSuggestion(suggestions[selectedIdx]);
    } else if (trimmed) {
      navigateToSearch(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      // Allow Escape to close even with no suggestions visible
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIdx(prev => (prev + 1) % (suggestions.length + 1)); // +1 for "search all" item
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIdx(prev => (prev <= 0 ? suggestions.length : prev - 1));
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
      case 'Enter':
        if (selectedIdx >= 0 && selectedIdx < suggestions.length) {
          e.preventDefault();
          navigateToSuggestion(suggestions[selectedIdx]);
        } else if (selectedIdx === suggestions.length) {
          // "Search all" item
          e.preventDefault();
          navigateToSearch(query.trim());
        }
        // else: let form submit handle it
        break;
    }
  };

  const inputHeight = compact ? 'py-2.5' : 'py-3.5';
  const inputPadding = compact ? 'px-3 pr-10' : 'px-4 sm:px-5 pr-14';

  return (
    <div ref={wrapperRef} className="w-full max-w-xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ieskoti darzelio, aukles, burelio..."
            className={`w-full ${inputPadding} ${inputHeight} rounded-xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary dark:focus:border-primary-light focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 focus:outline-none transition-all text-base`}
            aria-label="Paieska"
            autoComplete="off"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls="search-suggestions"
            aria-haspopup="listbox"
            aria-activedescendant={selectedIdx >= 0 ? `suggestion-${selectedIdx}` : undefined}
          />
          {/* Loading spinner or search icon */}
          <button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors ${compact ? 'w-8 h-8' : 'w-10 h-10'}`}
            aria-label="Ieskoti"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Screen reader announcement for suggestion count */}
      <div className="sr-only" aria-live="polite" role="status">
        {isLoading && 'Ieskoma...'}
        {showSuggestions && !isLoading && suggestions.length > 0 && `${suggestions.length} pasiulymu`}
        {showSuggestions && !isLoading && suggestions.length === 0 && query.trim().length >= 2 && 'Nieko nerasta'}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && query.trim().length >= 2 && (
        <ul
          id="search-suggestions"
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden animate-fade-in max-h-[70vh] overflow-y-auto"
          role="listbox"
        >
          {suggestions.length === 0 && !isLoading && (
            <li className="px-4 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Nieko nerasta pagal &bdquo;{query}&ldquo;
            </li>
          )}

          {suggestions.map((s, i) => (
            <li
              key={`${s.type}-${s.id}`}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === selectedIdx}
              className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
                i === selectedIdx
                  ? 'bg-primary/10 dark:bg-primary/20'
                  : 'hover:bg-gray-50 dark:hover:bg-slate-700 active:bg-gray-100 dark:active:bg-slate-600'
              }`}
              onMouseEnter={() => setSelectedIdx(i)}
              onMouseLeave={() => setSelectedIdx(-1)}
              onClick={() => navigateToSuggestion(s)}
            >
              {/* Type icon */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColors[s.type]}`}>
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={typeIcons[s.type]} />
                </svg>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {highlightMatch(s.name, query)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{s.city}</span>
                  {s.rating > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-amber-500 shrink-0">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {s.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Type badge */}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${typeColors[s.type]}`}>
                {typeLabels[s.type]}
              </span>
            </li>
          ))}

          {/* "Search all" footer item */}
          {suggestions.length > 0 && (
            <li
              id={`suggestion-${suggestions.length}`}
              role="option"
              aria-selected={selectedIdx === suggestions.length}
              className={`px-4 py-2.5 text-sm border-t border-gray-100 dark:border-slate-700 cursor-pointer flex items-center gap-2 transition-colors ${
                selectedIdx === suggestions.length
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-primary dark:hover:text-primary-light'
              }`}
              onMouseEnter={() => setSelectedIdx(suggestions.length)}
              onMouseLeave={() => setSelectedIdx(-1)}
              onClick={() => navigateToSearch(query.trim())}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>
                Ieskoti &bdquo;{query.trim()}&ldquo; visur
              </span>
              <svg className="w-3 h-3 ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
