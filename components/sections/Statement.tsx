import { statement } from "@/lib/site";
import Picture from "@/components/ui/Picture";
import type { ImageName } from "@/lib/images.generated";

/**
 * Section 2 — Statement mit Inline-Bild-Chips (wonder #2) + Proof-Reihe (chic #2).
 * Ein Bildschirm, ein Satz in Section-Grösse, drei riesige Kennzahlen.
 * Erste Karte des Sticky-Stacks: bleibt stehen, die Leistungs-Karten schieben sich darüber (chic #3).
 * Motion: eine Szene (data-scene) — Satz als maskierte Zeilen (Chips laufen in der Zeile mit), danach die
 * drei Kennzahlen gestaffelt inkl. Counter, in einer Timeline.
 */
export default function Statement() {
  return (
    <section id="statement" className="stack-card section z-0 bg-linen" aria-labelledby="statement-title" data-reveal-scope data-scene>
      {/* Mobil: Blattform-Bloom über den Hero (CSS Scroll-Timeline, globals.css) — am Desktop unsichtbar (display: none) */}
      <div className="deck-wash" aria-hidden="true" />
      <div className="shell">
        <p id="statement-title" className="t-h2 mx-auto max-w-[1240px] text-center" data-reveal-text>
          {statement.segments.map((seg, i) =>
            "image" in seg ? (
              <span key={i} className="mx-[0.14em] inline-block h-[0.78em] w-[1.4em] translate-y-[0.1em] overflow-hidden rounded-full align-baseline">
                <Picture name={seg.image as ImageName} alt={seg.alt} sizes="160px" imgClassName="h-full w-full object-cover" position={seg.position} />
              </span>
            ) : (
              <span key={i}> {seg.text} </span>
            ),
          )}
        </p>

        {/* Mobil: eine Kennzahl pro Zeile (Zahl links, Label rechts, Haarlinien) — drei Spalten wären auf 360 px gequetscht; ab sm drei Spalten */}
        <dl className="mx-auto mt-12 grid max-w-[1100px] border-t hairline sm:mt-16 sm:grid-cols-3 sm:border-t-0 md:mt-24" data-reveal-group data-at="0.55">
          {statement.stats.map((s, i) => (
            <div key={s.label} className={`flex items-baseline justify-between gap-5 border-b hairline py-4 sm:block sm:border-b-0 sm:px-3 sm:py-0 sm:text-center md:px-8 ${i > 0 ? "sm:border-l" : ""}`}>
              <dt className="t-title tnum">
                {typeof s.value === "number" ? (
                  <span data-count={s.value} data-count-from={s.value > 100 ? s.value - 40 : 0}>{s.value}</span>
                ) : (
                  s.value
                )}
              </dt>
              <dd className="t-eyebrow max-w-[46%] text-right text-umber sm:mt-4 sm:max-w-none sm:text-center">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
