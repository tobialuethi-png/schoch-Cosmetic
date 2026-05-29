import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PlanEffects from "@/components/PlanEffects";
import {
  treatmentPlanIntro as intro,
  treatmentPlan,
  contact,
} from "@/lib/site";

// Zeilen-Icons (stroke, currentColor) – lucide-angelehnt.
const rowIcons: Record<string, string> = {
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',
  calendar:
    '<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M16 3v3M8 3v3M3.5 9.5h17"/>',
  check: '<path d="M20 6.5 9.4 17.1 4 11.7"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8 6.8 19.5l1-5.8L3.6 9.6l5.8-.8z"/>',
};

// Zonen-Icons.
const zoneIcons: Record<string, string> = {
  Gesicht:
    '<circle cx="12" cy="12" r="9"/><path d="M8.5 10h.01M15.5 10h.01M8.8 14.5c.9.9 2 1.4 3.2 1.4s2.3-.5 3.2-1.4"/>',
  Körper:
    '<circle cx="12" cy="4.6" r="2.1"/><path d="M5 9.2c2 1 4.4 1.5 7 1.5s5-.5 7-1.5"/><path d="M12 10.8V15M9.2 21l2.8-6 2.8 6"/>',
  "Bikini & Beine":
    '<path d="M8 3.5h8M9 3.5l-.4 8.5L7 20.5M15 3.5l.4 8.5L17 20.5"/>',
  Mann: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
};

type PlanEntry = (typeof treatmentPlan)[number]["entries"][number];

const planRows = (e: PlanEntry) => [
  { icon: "clock", label: "Dauer pro Sitzung", value: e.duration, dots: undefined as number | undefined },
  { icon: "calendar", label: "Abstand zwischen Sitzungen", value: e.interval, dots: undefined as number | undefined },
  {
    icon: "check",
    label: "Behandlungen bis permanente Entfernung",
    value: e.sessions,
    dots: e.sessionsMax as number | undefined,
  },
  { icon: "star", label: "Gesamtdauer", value: e.total, dots: undefined as number | undefined },
];

const DOTS = 9;

export const metadata: Metadata = {
  title: "Behandlungsplan – Sitzungen & Dauer | Schoch Cosmetic",
  description:
    "Persönlicher Behandlungsplan für die permanente MPL4-Haarentfernung: typische Anzahl Sitzungen, Abstände und Gesamtdauer pro Körperzone – mit Richtpreisen.",
  openGraph: {
    title: "Behandlungsplan – Sitzungen & Dauer | Schoch Cosmetic",
    description:
      "Persönlicher Behandlungsplan für die permanente MPL4-Haarentfernung: typische Anzahl Sitzungen, Abstände und Gesamtdauer pro Körperzone – mit Richtpreisen.",
  },
  twitter: {
    title: "Behandlungsplan – Sitzungen & Dauer | Schoch Cosmetic",
    description:
      "Persönlicher Behandlungsplan für die permanente MPL4-Haarentfernung: typische Anzahl Sitzungen, Abstände und Gesamtdauer pro Körperzone – mit Richtpreisen.",
  },
};

