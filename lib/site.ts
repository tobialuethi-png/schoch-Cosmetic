/* ============================================================
   Zentrale Inhalte — Schoch Cosmetic
   Quelle: Kundentexte aus dem Vorgänger-Repo (content/site.source.ts).
   Neue Zeilen (Statement, FAQ, CTA-Block) sind aus Kundentext gebildet
   und im Blend-Plan als Vorschlag markiert. Platzhalter sind mit
   `placeholder: true` gekennzeichnet und werden im Markup mit
   data-placeholder ausgegeben.
   ============================================================ */

export const site = {
  name: "Schoch Cosmetic",
  legalName: "Schoch Cosmetic · Andrea Schoch",
  domain: "https://www.schoch-cosmetic.ch",
  founder: "Andrea Schoch",
  since: 2003,
  region: "Neukirch-Egnach, Thurgau",
  /* Titel/Description gemäss Content-Audit (findings/content.md, Abschnitt 4): Leistung + Region im Titel, 51 / 143 Zeichen */
  title: "Permanente Haarentfernung Thurgau | Schoch Cosmetic",
  description:
    "Permanente Haarentfernung mit MPL4-Licht in Neukirch-Egnach (TG): sanft, dauerhaft, für jeden Hautton. Persönlich bei Andrea Schoch, seit 2003.",
} as const;

/* Titel und Meta-Description je Route — Quelle für die Metadata (lib/metadata.ts) und die WebPage-Knoten im JSON-LD */
export const pages = {
  "/": { title: site.title, description: site.description },
  "/behandlungsplan/": {
    title: "Preise & Behandlungsplan Haarentfernung | Schoch",
    description: "Preise, Sitzungen und Dauer pro Körperzone für die MPL4-Haarentfernung bei Schoch Cosmetic in Neukirch-Egnach (TG). Unverbindlich beraten lassen.",
  },
  "/impressum/": {
    title: "Impressum & Datenschutz | Schoch Cosmetic",
    description: "Impressum von Schoch Cosmetic in Neukirch-Egnach (TG): Kontaktadresse von Andrea Schoch, Haftungsausschluss, Urheberrechte und Datenschutz (DSG).",
  },
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
  web3formsKey: "3e7b4dfa-3d95-4ac9-8840-b0e123f84df5",
} as const;

