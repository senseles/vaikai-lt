export type Locale = 'lt' | 'en';

export const translations: Record<Locale, Record<string, string>> = {
  lt: {
    // Header
    'nav.cities': 'Miestai',
    'nav.favorites': 'Mėgstamiausieji',
    'nav.faq': 'D.U.K.',
    'nav.language': 'Pasirinkti kalbą',
    'nav.darkMode': 'Perjungti tamsų režimą',
    'nav.openMenu': 'Atidaryti meniu',
lets pu
    // Home page
    'home.hero.title': 'Raskite geriausią darželį, auklę ar būrelį savo vaikui',
    'home.hero.subtitle': 'Patikimi atsiliepimai ir vertinimai iš tikrų tėvų visoje Lietuvoje',
    'home.search.placeholder': 'Ieškoti pagal pavadinimą, miestą...',
    'home.cities.title': 'Miestai',
    'home.recentlyViewed': 'Neseniai peržiūrėta',

    // Categories
    'cat.darzeliai': 'Darželiai',
    'cat.aukles': 'Auklės',
    'cat.bureliai': 'Būreliai',
    'cat.specialistai': 'Specialistai',

    // Filters
    'filter.all': 'Visi',
    'filter.public': 'Valstybiniai',
    'filter.private': 'Privatūs',
    'filter.allCategories': 'Visos kategorijos',
    'filter.allSpecialties': 'Visos specializacijos',
    'filter.allDistricts': 'Visi rajonai',
    'filter.allPrices': 'Visos kainos',
    'filter.priceTo5': 'Iki 5 €/val.',
    'filter.price5to10': '5–10 €/val.',
    'filter.price10to15': '10–15 €/val.',
    'filter.priceOver15': 'Virš 15 €/val.',

    // Sort
    'sort.rating': 'Pagal įvertinimą',
    'sort.name': 'Pagal pavadinimą',
    'sort.reviews': 'Pagal atsiliepimus',
    'sort.priceAsc': 'Kaina: mažiausia',
    'sort.priceDesc': 'Kaina: didžiausia',

    // Cards
    'card.reviews': 'atsiliepimai',
    'card.review': 'atsiliepimas',
    'card.noReviews': 'Dar nėra atsiliepimų',
    'card.compare': 'Palyginti',
    'card.type': 'Tipas',
    'card.age': 'Amžius nuo',
    'card.hours': 'Darbo laikas',
    'card.experience': 'Patirtis',
    'card.hourlyRate': 'Valandinis tarifas',
    'card.category': 'Kategorija',
    'card.price': 'Kaina',
    'card.specialty': 'Specializacija',
    'card.clinic': 'Klinika',

    // Detail modal
    'detail.reviews': 'Atsiliepimai',
    'detail.writeReview': 'Parašyti atsiliepimą',
    'detail.share': 'Dalintis',
    'detail.copyLink': 'Kopijuoti nuorodą',
    'detail.copied': 'Nukopijuota!',
    'detail.viewOnMap': 'Žiūrėti žemėlapyje',
    'detail.close': 'Uždaryti',

    // Pagination
    'pagination.prev': '← Ankstesnis',
    'pagination.next': 'Kitas →',

    // Compare
    'compare.selected': 'Pasirinkta',
    'compare.compare': 'Palyginti',
    'compare.clear': 'Išvalyti',

    // Empty state
    'empty.noResults': 'Nerasta rezultatų šiame mieste.',

    // Search
    'search.title': 'Paieškos rezultatai',
    'search.placeholder': 'Ieškoti...',
    'search.noResults': 'Nieko nerasta',

    // Review form
    'review.name': 'Jūsų vardas',
    'review.rating': 'Įvertinimas',
    'review.text': 'Atsiliepimo tekstas',
    'review.submit': 'Pateikti',
    'review.success': 'Ačiū! Jūsų atsiliepimas bus peržiūrėtas.',
    'review.report': 'Pranešti',

    // Footer
    'footer.about': 'Apie mus',
    'footer.contact': 'Kontaktai',
    'footer.privacy': 'Privatumo politika',
    'footer.terms': 'Naudojimo sąlygos',
    'footer.newsletter': 'Naujienlaiškis',
    'footer.newsletterPlaceholder': 'Jūsų el. paštas',
    'footer.subscribe': 'Prenumeruoti',
    'footer.copyright': '© {year} ManoVaikai.lt. Visos teisės saugomos.',

    // Breadcrumbs
    'breadcrumb.home': 'Pradžia',

    // Cookie consent
    'cookie.text': 'Šis tinklalapis naudoja slapukus. Tęsdami naršymą, jūs sutinkate su slapukų naudojimu.',
    'cookie.accept': 'Sutinku',

    // FAQ
    'faq.title': 'Dažnai užduodami klausimai',
  },
  en: {
    // Header
    'nav.cities': 'Cities',
    'nav.favorites': 'Favorites',
    'nav.faq': 'FAQ',
    'nav.language': 'Select language',
    'nav.darkMode': 'Toggle dark mode',
    'nav.openMenu': 'Open menu',

    // Home page
    'home.hero.title': 'Find the best kindergarten, nanny, or activity for your child',
    'home.hero.subtitle': 'Trusted reviews and ratings from real parents across Lithuania',
    'home.search.placeholder': 'Search by name, city...',
    'home.cities.title': 'Cities',
    'home.recentlyViewed': 'Recently viewed',

    // Categories
    'cat.darzeliai': 'Kindergartens',
    'cat.aukles': 'Nannies',
    'cat.bureliai': 'Activities',
    'cat.specialistai': 'Specialists',

    // Filters
    'filter.all': 'All',
    'filter.public': 'Public',
    'filter.private': 'Private',
    'filter.allCategories': 'All categories',
    'filter.allSpecialties': 'All specialties',
    'filter.allDistricts': 'All districts',
    'filter.allPrices': 'All prices',
    'filter.priceTo5': 'Up to 5 €/h',
    'filter.price5to10': '5–10 €/h',
    'filter.price10to15': '10–15 €/h',
    'filter.priceOver15': 'Over 15 €/h',

    // Sort
    'sort.rating': 'By rating',
    'sort.name': 'By name',
    'sort.reviews': 'By reviews',
    'sort.priceAsc': 'Price: lowest',
    'sort.priceDesc': 'Price: highest',

    // Cards
    'card.reviews': 'reviews',
    'card.review': 'review',
    'card.noReviews': 'No reviews yet',
    'card.compare': 'Compare',
    'card.type': 'Type',
    'card.age': 'Age from',
    'card.hours': 'Working hours',
    'card.experience': 'Experience',
    'card.hourlyRate': 'Hourly rate',
    'card.category': 'Category',
    'card.price': 'Price',
    'card.specialty': 'Specialty',
    'card.clinic': 'Clinic',

    // Detail modal
    'detail.reviews': 'Reviews',
    'detail.writeReview': 'Write a review',
    'detail.share': 'Share',
    'detail.copyLink': 'Copy link',
    'detail.copied': 'Copied!',
    'detail.viewOnMap': 'View on map',
    'detail.close': 'Close',

    // Pagination
    'pagination.prev': '← Previous',
    'pagination.next': 'Next →',

    // Compare
    'compare.selected': 'Selected',
    'compare.compare': 'Compare',
    'compare.clear': 'Clear',

    // Empty state
    'empty.noResults': 'No results found in this city.',

    // Search
    'search.title': 'Search results',
    'search.placeholder': 'Search...',
    'search.noResults': 'Nothing found',

    // Review form
    'review.name': 'Your name',
    'review.rating': 'Rating',
    'review.text': 'Review text',
    'review.submit': 'Submit',
    'review.success': 'Thank you! Your review will be reviewed.',
    'review.report': 'Report',

    // Footer
    'footer.about': 'About us',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy policy',
    'footer.terms': 'Terms of use',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterPlaceholder': 'Your email',
    'footer.subscribe': 'Subscribe',
    'footer.copyright': '© {year} ManoVaikai.lt. All rights reserved.',

    // Breadcrumbs
    'breadcrumb.home': 'Home',

    // Cookie consent
    'cookie.text': 'This website uses cookies. By continuing to browse, you agree to the use of cookies.',
    'cookie.accept': 'Accept',

    // FAQ
    'faq.title': 'Frequently asked questions',
  },
};

export function t(locale: Locale, key: string, params?: Record<string, string>): string {
  let text = translations[locale]?.[key] ?? translations.lt[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
  }
  return text;
}
