/* ============================================================
   Zentrale Inhalte & Konfiguration – Schoch Cosmetic
   Hier pflegt Andrea künftig Texte, Preise und Kontaktdaten.
   ============================================================ */

export const site = {
  name: "Schoch Cosmetic",
  legalName: "Schoch Cosmetic · Andrea Schoch",
  domain: "https://www.schoch-cosmetic.ch",
  founder: "Andrea Schoch",
  since: 2003,
  region: "Neukirch-Egnach, Thurgau",
} as const;

export const contact = {
  phoneDisplay: "079 381 52 51",
  phoneHref: "tel:+41793815251",
  whatsapp: "41793815251",
  whatsappText:
    "Grüezi Andrea, ich interessiere mich für eine Probebehandlung mit der MPL4-Technologie.",
  email: "andrea@schoch-cosmetic.ch",
  street: "Oberzelgstrasse 7B",
  zip: "9315",
  city: "Neukirch-Egnach",
  country: "Schweiz",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Oberzelgstrasse+7b+9315+Neukirch-Egnach",
} as const;

export const nav = [
  { label: "Technologie", href: "#technologie" },
  { label: "Haarentfernung", href: "#behandlungen" },
  { label: "Fusspflege", href: "#fusspflege" },
  { label: "Galerie", href: "#galerie" },
  { label: "Behandlungsplan", href: "/behandlungsplan/" },
  { label: "Über mich", href: "#ueber-mich" },
  { label: "Kontakt", href: "#kontakt" },
] as const;

/* — Kennzahlen für den Technologie-Bereich — */
export const stats = [
  { value: "2003", label: "Eigene Praxis seit" },
  { value: "5–9", label: "Sitzungen bis zum Ziel" },
  { value: "4G", label: "Multipulselight-Spektrum" },
  { value: "Ganzjährig", label: "Behandlung möglich" },
] as const;

/* — Vorteile der MPL4-Technologie — */
export const mplFeatures = [
  "Sichtbarer Erfolg in rund 5–9 Sitzungen, je nach Haut- und Haartyp",
  "Kurze Behandlungen dank schnell getakteter Lichtimpulse",
  "Angenehm entspannt, ohne Hitzegefühl oder unzumutbare Schmerzen",
  "Dauerhafte, nachhaltige Ergebnisse",
  "Geeignet für nahezu jede Hauttönung, ganzjährig freie Terminwahl",
  "Keine allergischen Reaktionen, Pigmentstörungen oder Narbenbildung",
] as const;

/* — Behandlungs-Kategorien — */
export const treatments = [
  {
    id: "haarentfernung",
    kicker: "01",
    title: "Permanente Haarentfernung",
    text: "Sanft und präzise entfernt die MPL4-Lichtimpulse unerwünschte Haare an nahezu jeder Körperstelle. Dauerhaft glatte Haut ohne Rasieren, ohne Schmerzen, ohne Kompromisse.",
    items: [
      "Oberlippe & Kinn",
      "Achseln",
      "Bikini & Intim",
      "Beine",
      "Rücken & Brust",
      "Arme & Nacken",
    ],
  },
  {
    id: "fusspflege",
    kicker: "02",
    title: "Fusspflege",
    text: "Professionelle und medizinisch fundierte Fusspflege für gesunde, gepflegte Füße. Mit viel Sorgfalt und über 20 Jahren Erfahrung, für Wohlbefinden bis in die Zehenspitzen.",
    items: [
      "Komplette Fusspflege",
      "Nagel- & Hornhautpflege",
      "Lack & Gellack auf Wunsch",
      "Auch für empfindliche Füsse",
    ],
  },
] as const;

/* — Highlight-Angebot (verifiziert) — */
export const offer = {
  badge: "Sommer-Special · −20 %",
  title: "Kombi US-Bikini & Achseln",
  price: "275",
  oldPrice: "344",
  currency: "CHF",
  note: "Gültig bis Ende Juni 2026",
  text: "Glatt und sorgenfrei in den Sommer: das ideale Kombi-Paket zum Spezialpreis. So starten Sie bedenkenlos in die warme Jahreszeit.",
} as const;

/* — Preise · nach Zonen gegliedert (Karten-Raster) — */
export const priceGroups = [
  {
    tab: "Haarentfernung",
    note: "Richtpreise pro Zone. Die definitive Höhe hängt von Fläche, Haartyp und Aufwand ab – wir klären sie in einer kurzen, unverbindlichen Beratung.",
    categories: [
      {
        title: "Gesicht",
        rows: [
          { label: "Oberlippe", value: "CHF 40.–" },
          { label: "Kinn", value: "CHF 60.–" },
          { label: "Gesicht komplett", value: "ab CHF 200.–" },
        ],
      },
      {
        title: "Körper",
        rows: [
          { label: "Achseln", value: "CHF 80.–" },
          { label: "Unterarme", value: "CHF 120.–" },
          { label: "Oberarme / Schulter", value: "ab CHF 130.–" },
          { label: "Ganze Arme", value: "ab CHF 260.–" },
        ],
      },
      {
        title: "Bikini & Beine",
        rows: [
          { label: "Bikinizone (Rand)", value: "CHF 80.–" },
          { label: "Intimbereich (Rio)", value: "CHF 180.–" },
          { label: "Komplett mit Gesäss", value: "ab CHF 250.–" },
          { label: "Unterschenkel", value: "ab CHF 180.–" },
          { label: "Oberschenkel", value: "ab CHF 250.–" },
        ],
      },
      {
        title: "Kombinationen",
        rows: [
          { label: "US-Bikini (Rand) + Achseln", value: "ab CHF 320.–" },
          { label: "Bikinizone + Achseln", value: "CHF 140.–" },
        ],
      },
      {
        title: "Mann",
        rows: [
          { label: "Bauch", value: "ab CHF 150.–" },
          { label: "Rücken", value: "ab CHF 230.–" },
          { label: "Ganze Arme", value: "ab CHF 260.–" },
        ],
      },
    ],
  },
  {
    tab: "Fusspflege",
    note: "Fixe Preise. Zusatzleistungen frei kombinierbar.",
    categories: [
      {
        title: "Fusspflege",
        rows: [{ label: "Komplettbehandlung", value: "CHF 75.–" }],
      },
      {
        title: "Zusatzleistungen",
        rows: [
          { label: "mit Lack", value: "+ CHF 5.–" },
          { label: "mit Gellack", value: "+ CHF 15.–" },
          { label: "mit Gellack entfernen", value: "+ CHF 20.–" },
        ],
      },
    ],
  },
] as const;

