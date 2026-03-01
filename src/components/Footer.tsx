import Link from "next/link";

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
              {["Darželiai", "Auklės", "Būreliai", "Specialistai"].map((cat) => (
                <li key={cat}>
                  <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Miestai</h3>
            <ul className="space-y-2">
              {["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys"].map((city) => (
                <li key={city}>
                  <Link
                    href={`/${city.toLowerCase().replace(/[ė]/g, "e").replace(/[š]/g, "s").replace(/[ž]/g, "z").replace(/[ų]/g, "u")}`}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Informacija</h3>
            <ul className="space-y-2">
              <li><Link href="/#duk" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">D.U.K.</Link></li>
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
