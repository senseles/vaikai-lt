'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CityCoords {
  name: string;
  slug: string;
  lat: number;
  lng: number;
}

const allCities: CityCoords[] = [
  { name: 'Vilnius', slug: 'vilnius', lat: 54.6872, lng: 25.2797 },
  { name: 'Kaunas', slug: 'kaunas', lat: 54.8985, lng: 23.9036 },
  { name: 'Klaipėda', slug: 'klaipeda', lat: 55.7033, lng: 21.1443 },
  { name: 'Šiauliai', slug: 'siauliai', lat: 55.9349, lng: 23.3137 },
  { name: 'Panevėžys', slug: 'panevezys', lat: 55.7348, lng: 24.3575 },
  { name: 'Palanga', slug: 'palanga', lat: 55.9204, lng: 21.0686 },
  { name: 'Šilutė', slug: 'silute', lat: 55.3485, lng: 21.4808 },
  { name: 'Tauragė', slug: 'taurage', lat: 55.2514, lng: 22.2891 },
  { name: 'Telšiai', slug: 'telsiai', lat: 55.9835, lng: 22.2465 },
  { name: 'Mažeikiai', slug: 'mazeikiai', lat: 56.3093, lng: 22.3427 },
  { name: 'Kėdainiai', slug: 'kedainiai', lat: 55.2879, lng: 23.9776 },
  { name: 'Marijampolė', slug: 'marijampole', lat: 54.5594, lng: 23.3500 },
  { name: 'Utena', slug: 'utena', lat: 55.4980, lng: 25.6027 },
  { name: 'Alytus', slug: 'alytus', lat: 54.3963, lng: 24.0459 },
  { name: 'Jonava', slug: 'jonava', lat: 55.0722, lng: 24.2800 },
  { name: 'Visaginas', slug: 'visaginas', lat: 55.5965, lng: 26.4308 },
  { name: 'Druskininkai', slug: 'druskininkai', lat: 54.0166, lng: 23.9697 },
  { name: 'Elektrėnai', slug: 'elektrenai', lat: 54.7855, lng: 24.6617 },
  { name: 'Ukmergė', slug: 'ukmerge', lat: 55.2478, lng: 24.7606 },
  { name: 'Trakai', slug: 'trakai', lat: 54.6375, lng: 24.9350 },
];

const topCities = [
  { name: 'Vilnius', slug: 'vilnius', emoji: '🏛️' },
  { name: 'Kaunas', slug: 'kaunas', emoji: '🏰' },
  { name: 'Klaipėda', slug: 'klaipeda', emoji: '⚓' },
  { name: 'Šiauliai', slug: 'siauliai', emoji: '☀️' },
  { name: 'Panevėžys', slug: 'panevezys', emoji: '🌿' },
] as const;

const regionCities: Record<string, ReadonlyArray<{ name: string; slug: string }>> = {
  'Vakarų Lietuva': [
    { name: 'Palanga', slug: 'palanga' },
    { name: 'Šilutė', slug: 'silute' },
    { name: 'Tauragė', slug: 'taurage' },
    { name: 'Telšiai', slug: 'telsiai' },
    { name: 'Mažeikiai', slug: 'mazeikiai' },
  ],
  'Vidurio Lietuva': [
    { name: 'Kėdainiai', slug: 'kedainiai' },
    { name: 'Marijampolė', slug: 'marijampole' },
    { name: 'Utena', slug: 'utena' },
    { name: 'Alytus', slug: 'alytus' },
    { name: 'Jonava', slug: 'jonava' },
  ],
  'Rytų Lietuva': [
    { name: 'Visaginas', slug: 'visaginas' },
    { name: 'Druskininkai', slug: 'druskininkai' },
    { name: 'Elektrėnai', slug: 'elektrenai' },
    { name: 'Ukmergė', slug: 'ukmerge' },
  ],
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CitySelector() {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [nearestCity, setNearestCity] = useState<string | null>(null);

  const findNearest = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let closest = allCities[0];
        let minDist = Infinity;
        for (const city of allCities) {
          const d = haversineKm(latitude, longitude, city.lat, city.lng);
          if (d < minDist) { minDist = d; closest = city; }
        }
        setNearestCity(closest.name);
        setLocating(false);
        router.push(`/${closest.slug}`);
      },
      () => { setLocating(false); },
      { timeout: 10000 }
    );
  };

  return (
    <section id="miestai" className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Pasirinkite miestą
        </h2>

        {/* Geolocation button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={findNearest}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary dark:text-green-400 bg-primary/10 dark:bg-green-900/30 rounded-full hover:bg-primary/20 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {locating ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              )}
            </svg>
            {locating ? 'Ieškoma...' : nearestCity ? `Artimiausia: ${nearestCity}` : 'Rasti artimiausią miestą'}
          </button>
        </div>

        {/* Top cities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-12">
          {topCities.map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="flex flex-col items-center gap-2 p-5 rounded-xl bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 hover:border-primary dark:hover:border-primary-light hover:shadow-lg transition-all group min-h-[6rem]"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{city.emoji}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                {city.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Regional cities */}
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(regionCities).map(([region, cities]) => (
            <div key={region}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {region}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className="px-3 py-1.5 text-sm rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-primary-bg dark:hover:bg-primary-dark hover:text-primary-dark dark:hover:text-primary-bg transition-colors"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
