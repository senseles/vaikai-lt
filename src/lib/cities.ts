/**
 * Single source of truth for all Lithuanian city data.
 * Every file that needs city slugs, names, or coordinates should import from here.
 */

export interface CityData {
  readonly slug: string;
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
}

/** All 43 supported Lithuanian cities with coordinates */
export const CITIES: readonly CityData[] = [
  { slug: 'vilnius', name: 'Vilnius', lat: 54.6872, lng: 25.2797 },
  { slug: 'kaunas', name: 'Kaunas', lat: 54.8985, lng: 23.9036 },
  { slug: 'klaipeda', name: 'Klaipėda', lat: 55.7033, lng: 21.1443 },
  { slug: 'siauliai', name: 'Šiauliai', lat: 55.9349, lng: 23.3137 },
  { slug: 'panevezys', name: 'Panevėžys', lat: 55.7348, lng: 24.3575 },
  { slug: 'palanga', name: 'Palanga', lat: 55.9204, lng: 21.0686 },
  { slug: 'silute', name: 'Šilutė', lat: 55.3485, lng: 21.4808 },
  { slug: 'taurage', name: 'Tauragė', lat: 55.2514, lng: 22.2891 },
  { slug: 'telsiai', name: 'Telšiai', lat: 55.9835, lng: 22.2465 },
  { slug: 'mazeikiai', name: 'Mažeikiai', lat: 56.3093, lng: 22.3427 },
  { slug: 'kedainiai', name: 'Kėdainiai', lat: 55.2879, lng: 23.9776 },
  { slug: 'marijampole', name: 'Marijampolė', lat: 54.5594, lng: 23.3500 },
  { slug: 'utena', name: 'Utena', lat: 55.4980, lng: 25.6027 },
  { slug: 'alytus', name: 'Alytus', lat: 54.3963, lng: 24.0459 },
  { slug: 'jonava', name: 'Jonava', lat: 55.0722, lng: 24.2800 },
  { slug: 'visaginas', name: 'Visaginas', lat: 55.5965, lng: 26.4308 },
  { slug: 'druskininkai', name: 'Druskininkai', lat: 54.0166, lng: 23.9697 },
  { slug: 'elektrenai', name: 'Elektrėnai', lat: 54.7855, lng: 24.6617 },
  { slug: 'ukmerge', name: 'Ukmergė', lat: 55.2478, lng: 24.7606 },
  { slug: 'trakai', name: 'Trakai', lat: 54.6375, lng: 24.9350 },
  { slug: 'akmene', name: 'Akmenė', lat: 56.2453, lng: 22.7472 },
  { slug: 'anyksciai', name: 'Anykščiai', lat: 55.5265, lng: 25.1029 },
  { slug: 'birzai', name: 'Biržai', lat: 56.2005, lng: 24.7522 },
  { slug: 'ignalina', name: 'Ignalina', lat: 55.3419, lng: 26.1647 },
  { slug: 'joniskis', name: 'Joniškis', lat: 56.2391, lng: 23.6152 },
  { slug: 'jurbarkas', name: 'Jurbarkas', lat: 55.0780, lng: 22.7720 },
  { slug: 'kaisiadorys', name: 'Kaišiadorys', lat: 54.8659, lng: 24.4568 },
  { slug: 'kelme', name: 'Kelmė', lat: 55.6310, lng: 22.9347 },
  { slug: 'kretinga', name: 'Kretinga', lat: 55.8897, lng: 21.2448 },
  { slug: 'kupiskis', name: 'Kupiškis', lat: 55.8394, lng: 24.9810 },
  { slug: 'lazdijai', name: 'Lazdijai', lat: 54.2331, lng: 23.5159 },
  { slug: 'moletai', name: 'Molėtai', lat: 55.2267, lng: 25.4185 },
  { slug: 'pakruojis', name: 'Pakruojis', lat: 55.9732, lng: 23.8572 },
  { slug: 'pasvalys', name: 'Pasvalys', lat: 56.0601, lng: 24.4031 },
  { slug: 'plunge', name: 'Plungė', lat: 55.9113, lng: 21.8447 },
  { slug: 'prienai', name: 'Prienai', lat: 54.6382, lng: 23.9445 },
  { slug: 'radviliskis', name: 'Radviliškis', lat: 55.8108, lng: 23.5408 },
  { slug: 'raseiniai', name: 'Raseiniai', lat: 55.3825, lng: 23.1168 },
  { slug: 'rokiskis', name: 'Rokiškis', lat: 55.9622, lng: 25.5861 },
  { slug: 'sakiai', name: 'Šakiai', lat: 54.9534, lng: 23.0481 },
  { slug: 'varena', name: 'Varėna', lat: 54.2104, lng: 24.5782 },
  { slug: 'vilkaviskis', name: 'Vilkaviškis', lat: 54.6532, lng: 23.0359 },
  { slug: 'zarasai', name: 'Zarasai', lat: 55.7316, lng: 26.2469 },
] as const;

/** Set of all valid city slugs — for fast lookup in middleware/validation */
export const VALID_CITY_SLUGS = new Set(CITIES.map((c) => c.slug));

/** Slug → display name mapping */
export const CITY_NAMES: Record<string, string> = Object.fromEntries(
  CITIES.map((c) => [c.slug, c.name]),
);

/** Array of all city slugs — for sitemap/static params */
export const CITY_SLUG_LIST: readonly string[] = CITIES.map((c) => c.slug);