/* — Behandlungsplan (Unterseite) · Richtwerte pro Zone —
   Gesicht & Körper: Werte gemäss Vorgabe. Bikini & Beine sowie Mann sind
   konsistent fortgeschriebene Richtwerte (bei Bedarf anpassen). `sessionsMax`
   steuert nur die Punkt-Anzeige (gefüllte Punkte von 9). */
export const treatmentPlanIntro = {
  eyebrow: "Behandlungsplan",
  title: "Ihr persönlicher Behandlungsplan",
  lead: "Wie viele Behandlungen brauche ich wirklich? Hier finden Sie für jede Körperzone die typische Anzahl Sitzungen, den Abstand zwischen den Terminen und die Gesamtdauer bis zur permanenten Haarentfernung.",
  chips: [
    "Alle Angaben sind Richtwerte, individuelle Beratung auf Anfrage",
    "MPL4 Xenonlicht-Technologie",
    "Schmerzfreie Wasserkühlung",
  ],
  why: {
    title: "Warum mehrere Behandlungen?",
    text: "Haare wachsen in drei Phasen: Wachstum, Übergang und Ruhe. Das MPL4-Licht wirkt nur in der aktiven Wachstumsphase. Da nicht alle Haare gleichzeitig in dieser Phase sind, sind mehrere Sitzungen im angegebenen Abstand nötig, um alle Haarfollikel dauerhaft zu deaktivieren.",
  },
} as const;

export const treatmentPlan = [
  {
    zone: "Gesicht",
    icon: "face",
    entries: [
      { name: "Oberlippe", price: "CHF 40.–", duration: "ca. 5 Minuten", interval: "alle 2–4 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 3–7 Monate" },
      { name: "Kinn", price: "CHF 60.–", duration: "ca. 10 Minuten", interval: "alle 2–4 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 3–7 Monate" },
      { name: "Gesicht komplett", price: "ab CHF 200.–", duration: "ca. 20 Minuten", interval: "alle 3 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 3–6 Monate" },
    ],
  },
  {
    zone: "Körper",
    icon: "body",
    entries: [
      { name: "Achseln", price: "CHF 80.–", duration: "ca. 15 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 6–14 Monate" },
      { name: "Unterarme", price: "CHF 120.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 4–14 Monate" },
      { name: "Ganze Arme", price: "ab CHF 260.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 4–14 Monate" },
      { name: "Oberarme / Schulter", price: "ab CHF 130.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 4–14 Monate" },
    ],
  },
  {
    zone: "Bikini & Beine",
    icon: "legs",
    entries: [
      { name: "Bikinizone (Rand)", price: "CHF 80.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–18 Monate" },
      { name: "Intimbereich (Rio)", price: "CHF 180.–", duration: "ca. 30 Minuten", interval: "alle 4–8 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–18 Monate" },
      { name: "Komplett mit Gesäss", price: "ab CHF 250.–", duration: "ca. 30 Minuten", interval: "alle 4–8 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–18 Monate" },
      { name: "Unterschenkel", price: "ab CHF 180.–", duration: "ca. 40 Minuten", interval: "alle 4–12 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–27 Monate" },
      { name: "Oberschenkel", price: "ab CHF 250.–", duration: "ca. 40 Minuten", interval: "alle 4–12 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–27 Monate" },
    ],
  },
  {
    zone: "Mann",
    icon: "man",
    entries: [
      { name: "Bauch", price: "ab CHF 150.–", duration: "ca. 30–40 Minuten", interval: "alle 4–8 Wochen", sessions: "6–9 Behandlungen", sessionsMax: 9, total: "ca. 6–18 Monate" },
      { name: "Rücken", price: "ab CHF 230.–", duration: "ca. 45–60 Minuten", interval: "alle 4–8 Wochen", sessions: "6–9 Behandlungen", sessionsMax: 9, total: "ca. 6–18 Monate" },
      { name: "Ganze Arme", price: "ab CHF 260.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 4–14 Monate" },
    ],
  },
] as const;

/* — Andrea: Qualifikations-Chips — */
export const credentials = [
  "Gelernte MPA",
  "Kantonsspital St. Gallen",
  "Eigene Praxis seit 2003",
  "Fusspflege VitaTertia Gossau",
] as const;

/* — Ergebnis-Versprechen — */
export const outcomes = [
  {
    title: "Dauerhaft glatt",
    text: "Schluss mit Rasieren und Wachsen. Nach Abschluss der Sitzungen bleibt die Haut nachhaltig haarfrei.",
  },
  {
    title: "Mehr Freiheit im Alltag",
    text: "Kein tägliches Rasieren, kein Wachsen – einfach glatte Haut, an die Sie nicht mehr denken müssen.",
  },
  {
    title: "Schonend & diskret",
    text: "Persönliche Begleitung in ruhiger Atmosphäre, abgestimmt auf Ihren Haut- und Haartyp.",
  },
] as const;
