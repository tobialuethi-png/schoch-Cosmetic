import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Instrument_Sans, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { site, pages } from "@/lib/site";
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
  ...pageMetadata({ ...pages["/"], path: "/" }),
  // Monogramm-Icons (scripts/make-icons.mjs aus public/favicon.svg): ICO für Browser-Probes und Link-Vorschauen,
  // SVG für moderne Browser, Apple-Icon 180 px, 192/512 px über das Manifest
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "32x32" }, { url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true, "max-image-preview": "large" },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = { themeColor: "#fbf7f1", width: "device-width", initialScale: 1 };


const speculationRules = { prefetch: [{ urls: ["/behandlungsplan/", "/impressum/"], eagerness: "moderate" }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={`no-js ${serif.variable} ${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        {/* JSON-LD liegt pro Route im Body (components/JsonLd.tsx, lib/schema.ts) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.remove('no-js')" }} />
        {/* Speculation Rules: HTML der Unterseiten bei Hover/Pointerdown vorab holen (prefetch, nicht prerender — ein
            vorgerendertes Dokument hätte seine Eintrittsanimationen schon unsichtbar abgespielt). Wirkt bei harten
            Navigationen, etwa Klicks vor der Hydration; Klicks über TransitionLink laufen weiter über den Next-Router. */}
        <script type="speculationrules" dangerouslySetInnerHTML={{ __html: JSON.stringify(speculationRules) }} />
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
