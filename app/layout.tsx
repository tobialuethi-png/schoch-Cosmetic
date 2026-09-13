import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Instrument_Sans, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { site, contact } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { TransitionProvider } from "@/components/motion/Transition";
import PageMotion from "@/components/motion/PageMotion";
import Nav from "@/components/Nav";
import Footer from "@/components/sections/Footer";

const serif = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-instrument-serif", display: "swap" });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
// Hero-Display: Bodoni Moda (OFL, optische Grösse → hauchdünne Haarlinien im Display) — nur für die Hero-Headline
const display = Bodoni_Moda({ weight: ["400"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-display-hero", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  ...pageMetadata({ title: site.title, description: site.description, path: "/" }),
  // favicon.ico (16/32/48 px) für Browser-Probes und Link-Vorschauen, SVG für moderne Browser
  icons: { icon: [{ url: "/favicon.ico", sizes: "32x32" }, { url: "/favicon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = { themeColor: "#fbf7f1", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HealthAndBeautyBusiness",
      "@id": `${site.domain}/#business`,
      name: site.name,
      description: site.description,
      url: site.domain,
      telephone: "+41793815251",
      email: contact.email,
      image: `${site.domain}/og.png`,
      priceRange: "$$",
      founder: { "@type": "Person", name: site.founder },
      foundingDate: "2003",
      currenciesAccepted: "CHF",
      address: { "@type": "PostalAddress", streetAddress: contact.street, postalCode: contact.zip, addressLocality: contact.city, addressCountry: "CH" },
      areaServed: [{ "@type": "AdministrativeArea", name: "Thurgau" }, { "@type": "AdministrativeArea", name: "Ostschweiz" }],
      knowsAbout: ["Permanente Haarentfernung", "MPL4 Multipulselight Technologie", "Fusspflege"],
    },
    { "@type": "Service", name: "Permanente Haarentfernung mit MPL4", provider: { "@id": `${site.domain}/#business` }, areaServed: "Ostschweiz" },
    { "@type": "Service", name: "Medizinische Fusspflege", provider: { "@id": `${site.domain}/#business` }, areaServed: "Ostschweiz" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={`no-js ${serif.variable} ${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.remove('no-js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Zum Inhalt springen</a>
        <SmoothScroll />
        <TransitionProvider>
          <Nav />
          <PageMotion>
            <main id="main" className="relative z-[2]">{children}</main>
            <Footer />
          </PageMotion>
        </TransitionProvider>
      </body>
    </html>
  );
}
