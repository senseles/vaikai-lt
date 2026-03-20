import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import Header from "@/components/Header";
import SessionWrapper from "@/components/SessionWrapper";
import { LanguageProvider } from "@/lib/LanguageContext";

const Footer = dynamic(() => import("@/components/Footer"));
const BackToTop = dynamic(() => import("@/components/BackToTop"), { ssr: false });
const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), { ssr: false });
const CookieConsent = dynamic(() => import("@/components/CookieConsent"), {
  ssr: false,
});
const ServiceWorkerRegistration = dynamic(
  () => import("@/components/ServiceWorkerRegistration"),
  { ssr: false }
);

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://manovaikai.lt"),
  title: {
    default: "ManoVaikai.lt — Darželių, auklių ir būrelių katalogas",
    template: "%s | ManoVaikai.lt",
  },
  description:
    "Raskite geriausią darželį, auklę, būrelį ar specialistą savo vaikui. Atsiliepimai, palyginimas, registracijos informacija visoje Lietuvoje.",
  keywords: ["darželiai", "auklės", "būreliai", "vaikų specialistai", "Vilnius", "Kaunas", "Klaipėda", "lopšelis", "darželis", "vaiko priežiūra", "ikimokyklinis ugdymas"],
  authors: [{ name: "ManoVaikai.lt" }],
  alternates: {
    canonical: "https://manovaikai.lt",
  },
  openGraph: {
    type: "website",
    locale: "lt_LT",
    url: "https://manovaikai.lt",
    siteName: "ManoVaikai.lt",
    title: "ManoVaikai.lt — Darželių, auklių ir būrelių katalogas",
    description:
      "Raskite geriausią darželį, auklę, būrelį ar specialistą savo vaikui Lietuvoje.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ManoVaikai.lt — Darželių katalogas",
    description:
      "Raskite geriausią darželį savo vaikui Lietuvoje.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" as const, "max-snippet": -1 },
  },
  verification: {
    google: 'google39b4559b0391f8d9',
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
        {/* preconnect / dns-prefetch for external domains */}
        <link rel="preconnect" href="https://www.google.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Analytics — uncomment and set domain when going live */}
        {/* <script defer data-domain="manovaikai.lt" src="https://plausible.io/js/script.js" /> */}
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
              name: 'ManoVaikai.lt',
              url: 'https://manovaikai.lt',
              logo: 'https://manovaikai.lt/icons/icon-512.png',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ManoVaikai.lt',
              url: 'https://manovaikai.lt',
              description: 'Darželių, auklių ir būrelių katalogas Lietuvoje',
              inLanguage: 'lt',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://manovaikai.lt/paieska?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', background: '#fef3c7', color: '#92400e' }}>
            Ši svetainė reikalauja JavaScript. Prašome įjungti JavaScript savo naršyklėje.
          </div>
        </noscript>
        <SessionWrapper>
          <LanguageProvider>
            <Header />
            <main id="main-content" className="flex-1 pb-20 md:pb-0 animate-fade-in">{children}</main>
            <Footer />
            <MobileBottomNav />
            <CookieConsent />
            <BackToTop />
            <ServiceWorkerRegistration />
          </LanguageProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
