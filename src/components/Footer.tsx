import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";

const DIACRITICS: Record<string, string> = { ą: 'a', č: 'c', ę: 'e', ė: 'e', į: 'i', š: 's', ų: 'u', ū: 'u', ž: 'z' };
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[ąčęėįšųūž]/g, (c) => DIACRITICS[c] ?? c);
}

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-primary mb-3">
              <span aria-hidden="true">👶</span>
              <span>Vaikai<span className="text-secondary">.lt</span></span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Padedame tėveliams rasti geriausias paslaugas vaikams visoje Lietuvoje.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Kategorijos</h3>
            <ul className="space-y-2">
              {[
                { label: "Darželiai", href: "/vilnius?category=darzeliai" },
                { label: "Auklės", href: "/vilnius?category=aukles" },
                { label: "Būreliai", href: "/vilnius?category=bureliai" },
                { label: "Specialistai", href: "/vilnius?category=specialistai" },
              ].map((cat) => (
                <li key={cat.label}>
                  <Link href={cat.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Miestai</h3>
            <ul className="space-y-2">
              {["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus", "Marijampolė"].map((city) => (
                <li key={city}>
                  <Link
                    href={`/${toSlug(city)}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Naujienlaiškis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gaukite naujausias žinias apie vaikiškų paslaugų naujienas.
            </p>
            <NewsletterSignup />

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 mt-6 text-sm uppercase tracking-wider">Informacija</h3>
            <ul className="space-y-2">
              <li><Link href="/#duk" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">D.U.K.</Link></li>
              <li><Link href="/privatumo-politika" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Privatumo politika</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Vaikai.lt. Visos teisės saugomos.
        </div>
      </div>
    </footer>
  );
}
