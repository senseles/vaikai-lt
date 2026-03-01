import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import { LanguageProvider } from "@/lib/LanguageContext";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vaikai.lt — Darželiai, auklės, būreliai ir specialistai visoje Lietuvoje",
  description:
    "Darželiai, auklės, būreliai ir vaikų specialistai visoje Lietuvoje. Atsiliepimai, vertinimai ir palyginimas. Vilnius, Kaunas, Klaipėda, Šiauliai, Panevėžys ir kiti miestai.",
  keywords:
    "darželiai, auklės, būreliai, specialistai, lopšelis, atsiliepimai, Vilnius, Kaunas, Klaipėda, Šiauliai, Panevėžys, vaikų ugdymas, Lietuva",
  authors: [{ name: "Vaikai.lt" }],
  metadataBase: new URL("https://vaikai.lt"),
  alternates: {
    canonical: "/",
    languages: { lt: "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    title: "Vaikai.lt — Darželiai, auklės, būreliai ir specialistai",
    description:
      "Padedame tėveliams visoje Lietuvoje rasti darželius, aukles, būrelius ir specialistus. Skaitykite atsiliepimus, palyginkite ir rinkitės!",
    url: "https://vaikai.lt/",
    siteName: "Vaikai.lt",
    locale: "lt_LT",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vaikai.lt — Darželiai, auklės, būreliai ir specialistai visoje Lietuvoje",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaikai.lt — Darželiai, auklės, būreliai ir specialistai",
    description:
      "Padedame tėveliams visoje Lietuvoje rasti darželius, aukles, būrelius ir specialistus.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👶</text></svg>",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#2d6a4f",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lt" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Analytics — uncomment and set domain when going live */}
        {/* <script defer data-domain="vaikai.lt" src="https://plausible.io/js/script.js" /> */}
        {/* Prevent FOUC for dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Vaikai.lt',
              url: 'https://vaikai.lt',
              logo: 'https://vaikai.lt/icons/icon-512.png',
              description:
                'Padedame tėveliams visoje Lietuvoje rasti darželius, aukles, būrelius ir specialistus.',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: 'Lithuanian',
              },
            }),
          }}
        />
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
          <BackToTop />
        </LanguageProvider>
      </body>
    </html>
  );
}
