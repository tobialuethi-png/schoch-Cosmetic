import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/cormorant";
import { site, contact } from "@/lib/site";
import SmokeBg from "@/components/SmokeBg";

const description =
  "Permanente, schmerzarme Haarentfernung mit der einzigartigen MPL4-Lichttechnologie – für dauerhaft glatte Haut. Persönlich bei Andrea Schoch in Neukirch-Egnach (TG).";
const title =
  "Schoch Cosmetic | Permanente Haarentfernung mit MPL4-Technologie";

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title,
  description,
  alternates: { canonical: "/" },
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  formatDetection: { telephone: true },
  openGraph: {
    type: "website",
    locale: "de_CH",
    siteName: site.name,
    title,
    description,
    url: site.domain,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f0e3",
  width: "device-width",
  initialScale: 1,
};

// Strukturierte Daten: lokales Beauty-/Aesthetik-Business + Service
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HealthAndBeautyBusiness",
      "@id": `${site.domain}/#business`,
      name: site.name,
      description,
      url: site.domain,
      telephone: "+41793815251",
      email: contact.email,
      image: `${site.domain}/og.png`,
      priceRange: "$$",
      founder: { "@type": "Person", name: site.founder },
      foundingDate: "2003",
      currenciesAccepted: "CHF",
      address: {
        "@type": "PostalAddress",
        streetAddress: contact.street,
        postalCode: contact.zip,
        addressLocality: contact.city,
        addressCountry: "CH",
      },
      areaServed: [
        { "@type": "AdministrativeArea", name: "Thurgau" },
        { "@type": "AdministrativeArea", name: "Ostschweiz" },
      ],
      knowsAbout: [
        "Permanente Haarentfernung",
        "MPL4 Multipulselight Technologie",
        "Fusspflege",
      ],
      sameAs: [],
    },
    {
      "@type": "Service",
      "@id": `${site.domain}/#service-haarentfernung`,
      serviceType: "Permanente Haarentfernung mit MPL4-Technologie",
      provider: { "@id": `${site.domain}/#business` },
      areaServed: "Thurgau, Schweiz",
      description:
        "Dauerhafte, schmerzarme Haarentfernung mit der Multipulselight 4G-Technologie, geeignet für nahezu jede Hauttönung.",
    },
  ],
};

// Animations-Gate: setzt Initialzustände nur, wenn JS aktiv & Motion erlaubt.
// Verhindert FOUC und hält Inhalte ohne JS sichtbar.
const animGate = `(function () {
  try {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    document.documentElement.classList.add("anim");
    window.setTimeout(function () {
      if (!window.__schochReady)
        document.documentElement.classList.remove("anim");
    }, 2500);
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className="grain">
      <body>
        <script dangerouslySetInnerHTML={{ __html: animGate }} />

        {/* Dezenter, goldener Smoke-Hintergrund (WebGL, rein dekorativ) */}
        <SmokeBg />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-cream focus:font-medium"
        >
          Zum Inhalt springen
        </a>

        {children}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
