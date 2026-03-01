import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <html lang="lt" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Prevent FOUC for dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
