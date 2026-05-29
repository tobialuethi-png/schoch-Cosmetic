import Image from "next/image";
import produkt from "@/assets/photos/produkt.jpg";

// Kompakte, scanbare Vorteile (kein langer Fliesstext mehr).
const benefits = [
  {
    title: "Spürbar sanft",
    text: "Integrierte Wasserkühlung statt Hitzestich.",
    icon: "drop",
  },
  {
    title: "Dauerhaft glatt",
    text: "Sichtbar frei nach rund 5–9 Sitzungen.",
    icon: "spark",
  },
  {
    title: "Jeder Hautton",
    text: "Ganzjährig geeignet, freie Terminwahl.",
    icon: "sun",
  },
  {
    title: "Sicher & verträglich",
    text: "Keine allergischen Reaktionen oder Narben.",
    icon: "shield",
  },
] as const;

const spectrum = [
  { w: "94%", label: "Xenonlicht" },
  { w: "76%", label: "Sichtbares Licht" },
  { w: "60%", label: "Infrarot" },
];

export default function Technology() {
  return (
    <section
      id="technologie"
      className="relative overflow-hidden scroll-mt-24 py-16 md:py-36"
    >
      <div className="aura -left-40 top-32 h-[28rem] w-[28rem] bg-gold/10" aria-hidden="true" />

      <div className="shell relative">
        <header className="mb-12 max-w-3xl md:mb-16">
          <h2 style={{ fontSize: "var(--text-h2)" }} data-reveal="up">
            Sanftes Licht. Tiefgehende Wirkung.
          </h2>
        </header>

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <figure className="relative lg:col-span-6" data-reveal="left">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-line sm:aspect-[5/5] lg:aspect-[4/5]"
              style={{ boxShadow: "0 50px 90px -55px rgba(60,42,28,0.5)" }}
            >
              <Image
                src={produkt}
                alt="Andrea Schoch führt das MPL4-Multipulselight-Handstück am Bein einer Kundin – daneben das Behandlungsgerät mit Display"
                sizes="(min-width:1024px) 46vw, 92vw"
                className="h-full w-full object-cover object-center"
                data-parallax
              />
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                style={{ background: "linear-gradient(to top, rgba(30,20,42,0.42), transparent)" }}
                aria-hidden="true"
              />
            </div>

            <figcaption
              className="card-luxe float-slow absolute -bottom-5 left-4 flex items-center gap-3 px-5 py-3.5 sm:left-6"
              data-reveal="up"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/12 text-gold"
                aria-hidden="true"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h3l2-7 4 14 2-7h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="leading-tight">
                <span className="block font-display text-sm font-semibold text-cream">
                  MPL4 · Multipulselight 4G
                </span>
                <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-mist">
                  Swiss Engineering
                </span>
              </span>
            </figcaption>
          </figure>

          <div className="lg:col-span-6">
            <p className="max-w-lg text-cream" style={{ fontSize: "var(--text-lead)" }} data-reveal="up">
              Im Gegensatz zum klassischen Laser bündelt MPL4 ein breites Spektrum
              aus Xenonlicht und Infrarot und wirkt dadurch gleichzeitig in mehreren
              Hauttiefen. Sanfter und wirksamer zugleich.
            </p>

            <div className="card-luxe mt-9 p-6 md:p-7" data-reveal="up">
              <div className="mb-5 flex items-baseline justify-between">
                <p className="eyebrow">Das Lichtspektrum</p>
                <span className="font-display text-sm text-gold-strong">MPL4 G</span>
              </div>
              <div className="space-y-4" data-spectrum>
                {spectrum.map((bar) => (
                  <div key={bar.label}>
                    <div className="mb-1.5 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.16em] text-mist">
                      <span>{bar.label}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-cocoa">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: bar.w,
                          background:
                            "linear-gradient(90deg,var(--color-gold-deep),var(--color-gold-bright))",
                        }}
                        data-bar
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a href="#kontakt" className="btn btn-ghost mt-8" data-reveal="up">
              Beratung vereinbaren
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        <ul className="mt-20 grid overflow-hidden rounded-[18px] border border-line bg-espresso sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <li className="group p-6 md:p-7" data-reveal="up" key={b.title}>
              <span
                className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-cream"
                aria-hidden="true"
              >
                {b.icon === "drop" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                )}
                {b.icon === "spark" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M17.5 6.5L15 9M9 15l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                )}
                {b.icon === "sun" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                )}
                {b.icon === "shield" && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </span>
              <h3 className="text-lg font-semibold text-cream">{b.title}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-sand">{b.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
