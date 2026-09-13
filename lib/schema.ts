import { site, contact, faq, treatments, treatmentPlan, pages } from "@/lib/site";
import { images, type ImageName } from "@/lib/images.generated";
import { lastModified, type SitePath } from "@/lib/lastmod";

/**
 * JSON-LD pro Route — die drei Blöcke aus dem Schema-Audit (findings/schema.md, Abschnitt 5), aus den Inhalten in
 * lib/site.ts aufgebaut, damit Adresse, Preise, FAQ, Titel und Descriptions nicht doppelt gepflegt werden.
 *  Startseite:   HealthAndBeautyBusiness, Person, WebSite, WebPage, zwei Services (Haarentfernung mit OfferCatalog aus
 *                dem Behandlungsplan), FAQPage
 *  Unterseiten:  nur WebPage + BreadcrumbList; Business, WebSite und Service per @id auf die Startseite referenziert
 * Bewusst ohne geo, sameAs, openingHoursSpecification und aggregateRating: dafür gibt es keine belegten Daten.
 * Nur aus Server-Code importieren (lastModified nutzt git zur Build-Zeit).
 */
const D = site.domain;
const ID = {
  business: `${D}/#business`,
  person: `${D}/#person-andrea`,
  website: `${D}/#website`,
  haar: `${D}/#service-haarentfernung`,
  fuss: `${D}/#service-fusspflege`,
} as const;

/* Grösste erzeugte Fallback-Variante (JPEG/PNG) eines Bilds aus der Pipeline, absolute URL */
const img = (name: ImageName) => {
  const m = images[name];
  return `${D}/img/${name}-${m.widths[m.widths.length - 1]}.${m.fallback}`;
};
const area = [{ "@type": "AdministrativeArea", name: "Thurgau" }, { "@type": "Place", name: "Ostschweiz" }];
const chf = (price: string) => price.replace(/\D/g, "");
/* «CHF 40.–» → Offer mit price; «ab CHF 200.–» → AggregateOffer mit lowPrice (Richtpreis nach oben offen) */
const offer = (position: number, name: string, category: string, price: string) => ({
  "@type": price.startsWith("ab") ? "AggregateOffer" : "Offer",
  position,
  name,
  category,
  ...(price.startsWith("ab") ? { lowPrice: chf(price) } : { price: chf(price) }),
  priceCurrency: "CHF",
  url: `${D}/behandlungsplan/`,
});
const planEntries = treatmentPlan.flatMap((z) => z.entries.map((e) => ({ zone: z.zone, ...e })));
const planOffers = planEntries.map((e, i) => offer(i + 1, e.name, e.zone, e.price));
const prices = planEntries.map((e) => Number(chf(e.price)));
const priceRange = `CHF ${Math.min(...prices)}–${Math.max(...prices)}`;

/* Kurzbeschreibung des Geschäfts (Audit-Block); die Meta-Description der Startseite ist seit dem Audit eine andere */
const BUSINESS_DESCRIPTION =
  "Permanente, schmerzarme Haarentfernung mit der einzigartigen MPL4-Lichttechnologie, für dauerhaft glatte Haut. Persönlich bei Andrea Schoch in Neukirch-Egnach (TG).";
/* Dritte-Person-Fassung des «Über mich»-Texts (Audit-Block), gleiche Fakten */
const PERSON_DESCRIPTION =
  "Gelernte medizinische Praxisassistentin (MPA) mit langjähriger Erfahrung im Gesundheitsbereich, unter anderem am Kantonsspital St. Gallen. Seit 2003 führt Andrea Schoch ihre eigene Praxis Schoch Cosmetic in Neukirch-Egnach (Kanton Thurgau), spezialisiert auf permanente Haarentfernung mit MPL4-Technologie und professionelle Fusspflege.";

const webPage = (path: SitePath, extra: Record<string, unknown> = {}) => ({
  "@type": "WebPage",
  "@id": `${D}${path}#webpage`,
  url: `${D}${path}`,
  name: pages[path].title,
  description: pages[path].description,
  isPartOf: { "@id": ID.website },
  inLanguage: "de-CH",
  dateModified: lastModified(path),
  ...extra,
});
const breadcrumb = (path: SitePath, label: string) => ({
  "@type": "BreadcrumbList",
  "@id": `${D}${path}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: `${D}/` },
    { "@type": "ListItem", position: 2, name: label, item: `${D}${path}` },
  ],
});

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HealthAndBeautyBusiness",
      "@id": ID.business,
      name: site.name,
      description: BUSINESS_DESCRIPTION,
      url: `${D}/`,
      telephone: contact.phoneHref.replace("tel:", ""),
      email: contact.email,
      logo: { "@type": "ImageObject", url: img("logo-schoch-cosmetic") },
      image: [img("Hero2x"), img("schochxy"), img("foto5")],
      priceRange,
      currenciesAccepted: "CHF",
      founder: { "@id": ID.person },
      employee: { "@id": ID.person },
      foundingDate: String(site.since),
      address: {
        "@type": "PostalAddress",
        streetAddress: contact.street,
        postalCode: contact.zip,
        addressLocality: contact.city,
        addressRegion: "TG",
        addressCountry: "CH",
      },
      hasMap: contact.mapsUrl,
      areaServed: area,
      knowsAbout: ["Permanente Haarentfernung", "MPL4 Multipulselight Technologie", "Fusspflege"],
      makesOffer: [{ "@id": ID.haar }, { "@id": ID.fuss }],
    },
    {
      "@type": "Person",
      "@id": ID.person,
      name: site.founder,
      jobTitle: "Inhaberin",
      description: PERSON_DESCRIPTION,
      image: img("schochxy"),
      knowsAbout: ["Permanente Haarentfernung", "MPL4-Technologie", "Medizinische Fusspflege"],
      worksFor: { "@id": ID.business },
      url: `${D}/#ueber-mich`,
    },
    { "@type": "WebSite", "@id": ID.website, name: site.name, url: `${D}/`, inLanguage: "de-CH", publisher: { "@id": ID.business } },
    webPage("/", { about: { "@id": ID.business }, primaryImageOfPage: { "@type": "ImageObject", url: img("Hero2x") } }),
    {
      "@type": "Service",
      "@id": ID.haar,
      name: "Permanente Haarentfernung mit MPL4",
      serviceType: "Permanente Haarentfernung",
      description: treatments[0].text,
      provider: { "@id": ID.business },
      areaServed: area,
      url: `${D}/#leistungen`,
      image: img(treatments[0].image),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Preise pro Zone – Permanente Haarentfernung",
        url: `${D}/behandlungsplan/`,
        itemListElement: planOffers,
      },
    },
    {
      "@type": "Service",
      "@id": ID.fuss,
      name: "Medizinische Fusspflege",
      serviceType: "Medizinische Fusspflege",
      description: treatments[1].text,
      provider: { "@id": ID.business },
      areaServed: area,
      url: `${D}/#leistungen`,
      image: img(treatments[1].image),
    },
    {
      "@type": "FAQPage",
      "@id": `${D}/#faq`,
      mainEntity: faq.items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
  ],
};

export const planJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    webPage("/behandlungsplan/", { about: { "@id": ID.business }, mainEntity: { "@id": ID.haar }, breadcrumb: { "@id": `${D}/behandlungsplan/#breadcrumb` } }),
    breadcrumb("/behandlungsplan/", "Behandlungsplan"),
  ],
};

export const impressumJsonLd = {
  "@context": "https://schema.org",
  "@graph": [webPage("/impressum/", { breadcrumb: { "@id": `${D}/impressum/#breadcrumb` } }), breadcrumb("/impressum/", "Impressum")],
};
