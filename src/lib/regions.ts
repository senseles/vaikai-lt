/**
 * Lithuanian regions and city mappings.
 * Extracted from the original darzeliai-atsiliepimai/script.js
 */

export const REGIONS: Record<string, readonly string[]> = {
  'Vilniaus': ['Vilnius', 'Ukmergė', 'Elektrėnai', 'Šalčininkai', 'Širvintos', 'Švenčionys', 'Trakai', 'Vilniaus r.'],
  'Kauno': ['Kaunas', 'Jonava', 'Kėdainiai', 'Prienai', 'Raseiniai', 'Kaišiadorys', 'Birštonas'],
  'Klaipėdos': ['Klaipėda', 'Palanga', 'Šilutė', 'Kretinga', 'Skuodas', 'Neringa'],
  'Šiaulių': ['Šiauliai', 'Joniškis', 'Pakruojis', 'Radviliškis', 'Kelmė', 'Akmenė'],
  'Panevėžio': ['Panevėžys', 'Rokiškis', 'Biržai', 'Pasvalys', 'Kupiškis'],
  'Alytaus': ['Alytus', 'Druskininkai', 'Lazdijai', 'Varėna'],
  'Marijampolės': ['Marijampolė', 'Vilkaviškis', 'Šakiai', 'Kazlų Rūda', 'Kalvarija'],
  'Utenos': ['Utena', 'Visaginas', 'Molėtai', 'Anykščiai', 'Zarasai', 'Ignalina'],
  'Telšių': ['Telšiai', 'Mažeikiai', 'Plungė', 'Rietavas'],
  'Tauragės': ['Tauragė', 'Jurbarkas', 'Šilalė', 'Pagėgiai'],
} as const;

/** Map of city → region name */
export const CITY_TO_REGION: Record<string, string> = Object.entries(REGIONS).reduce(
  (acc, [region, cities]) => {
    for (const city of cities) {
      acc[city] = region;
    }
    return acc;
  },
  {} as Record<string, string>,
);

/** Flat list of all cities */
export const ALL_CITIES: readonly string[] = Object.values(REGIONS).flat();

/** Top 5 major cities */
export const TOP_CITIES: readonly string[] = ['Vilnius', 'Kaunas', 'Klaipėda', 'Šiauliai', 'Panevėžys'] as const;

/** All region names */
export const REGION_NAMES: readonly string[] = Object.keys(REGIONS);