export default function Behandlungsplan() {
  return (
    <>
      <Nav />

      <main id="main">
        {/* 1 · Kopf */}
        <section className="relative scroll-mt-24 pt-32 pb-12 md:pt-40 md:pb-16">
          <div className="shell">
            <a
              href="/"
              className="link-underline mb-8 inline-flex items-center gap-2 text-sm text-sand transition-colors hover:text-cream"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
              Zurück zur Startseite
            </a>

            <div className="max-w-3xl">
              <div className="mb-6 flex items-center gap-3" data-reveal="up">
                <span className="h-px w-8 bg-gold" />
                <span className="eyebrow">{intro.eyebrow}</span>
              </div>
              <h1
                className="font-display leading-[1.04]"
                style={{ fontSize: "clamp(2.6rem, 1.6rem + 3.4vw, 4.5rem)" }}
                data-reveal="up"
              >
                Ihr persönlicher
                <br />
                <span className="text-gold-strong">Behandlungsplan</span>
              </h1>
              <p className="mt-6 max-w-2xl text-sand" style={{ fontSize: "var(--text-lead)" }} data-reveal="up">
                {intro.lead}
              </p>

              <ul className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2.5 text-sm text-mist" data-reveal="up">
                {intro.chips.map((chip) => (
                  <li className="flex items-center gap-2.5" key={chip}>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="shell">
          <div className="rule-gold" />
        </div>

        {/* 2 · Filter + Pläne */}
        <section className="relative scroll-mt-24 py-12 md:py-16">
          <div className="shell">
            <div className="mb-9 flex flex-wrap gap-2.5" data-planfilter data-reveal="up">
              <button type="button" className="planpill is-active" data-filter="all" aria-pressed="true">
                Alle Zonen
              </button>
              {treatmentPlan.map((z) => (
                <button type="button" className="planpill" data-filter={z.zone} aria-pressed="false" key={z.zone}>
                  {z.zone}
                </button>
              ))}
            </div>

            <div
              className="mb-14 flex gap-4 rounded-[20px] border p-6 md:gap-5 md:p-7"
              style={{
                background: "color-mix(in srgb, var(--color-gold) 8%, var(--color-espresso))",
                borderColor: "color-mix(in srgb, var(--color-gold) 30%, var(--color-line))",
                boxShadow: "0 20px 44px -38px rgba(196,110,42,0.5)",
              }}
              data-reveal="up"
            >
              <span className="plan-ico plan-ico--lg shrink-0" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: rowIcons.clock }} />
              </span>
              <div>
                <h2 className="font-display text-xl text-cream md:text-2xl">{intro.why.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-sand">{intro.why.text}</p>
              </div>
            </div>

            <div className="space-y-14 md:space-y-20">
              {treatmentPlan.map((z) => (
                <section data-zone={z.zone} aria-label={`Zone ${z.zone}`} key={z.zone}>
                  <div className="mb-7 flex items-center gap-4">
                    <span className="plan-ico plan-ico--lg shrink-0" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: zoneIcons[z.zone] }} />
                    </span>
                    <h2 className="font-display text-2xl text-cream md:text-[1.9rem]">{z.zone}</h2>
                    <span className="ml-auto whitespace-nowrap text-sm text-mist">
                      {z.entries.length} {(z.entries.length as number) === 1 ? "Zone" : "Zonen"}
                    </span>
                  </div>
                  <div className="h-px w-full bg-line" />

                  <div className="mt-7 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    {z.entries.map((e) => (
                      <article className="plan-card card-luxe overflow-hidden" key={e.name}>
                        <div
                          className="flex items-center justify-between gap-3 border-b border-line px-6 py-5"
                          style={{ background: "color-mix(in srgb, var(--color-night) 60%, transparent)" }}
                        >
                          <h3 className="font-display text-xl leading-tight text-cream">{e.name}</h3>
                          <span className="shrink-0 whitespace-nowrap font-display text-[1.2rem] text-gold-bright lining-nums tabular-nums">
                            {e.price}
                          </span>
                        </div>

                        <dl className="divide-y divide-line px-6">
                          {planRows(e).map((row) => (
                            <div className="flex gap-3.5 py-4" key={row.label}>
                              <span className="plan-ico shrink-0" aria-hidden="true">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: rowIcons[row.icon] }} />
                              </span>
                              <div className="min-w-0">
                                <dt className="text-[0.7rem] uppercase tracking-[0.08em] text-mist">
                                  {row.label}
                                </dt>
                                <dd className="mt-0.5 font-medium text-cream">{row.value}</dd>
                                {row.dots && (
                                  <div className="mt-2.5 flex flex-wrap gap-1.5" aria-hidden="true">
                                    {Array.from({ length: DOTS }).map((_, i) => (
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${i < row.dots! ? "bg-gold" : "bg-cocoa"}`}
                                        key={i}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </dl>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <p className="mt-12 text-xs text-mist">
              Alle Angaben sind Richtwerte und hängen von Haut- und Haartyp ab. Die
              definitive Planung erfolgt in einer persönlichen, unverbindlichen
              Beratung.
            </p>

            <div className="card-luxe mt-10 flex flex-col gap-7 p-8 md:flex-row md:items-center md:justify-between md:p-10" data-reveal="up">
              <div className="max-w-xl">
                <p className="eyebrow mb-3">Ihr erster Schritt</p>
                <h2 style={{ fontSize: "var(--text-h3)" }}>
                  Kostenlose Erstberatung &amp; Probebehandlung
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-sand">
                  Wir stimmen Ihren persönlichen Behandlungsplan gemeinsam ab –
                  abgestimmt auf Ihren Haut- und Haartyp. Und Sie spüren selbst, wie
                  angenehm die MPL4-Behandlung ist.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <a href={contact.phoneHref} className="btn btn-ghost">
                  {contact.phoneDisplay}
                </a>
                <a href="/#kontakt" className="btn btn-ghost">
                  Zum Kontakt
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <PlanEffects />
    </>
  );
}
