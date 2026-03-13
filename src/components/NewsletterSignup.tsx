"use client";

import { useState, FormEvent } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Prašome įvesti galiojantį el. pašto adresą.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Klaida. Bandykite vėliau.");
        return;
      }

      setSuccessMessage(data.message || "Prenumerata patvirtinta!");
      setSubscribed(true);
    } catch {
      setError("Nepavyko prisijungti. Bandykite vėliau.");
    } finally {
      setLoading(false);
    }
  }

  if (subscribed) {
    return (
      <p className="text-sm text-green-600 dark:text-green-400 mt-3 font-medium">
        {successMessage || "Ačiū! Prenumerata patvirtinta."}
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
          placeholder="jūsų@paštas.lt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full min-w-0 text-base rounded-l-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 bg-primary hover:bg-primary/90 active:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 min-h-[44px] rounded-r-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Siunčiama..." : "Prenumeruoti"}
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
