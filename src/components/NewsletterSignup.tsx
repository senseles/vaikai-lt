"use client";

import { useState, FormEvent } from "react";

const STORAGE_KEY = "vaikai_newsletter_email";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Prašome įvesti galiojantį el. pašto adresą.");
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!existing.includes(trimmed)) {
        existing.push(trimmed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }
    } catch {
      // localStorage unavailable — ignore silently
    }

    setSubscribed(true);
  }

  if (subscribed) {
    return (
      <p className="text-sm text-green-600 dark:text-green-400 mt-3 font-medium">
        Ačiū! Prenumerata patvirtinta.
      </p>
    );
  }

  return (
    <div className="mt-3">
      <form onSubmit={handleSubmit} className="flex">
        <label htmlFor="newsletter-email" className="sr-only">
          El. pastas
        </label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="jusu@pastas.lt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full min-w-0 text-base rounded-l-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        />
        <button
          type="submit"
          className="shrink-0 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-4 py-2.5 min-h-[44px] rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          Prenumeruoti
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
