import { site } from "@/lib/site";

/*
  VERTRAUENS-LEISTE · direkt unter dem Hero. Nutzt dieselben
  [data-stats]/[data-stat]-Hooks wie die Kennzahlen-Logik in site-init →
  das Hochzählen greift ohne zusätzliches JS. Die Jahreszahl `site.since`
  zählt automatisch vom aktuellen Jahr herunter (= „seit …").
*/
const facts = [
  { value: String(site.since), label: "Eigene Praxis seit" },
  { value: "5–9", label: "Sitzungen" },
  { value: "0", label: "Schmerzen" },
];

export default function HeroStats() {
  return (
    <section
      className="relative scroll-mt-24 pb-10 pt-2 md:pb-16 md:pt-4"
      aria-label="Schoch Cosmetic auf einen Blick"
    >
      <div className="shell">
        <dl className="hstats mx-auto grid max-w-2xl grid-cols-3" data-stats>
          {facts.map((s, i) => (
            <div
              key={s.label}
              className={`hstats__item px-2 text-center sm:px-6${
                i > 0 ? " border-l border-line" : ""
              }`}
              data-stat
              data-reveal="up"
            >
              <dt className="hstats__num font-display text-cream">{s.value}</dt>
              <dd className="hstats__label mt-2 text-mist">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
