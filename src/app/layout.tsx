import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import MobileBottomNav from "@/components/MobileBottomNav";
import { LanguageProvider } from "@/lib/LanguageContext";

const CookieConsent = dynamic(() => import("@/components/CookieConsent"), {
  ssr: false,
});

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaikai.lt — Darželiai, auklės, būreliai ir specialistai",
    description:
      "Padedame tėveliams visoje Lietuvoje rasti darželius, aukles, būrelius ir specialistus.",
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
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
        {/* dns-prefetch / preconnect for external domains used in the app */}
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.google.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Pereiti prie turinio
        </a>
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
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', background: '#fef3c7', color: '#92400e' }}>
            Ši svetainė reikalauja JavaScript. Prašome įjungti JavaScript savo naršyklėje.
          </div>
        </noscript>
        <LanguageProvider>
          <Header />
          <main id="main-content" className="flex-1 pb-20 md:pb-0 animate-fade-in">{children}</main>
          <Footer />
          <MobileBottomNav />
          <CookieConsent />
          <BackToTop />
        </LanguageProvider>
      </body>
    </html>
  );
}
