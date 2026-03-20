import StarRating from "./StarRating";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "ManoVaikai.lt padėjo rasti puikų darželį šalia namų. Labai patogi palyginimo funkcija!",
    author: "Inga M.",
    role: "Mama, Vilnius",
    rating: 5,
  },
  {
    quote:
      "Ačiū už galimybę palyginti auklių kainas ir patirtį. Radome nuostabią auklę per savaitę.",
    author: "Tomas K.",
    role: "Tėtis, Kaunas",
    rating: 5,
  },
  {
    quote:
      "Būrelių paieška dar niekada nebuvo tokia paprasta. Rekomenduoju visiems tėvams!",
    author: "Laura S.",
    role: "Mama, Klaipėda",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Ką sako tėveliai
        </h2>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 list-none p-0 m-0">
          {testimonials.map((t, i) => (
            <li key={`testimonial-${i}`}>
              <blockquote className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm min-h-0 sm:min-h-[10rem] hover:shadow-md transition-shadow h-full">
                <p className="italic text-gray-700 dark:text-gray-300 mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <footer>
                  <cite className="not-italic">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {t.author}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {t.role}
                    </span>
                  </cite>
                </footer>

                <div className="mt-2">
                  <StarRating rating={t.rating} size="sm" />
                </div>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
