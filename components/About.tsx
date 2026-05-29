import Image from "next/image";
import { credentials, contact, site } from "@/lib/site";
import portraitPhoto from "@/assets/photos/schochxy.png";

export default function About() {
  const years = new Date().getFullYear() - site.since;

  return (
    <section id="ueber-mich" className="relative scroll-mt-24 py-16 md:py-32">
      <div className="shell">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5" data-reveal="left">
            <figure className="relative">
              <button
                type="button"
                className="group block w-full overflow-hidden rounded-[18px] border border-line"
                data-zoom
                aria-label="Einblick in die Praxis vergrössern"
              >
                <Image
                  src={portraitPhoto}
                  alt="Andrea Schoch, Inhaberin von Schoch Cosmetic, im Porträt"
                  sizes="(min-width:1024px) 40vw, 92vw"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </button>
              <figcaption className="absolute -bottom-4 -right-3 rounded-2xl bg-cream px-5 py-4 sm:-right-6">
                <p className="font-display text-3xl leading-none text-ink">{years}</p>
                <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-ink/70">
                  Jahre Erfahrung
                </p>
              </figcaption>
            </figure>
          </div>

          <div className="lg:col-span-7">
            <h2 style={{ fontSize: "var(--text-h2)" }} data-reveal="up">
              Andrea Schoch
            </h2>
            <p className="mt-3 text-sm uppercase tracking-[0.2em] text-gold-strong" data-reveal="up">
              Inhaberin &middot; gelernte MPA &middot; MPL4-Spezialistin
            </p>

            <div
              className="mt-7 text-sand leading-relaxed"
              style={{ fontSize: "clamp(1.1rem, 1rem + 0.55vw, 1.4rem)" }}
              data-text-reveal
            >
              <p data-reveal="up">
                Als gelernte medizinische Praxisassistentin habe ich viele Jahre mit
                Leidenschaft im Gesundheitsbereich gearbeitet, unter anderem in
                verschiedenen Praxen und am Kantonsspital St. Gallen. Seit 2003
                führe ich meine eigene Praxis Schoch Cosmetic in Neukirch-Egnach im
                Kanton Thurgau. Hier spezialisiere ich mich mit voller Hingabe auf
                permanente Haarentfernung und professionelle Fusspflege. Nach
                intensiver Recherche entdeckte ich die MPL4-Technologie von
                neuro-Meditec. Die sanften, aber hochwirksamen Ergebnisse haben mich
                sofort restlos überzeugt und tun es bis heute. Seither ist es meine
                grösste Freude, meinen Kundinnen und Kunden mit viel Sorgfalt,
                absoluter Diskretion und modernster Technik zu ebenmässiger,
                glatter und frischer Haut zu verhelfen. Ich freue mich darauf, auch
                Sie persönlich kennenzulernen.
              </p>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2 sm:gap-2.5" data-reveal="up">
              {credentials.map((c) => (
                <li
                  key={c}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-cream/[0.04] px-3.5 py-2 text-xs text-cream backdrop-blur-sm transition-colors duration-300 hover:border-gold/40 hover:bg-gold/10 sm:px-4 sm:py-2.5"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {c}
                </li>
              ))}
            </ul>

            <a href={contact.phoneHref} className="btn btn-ghost mt-10" data-reveal="up">
              Persönliches Gespräch vereinbaren
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