export const whatsappHref = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(contact.whatsappText)}`;

export const nav = [
  { label: "Leistungen", href: "/#leistungen" },
  { label: "Preise", href: "/#preise" },
  { label: "Technologie", href: "/#technologie" },
  { label: "Über mich", href: "/#ueber-mich" },
  { label: "Behandlungsplan", href: "/behandlungsplan/" },
  { label: "Kontakt", href: "/#kontakt" },
] as const;

export const hero = {
  eyebrow: "Permanente Haarentfernung · Fusspflege · Neukirch-Egnach",
  /* Zeilen der Headline; *Wort* = Italic-Akzent in Orange */
  lines: ["Sanftes Licht.", "*Dauerhaft*", "glatte Haut."],
  slogan: "Schmerzlos. Harmlos. Haarlos.",
  sub: "Dauerhaft glatte Haut mit sanfter MPL4-Lichttechnologie und medizinische Fusspflege, persönlich bei Andrea Schoch in Neukirch-Egnach, seit 2003.",
  primary: { label: "Termin anfragen", href: "/#kontakt" },
  secondary: { label: "So funktioniert MPL4", href: "/#technologie" },
} as const;

/* Statement mit Inline-Bild-Chips: Segmente wechseln Text / Bild */
export const statement = {
  /* Eigener Wortlaut, bewusst anders als die Hero (dort: Licht + Ergebnis; hier: Zonen + Person + Ort) */
  segments: [
    { text: "Von der Achsel" },
    { image: "foto2", alt: "MPL4-Behandlung an der Achsel", position: "50% 45%" },
    { text: "bis zum Gesicht," },
    { image: "foto5", alt: "MPL4-Behandlung im Gesicht", position: "55% 50%" },
    { text: "jede Zone persönlich behandelt," },
    { image: "foto4", alt: "MPL4-Behandlung am Oberkörper", position: "48% 84%" },
    { text: "mit langjähriger Erfahrung in Neukirch-Egnach." },
  ],
  stats: [
    { value: 2003, label: "Eigene Praxis seit", format: "year" },
    { value: "5–9", label: "Sitzungen bis zum Ziel" },
    { value: 0, label: "Schmerzen", format: "int" },
  ],
} as const;

export const treatments = [
  {
    id: "haarentfernung",
    kicker: "Leistung 1 / 2",
    title: "Permanente Haarentfernung",
    text: "Sanft und präzise entfernen die MPL4-Lichtimpulse unerwünschte Haare an nahezu jeder Körperstelle. Dauerhaft glatte Haut ohne Rasieren, ohne Schmerzen, ohne Kompromisse.",
    items: ["Oberlippe & Kinn", "Achseln", "Bikini & Intim", "Beine", "Rücken & Brust", "Arme & Nacken"],
    image: "haar",
    imageAlt: "Andrea Schoch entfernt mit dem MPL4-Handstück dauerhaft Körperhaare während einer Behandlung",
    tone: "apricot",
    cta: { label: "Termin anfragen", href: "/#kontakt" },
    secondary: { label: "Behandlungsplan", href: "/behandlungsplan/" },
  },
  {
    id: "fusspflege",
    kicker: "Leistung 2 / 2",
    title: "Fusspflege",
    text: "Professionelle und medizinisch fundierte Fusspflege für gesunde, gepflegte Füsse. Mit viel Sorgfalt und über 20 Jahren Erfahrung, für Wohlbefinden bis in die Zehenspitzen.",
    items: ["Komplette Fusspflege", "Nagel- & Hornhautpflege", "Lack & Gellack auf Wunsch", "Auch für empfindliche Füsse"],
    image: "fusspflege-andrea",
    imageAlt: "Andrea Schoch bei der medizinischen Fusspflege, mit Handschuhen und Lupenlampe an der Nagelpflege",
    tone: "sage",
    cta: { label: "Termin anfragen", href: "/#kontakt" },
    secondary: { label: "Preise Fusspflege", href: "/#preise" },
  },
] as const;

export const priceGroups = [
  {
    id: "haarentfernung",
    tab: "Haarentfernung",
    note: "Richtpreise pro Zone. Die definitive Höhe hängt von Fläche, Haartyp und Aufwand ab. Wir klären sie in einer kurzen, unverbindlichen Beratung.",
    categories: [
      { title: "Gesicht", rows: [
        { label: "Oberlippe", value: "CHF 40.–" },
        { label: "Kinn", value: "CHF 60.–" },
        { label: "Gesicht komplett", value: "ab CHF 200.–" },
      ] },
      { title: "Körper", rows: [
        { label: "Achseln", value: "CHF 80.–" },
        { label: "Unterarme", value: "CHF 120.–" },
        { label: "Oberarme / Schulter", value: "ab CHF 130.–" },
        { label: "Ganze Arme", value: "ab CHF 260.–" },
      ] },
      { title: "Bikini & Beine", rows: [
        { label: "Bikinizone (Rand)", value: "CHF 80.–" },
        { label: "Intimbereich (Rio)", value: "CHF 180.–" },
        { label: "Komplett mit Gesäss", value: "ab CHF 250.–" },
        { label: "Unterschenkel", value: "ab CHF 180.–" },
        { label: "Oberschenkel", value: "ab CHF 250.–" },
      ] },
      { title: "Kombinationen", rows: [
        { label: "US-Bikini (Rand) + Achseln", value: "ab CHF 320.–" },
        { label: "Bikinizone + Achseln", value: "CHF 140.–" },
      ] },
      { title: "Mann", rows: [
        { label: "Bauch", value: "ab CHF 150.–" },
        { label: "Rücken", value: "ab CHF 230.–" },
        { label: "Ganze Arme", value: "ab CHF 260.–" },
      ] },
    ],
  },
  {
    id: "fusspflege",
    tab: "Fusspflege",
    note: "Fixe Preise. Zusatzleistungen frei kombinierbar.",
    categories: [
      { title: "Fusspflege", rows: [{ label: "Komplettbehandlung", value: "CHF 75.–" }] },
      { title: "Zusatzleistungen", rows: [
        { label: "mit Lack", value: "+ CHF 5.–" },
        { label: "mit Gellack", value: "+ CHF 15.–" },
        { label: "mit Gellack entfernen", value: "+ CHF 20.–" },
      ] },
    ],
  },
] as const;

export const technology = {
  title: "Sanftes Licht. Tiefgehende Wirkung.",
  lead: "Im Gegensatz zum klassischen Laser bündelt MPL4 ein breites Spektrum aus Xenonlicht und Infrarot und wirkt dadurch gleichzeitig in mehreren Hauttiefen. Sanfter und wirksamer zugleich.",
  benefits: [
    { title: "Spürbar sanft", text: "Integrierte Wasserkühlung statt Hitzestich. Angenehm entspannt, ohne Hitzegefühl oder unzumutbare Schmerzen.", image: "produkt", imageAlt: "MPL4-Handstück mit integrierter Wasserkühlung am Bein einer Kundin" },
    { title: "Dauerhaft glatt", text: "Sichtbarer Erfolg in rund 5–9 Sitzungen, je nach Haut- und Haartyp. Dauerhafte, nachhaltige Ergebnisse.", image: "haar", imageAlt: "Andrea Schoch entfernt mit dem MPL4-Handstück dauerhaft Körperhaare" },
    { title: "Jeder Hautton", text: "Geeignet für nahezu jede Hauttönung, ganzjährig freie Terminwahl.", image: "foto7", imageAlt: "MPL4-Behandlung bei einem Kunden" },
    { title: "Sicher & verträglich", text: "Keine allergischen Reaktionen, Pigmentstörungen oder Narbenbildung. Kurze Behandlungen dank schnell getakteter Lichtimpulse.", image: "foto5", imageAlt: "MPL4-Behandlung im Gesicht mit Schutzbrille" },
  ],
  device: "MPL4 · Multipulselight 4G",
  cta: { label: "Beratung vereinbaren", href: "/#kontakt" },
} as const;

export const about = {
  title: "Andrea Schoch",
  role: "Inhaberin · gelernte MPA · MPL4-Spezialistin",
  text: "Als gelernte medizinische Praxisassistentin habe ich viele Jahre mit Leidenschaft im Gesundheitsbereich gearbeitet, unter anderem in verschiedenen Praxen und am Kantonsspital St. Gallen. Seit 2003 führe ich meine eigene Praxis Schoch Cosmetic in Neukirch-Egnach im Kanton Thurgau. Hier spezialisiere ich mich mit voller Hingabe auf permanente Haarentfernung und professionelle Fusspflege. Nach intensiver Recherche entdeckte ich die MPL4-Technologie von neuro-Meditec. Die sanften, aber hochwirksamen Ergebnisse haben mich sofort restlos überzeugt und tun es bis heute. Seither ist es meine grösste Freude, meinen Kundinnen und Kunden mit viel Sorgfalt, absoluter Diskretion und modernster Technik zu ebenmässiger, glatter und frischer Haut zu verhelfen. Ich freue mich darauf, auch Sie persönlich kennenzulernen.",
  quote: "Die sanften, aber hochwirksamen Ergebnisse haben mich sofort restlos überzeugt und tun es bis heute.",
  paragraphs: [
    "Als gelernte medizinische Praxisassistentin habe ich viele Jahre mit Leidenschaft im Gesundheitsbereich gearbeitet, unter anderem in verschiedenen Praxen und am Kantonsspital St. Gallen. Seit 2003 führe ich meine eigene Praxis Schoch Cosmetic in Neukirch-Egnach im Kanton Thurgau, spezialisiert auf permanente Haarentfernung und professionelle Fusspflege.",
    "Nach intensiver Recherche entdeckte ich die MPL4-Technologie von neuro-Meditec. Seither ist es meine grösste Freude, meinen Kundinnen und Kunden mit viel Sorgfalt, absoluter Diskretion und modernster Technik zu ebenmässiger, glatter und frischer Haut zu verhelfen. Ich freue mich darauf, auch Sie persönlich kennenzulernen.",
  ],
  rows: [
    { k: "Ausbildung", v: "Gelernte medizinische Praxisassistentin (MPA)" },
    { k: "Stationen", v: "Verschiedene Praxen, Kantonsspital St. Gallen" },
    { k: "Seit 2003", v: "Eigene Praxis Schoch Cosmetic, Neukirch-Egnach" },
    { k: "Fusspflege", v: "Ausbildung VitaTertia Gossau" },
  ],
  credentials: ["Gelernte MPA", "Kantonsspital St. Gallen", "Eigene Praxis seit 2003", "Fusspflege VitaTertia Gossau"],
  secondImage: "fusspflege-andrea",
  secondImageAlt: "Andrea Schoch bei der Fusspflege",
  cta: { label: "Persönliches Gespräch vereinbaren", href: "/#kontakt" },
  image: "schochxy",
  imageAlt: "Andrea Schoch, Inhaberin von Schoch Cosmetic, im Porträt",
} as const;

export const faq = {
  title: "Häufige Fragen",
  items: [
    { q: "Wie viele Sitzungen brauche ich?", a: "Sichtbarer Erfolg in rund 5–9 Sitzungen, je nach Haut- und Haartyp. Die typische Anzahl, den Abstand zwischen den Terminen und die Gesamtdauer pro Körperzone finden Sie im Behandlungsplan." },
    { q: "Ist die Behandlung schmerzhaft?", a: "Nein. Die integrierte Wasserkühlung ersetzt den Hitzestich, die Behandlung ist angenehm entspannt, ohne Hitzegefühl oder unzumutbare Schmerzen." },
    { q: "Für welche Hauttypen ist MPL4 geeignet?", a: "Für nahezu jede Hauttönung, mit ganzjährig freier Terminwahl. Keine allergischen Reaktionen, Pigmentstörungen oder Narbenbildung." },
    { q: "Warum sind mehrere Behandlungen nötig?", a: "Haare wachsen in drei Phasen: Wachstum, Übergang und Ruhe. Das MPL4-Licht wirkt nur in der aktiven Wachstumsphase. Da nicht alle Haare gleichzeitig in dieser Phase sind, sind mehrere Sitzungen im angegebenen Abstand nötig, um alle Haarfollikel dauerhaft zu deaktivieren." },
  ],
} as const;

export const ctaBlock = {
  title: "Ein kurzes Gespräch, unverbindlich.",
  text: "In einer kurzen Beratung klären wir Haut- und Haartyp, Zonen und Aufwand, persönlich und ganz individuell auf Sie abgestimmt.",
  primary: { label: "Probebehandlung anfragen", href: "/#kontakt" },
} as const;

export const footer = {
  claim: "Permanente Haarentfernung mit der einzigartigen MPL4-Lichttechnologie und professionelle Fusspflege. Persönlich, schonend und nachhaltig.",
  credit: "Design & Entwicklung: Baia Labs",
} as const;

/* — Behandlungsplan (Route) — */
export const treatmentPlanIntro = {
  eyebrow: "Behandlungsplan",
  title: "Ihr persönlicher Behandlungsplan",
  lead: "Wie viele Behandlungen brauche ich wirklich? Hier finden Sie für jede Körperzone die typische Anzahl Sitzungen, den Abstand zwischen den Terminen und die Gesamtdauer bis zur permanenten Haarentfernung.",
  chips: ["Alle Angaben sind Richtwerte, individuelle Beratung auf Anfrage", "MPL4 Xenonlicht-Technologie", "Schmerzfreie Wasserkühlung"],
  why: {
    title: "Warum mehrere Behandlungen?",
    text: "Haare wachsen in drei Phasen: Wachstum, Übergang und Ruhe. Das MPL4-Licht wirkt nur in der aktiven Wachstumsphase. Da nicht alle Haare gleichzeitig in dieser Phase sind, sind mehrere Sitzungen im angegebenen Abstand nötig, um alle Haarfollikel dauerhaft zu deaktivieren.",
  },
  /* Drei Phasen als typografische Reihe — Kurzzeilen aus dem Kundentext abgeleitet (why.text) */
  phases: [
    { n: "01", name: "Wachstum", text: "Die aktive Phase. Nur hier wirkt das MPL4-Licht auf den Haarfollikel." },
    { n: "02", name: "Übergang", text: "Das Haar löst sich von der Wurzel, das Licht erreicht den Follikel nicht mehr." },
    { n: "03", name: "Ruhe", text: "Der Follikel pausiert. Erst mit dem nächsten Wachstum greift die nächste Sitzung." },
  ],
  /* Spannen über alle Zonen (aus treatmentPlan abgeleitet) */
  facts: [
    { value: "4–9", label: "Sitzungen" },
    { value: "2–12", label: "Wochen Abstand" },
    { value: "5–60", label: "Min. je Sitzung" },
  ],
  listTitle: "Jede Zone hat ihren Rhythmus.",
  listLead: "Alle Preise gelten pro Behandlung und sind Richtwerte. Wie viele Sitzungen es wirklich braucht, hängt von Haartyp und Fläche ab. Das klären wir in der persönlichen Beratung.",
} as const;

export type PlanEntry = {
  name: string; price: string; duration: string; interval: string; sessions: string; sessionsMax: number; total: string;
};
export const treatmentPlan: { zone: string; entries: PlanEntry[] }[] = [
  { zone: "Gesicht", entries: [
    { name: "Oberlippe", price: "CHF 40.–", duration: "ca. 5 Minuten", interval: "alle 2–4 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 3–7 Monate" },
    { name: "Kinn", price: "CHF 60.–", duration: "ca. 10 Minuten", interval: "alle 2–4 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 3–7 Monate" },
    { name: "Gesicht komplett", price: "ab CHF 200.–", duration: "ca. 20 Minuten", interval: "alle 3 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 3–6 Monate" },
  ] },
  { zone: "Körper", entries: [
    { name: "Achseln", price: "CHF 80.–", duration: "ca. 15 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 6–14 Monate" },
    { name: "Unterarme", price: "CHF 120.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 4–14 Monate" },
    { name: "Ganze Arme", price: "ab CHF 260.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 4–14 Monate" },
    { name: "Oberarme / Schulter", price: "ab CHF 130.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 4–14 Monate" },
  ] },
  { zone: "Bikini & Beine", entries: [
    { name: "Bikinizone (Rand)", price: "CHF 80.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–18 Monate" },
    { name: "Intimbereich (Rio)", price: "CHF 180.–", duration: "ca. 30 Minuten", interval: "alle 4–8 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–18 Monate" },
    { name: "Komplett mit Gesäss", price: "ab CHF 250.–", duration: "ca. 30 Minuten", interval: "alle 4–8 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–18 Monate" },
    { name: "Unterschenkel", price: "ab CHF 180.–", duration: "ca. 40 Minuten", interval: "alle 4–12 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–27 Monate" },
    { name: "Oberschenkel", price: "ab CHF 250.–", duration: "ca. 40 Minuten", interval: "alle 4–12 Wochen", sessions: "5–9 Behandlungen", sessionsMax: 9, total: "ca. 5–27 Monate" },
  ] },
  { zone: "Mann", entries: [
    { name: "Bauch", price: "ab CHF 150.–", duration: "ca. 30–40 Minuten", interval: "alle 4–8 Wochen", sessions: "6–9 Behandlungen", sessionsMax: 9, total: "ca. 6–18 Monate" },
    { name: "Rücken", price: "ab CHF 230.–", duration: "ca. 45–60 Minuten", interval: "alle 4–8 Wochen", sessions: "6–9 Behandlungen", sessionsMax: 9, total: "ca. 6–18 Monate" },
    { name: "Ganze Arme", price: "ab CHF 260.–", duration: "ca. 20 Minuten", interval: "alle 4–8 Wochen", sessions: "4–7 Behandlungen", sessionsMax: 7, total: "ca. 4–14 Monate" },
  ] },
];

/* — Impressum (Route /impressum) —
   Angaben nach Art. 3 Abs. 1 lit. s UWG und Informationspflicht revDSG. Sätze in Schweizer Schreibweise (ss).
   Keine UID/MwSt-Angabe: die Inhaberin ist nicht MwSt-pflichtig und hat keine UID (Kundenentscheid 2026-09-11). */
export const impressum = {
  title: "Impressum",
  lead: "Verantwortlich für den Inhalt dieser Website und Ansprechpartnerin für alle Anliegen rund um Schoch Cosmetic.",
  updated: "September 2026",
  sections: [
    {
      id: "kontakt",
      title: "Kontaktadresse",
      rows: [
        { label: "Firma", value: "Schoch Cosmetic" },
        { label: "Inhaberin", value: "Andrea Schoch" },
        { label: "Adresse", value: "Oberzelgstrasse 7B, 9315 Neukirch-Egnach, Schweiz" },
        { label: "Telefon", value: "079 381 52 51", href: "tel:+41793815251" },
        { label: "E-Mail", value: "andrea@schoch-cosmetic.ch", href: "mailto:andrea@schoch-cosmetic.ch" },
      ],
    },
    {
      id: "haftung",
      title: "Haftungsausschluss",
      paragraphs: [
        "Die Autorin übernimmt keine Gewähr für die Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen auf dieser Website.",
        "Haftungsansprüche gegen die Autorin wegen Schäden materieller oder immaterieller Art, die aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen.",
        "Alle Angebote sind unverbindlich. Die Autorin behält sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.",
        "Preise sind Richtpreise in Schweizer Franken. Massgebend ist die individuelle Beratung vor der Behandlung.",
      ],
    },
    {
      id: "links",
      title: "Haftung für Links",
      paragraphs: [
        "Verweise und Links auf Websites Dritter liegen ausserhalb des Verantwortungsbereichs der Autorin. Es wird jegliche Verantwortung für solche Websites abgelehnt. Der Zugriff und die Nutzung solcher Websites erfolgen auf eigene Gefahr der Nutzerin oder des Nutzers.",
      ],
    },
    {
      id: "urheberrecht",
      title: "Urheberrechte",
      paragraphs: [
        "Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf dieser Website gehören ausschliesslich Andrea Schoch, Schoch Cosmetic, oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträgerin im Voraus einzuholen.",
        "MPL4 und Multipulselight sind Bezeichnungen der jeweiligen Hersteller.",
      ],
    },
    {
      id: "datenschutz",
      title: "Datenschutz",
      paragraphs: [
        "Gestützt auf das Schweizer Datenschutzgesetz (DSG) hat jede Person Anspruch auf Schutz ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer persönlichen Daten. Wir halten diese Bestimmungen ein und behandeln Ihre Daten vertraulich.",
        "Kontaktformular: Die im Formular eingegebenen Angaben (Name, E-Mail, Telefon, Nachricht) werden über den Dienst Web3Forms per E-Mail an uns übermittelt und ausschliesslich zur Bearbeitung Ihrer Anfrage verwendet. Sie werden nicht an Dritte weitergegeben.",
        "WhatsApp: Wenn Sie uns über den WhatsApp-Link kontaktieren, gelten die Datenschutzbestimmungen von WhatsApp (Meta Platforms).",
        "Hosting: Diese Website wird bei Cloudflare gehostet. Beim Aufruf werden technisch notwendige Daten wie IP-Adresse, Zeitpunkt und aufgerufene Seite in Server-Logs verarbeitet, um den sicheren Betrieb zu gewährleisten. Es werden keine Cookies zu Analyse- oder Werbezwecken gesetzt und keine Tracking-Dienste eingesetzt. Schriften werden lokal ausgeliefert.",
        "Ihre Rechte: Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder Löschung Ihrer Daten. Wenden Sie sich dazu an die oben genannte Kontaktadresse.",
      ],
    },
    {
      id: "realisation",
      title: "Realisation",
      paragraphs: ["Design und Entwicklung: Baia Labs."],
    },
  ],
} as const;

export type ImpressumRow = { label: string; value: string; href?: string; placeholder?: boolean };
