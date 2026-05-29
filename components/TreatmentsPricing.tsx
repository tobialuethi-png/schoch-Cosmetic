import Image, { type StaticImageData } from "next/image";
import { treatments, priceGroups } from "@/lib/site";
import haar from "@/assets/photos/haar.jpg";
import fuss from "@/assets/photos/fusspflege-andrea.jpg";

interface Props {
  mode: "haarentfernung" | "fusspflege";
}

/*
  BEHANDLUNG & PREISE · pro Modus (Haarentfernung / Fusspflege)
  Aufbau: Eyebrow + Titel → Bild & Beschreibung → Preisliste (gefiltert auf den
  Modus). Im Haarentfernungs-Modus folgt zusätzlich der Behandlungsplan-CTA.
*/
export default function TreatmentsPricing({ mode }: Props) {
  const isHaar = mode === "haarentfernung";

  const treatment = treatments.find((t) => t.id === mode)!;
  const imgData: { src: StaticImageData; alt: string; pos: string } = isHaar
    ? {
        src: haar,
        alt: "Andrea Schoch entfernt mit dem MPL4-Handstück dauerhaft Körperhaare während einer Behandlung",
        pos: "50% 100%",
      }
    : {
        src: fuss,
        alt: "Andrea Schoch bei der medizinischen Fusspflege – mit Handschuhen und Lupenlampe an der Nagelpflege",
        pos: "50% 46%",
      };

  const priceGroup = priceGroups.find(
    (g) => g.tab === (isHaar ? "Haarentfernung" : "Fusspflege")
  )!;
  const sectionId = isHaar ? "behandlungen" : "fusspflege";
  const priceListId = isHaar ? "preise" : "preise-fusspflege";
  const title = isHaar ? "Permanente Haarentfernung" : "Fusspflege";
  const lead = isHaar
    ? "Die Preise sind Richtwerte je Zone. Die genaue Höhe klären wir gerne gemeinsam in einer kurzen, unverbindlichen Beratung, die ganz individuell auf Sie abgestimmt ist."
    : priceGroup.note;

  return (
    <section id={sectionId} className="relative scroll-mt-24 py-16 md:py-28">
      <div className="shell">
        <header className="mb-12 max-w-3xl md:mb-16">
          <h2 style={{ fontSize: "var(--text-h2)" }} data-reveal="up">
            {title}
          </h2>
        </header>

        <div className="tcol grid items-center gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
          <figure className="tcol__media md:col-span-5" data-reveal={isHaar ? "left" : "right"}>
            <Image
              src={imgData.src}
              alt={imgData.alt}
              sizes="(min-width:768px) 38vw, 92vw"
              className="tcol__img"
              style={{ objectPosition: imgData.pos }}
            />
          </figure>
          <div className="md:col-span-7" data-reveal={isHaar ? "right" : "left"}>
            <p className="text-sand" style={{ fontSize: "var(--text-lead)" }}>
              {treatment.text}
            </p>
            <ul className="mt-7 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {treatment.items.map((item) => (
                <li className="flex items-center gap-3 text-sm text-sand" key={item}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isHaar && (
          <aside className="sspecial mt-14 md:mt-20" data-reveal="up">
            <div className="sspecial__inner">
              <span className="sspecial__badge">Sommer-Special · −20 %</span>
              <h3 className="sspecial__title">Kombi US-Bikini &amp; Achseln</h3>
              <p className="sspecial__desc">
                Glatt und sorgenfrei in den Sommer: das ideale Kombi-Paket zum
                Spezialpreis. So starten Sie bedenkenlos in die warme Jahreszeit.
              </p>
              <div className="sspecial__price">
                <span className="sspecial__num">275</span>
                <span className="sspecial__currency">
                  <span className="sspecial__chf">CHF</span>
                  <s className="sspecial__strike">statt 344</s>
                </span>
              </div>
              <a href="#kontakt" className="sspecial__cta">
                Angebot sichern
              </a>
              <p className="sspecial__validity">Gültig bis Ende Juni 2026</p>
            </div>
          </aside>
        )}

        <div id={priceListId} className="pcar mt-16 scroll-mt-24 md:mt-24" data-pcar>
          <header className="pcar__head">
            <div className="max-w-xl" data-reveal="up">
              <p className="eyebrow">Preisliste</p>
              <p className="pcar__lead">{lead}</p>
            </div>
            <div className="pcar__nav">
              <button type="button" className="pcar__btn" data-pcar-prev aria-label="Vorherige Preiskarten">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button type="button" className="pcar__btn" data-pcar-next aria-label="Nächste Preiskarten">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </header>

          <div
            className="pcar__track"
            data-pcar-track
            data-stagger
            role="region"
            aria-label="Preiskategorien – seitlich verschiebbar"
            tabIndex={0}
          >
            {priceGroup.categories.map((cat) => (
              <article className="pcar__card card-luxe" data-pcar-card data-stagger-item data-reveal="up" key={cat.title}>
                <h3 className="pcar__title">{cat.title}</h3>
                <span className="pcar__rule" aria-hidden="true" />
                <dl className="pcar__list">
                  {cat.rows.map((row) => (
                    <div className="pcar__row" key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <div className="pcar__foot">
            <div className="pcar__progress" aria-hidden="true">
              <span data-pcar-bar />
            </div>
            <p className="pcar__hint" aria-hidden="true">
              ↔&nbsp;&nbsp;Karten greifen &amp; verschieben
            </p>
          </div>
        </div>

        {isHaar && (
          <a
            href="/behandlungsplan"
            className="bplan group mt-12 flex flex-col items-start gap-6 rounded-[24px] border p-8 sm:flex-row sm:items-center md:p-10"
            data-reveal="up"
          >
            <span className="bplan__ico shrink-0" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
                <path d="M16 3v3M8 3v3M3.5 9.5h17M8 13.5h3M8 16.5h6" />
              </svg>
            </span>
            <div className="flex-1">
              <p className="eyebrow mb-2">Behandlungsplan</p>
              <h3 style={{ fontSize: "var(--text-h3)" }}>
                Wie viele Behandlungen brauche ich?
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-sand">
                Sehen Sie für jede Körperzone die typische Anzahl Sitzungen, die
                Abstände zwischen den Terminen und die Gesamtdauer bis zur
                permanenten Haarentfernung.
              </p>
            </div>
            <span className="btn btn-ghost pointer-events-none shrink-0 self-start sm:self-center">
              Behandlungsplan ansehen
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bplan__arrow" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
        )}

        <p className="mt-8 text-xs text-mist" data-reveal="fade">
          Alle Preise in CHF, inkl. MwSt. Änderungen vorbehalten.
        </p>
      </div>
    </section>
  );
}
