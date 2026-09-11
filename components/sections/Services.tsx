import { treatments } from "@/lib/site";
import Picture from "@/components/ui/Picture";
import type { ImageName } from "@/lib/images.generated";
import LuxButton from "@/components/ui/LuxButton";

const tones: Record<string, string> = { apricot: "bg-apricot", sage: "bg-sage" };

/**
 * Signature 2 — Sticky-Stack (chic #3): jedes Panel ist ein voller Bildschirm mit eigener Farbfläche,
 * bleibt stehen und wird von der nächsten Karte überdeckt.
 * Bild als grosse gerahmte Fläche mit runden Ecken (Mask Wipe + Parallax), so hoch wie der Bildschirm zulässt;
 * zweites Panel gespiegelt (Bild links). Zonen als ruhige typografische Reihe in Serif (lagence-Prinzip),
 * Premium-CTA aus dem Hero. Unter 1024 px: Bild oben, Text darunter.
 * Motion: eine Szene pro Karte (data-scene, MotionScope) — Bild-Wipe von unten (0 s) → Headline-Zeilen → Lead
 * → Zonen gestaffelt → CTA, alles in EINER Timeline mit überlappenden Positionen statt Einzel-Triggern.
 */
export default function Services() {
  return (
    <>
      {treatments.map((t, i) => {
        const flip = i % 2 === 1;
        const cta = t.cta;
        return (
          <article
            key={t.id}
            id={i === 0 ? "leistungen" : t.id}
            className={`stack-card section relative lg:!pb-10 lg:!pt-[calc(var(--nav-h)+24px)] ${tones[t.tone]}`}
            style={{ zIndex: i + 1 }}
            data-reveal-scope
            data-scene
            aria-labelledby={`${t.id}-title`}
          >
            {i === 0 ? <span id={t.id} className="absolute top-0" aria-hidden="true" /> : null}
            {/* Mobil: Blattform-Bloom über die vorherige Karte (CSS Scroll-Timeline, globals.css) — am Desktop unsichtbar */}
            <div className="deck-wash" aria-hidden="true" />
            <div className="shell w-full">
              <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
                {/* Text-Hälfte — Container für die Headline-Grösse (svc-title: max. 19cqi) */}
                <div className={`order-2 lg:col-span-5 [container-type:inline-size] ${flip ? "lg:order-2 xl:pl-4" : "lg:order-1"}`}>
                  <h2 id={`${t.id}-title`} className="t-h2 svc-title" data-reveal-text data-at="0.15">{t.title}</h2>
                  <p className="t-lead mt-7 max-w-[520px] text-umber" data-reveal>{t.text}</p>

                  {/* Zonen als ruhige Liste mit Haarlinien (ohne Nummern, Kundenwunsch) */}
                  <ul className="mt-9 grid max-w-[560px] grid-cols-1 border-t hairline sm:grid-cols-2 sm:gap-x-10" data-reveal-group>
                    {t.items.map((item) => (
                      <li key={item} className="t-body border-b hairline py-3">
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Ein CTA pro Panel, beide «Termin anfragen» (Behandlungsplan bleibt über Nav und Preise erreichbar) */}
                  <div className="mt-10" data-reveal>
                    <LuxButton href={cta.href}>{cta.label}</LuxButton>
                  </div>
                </div>

                {/* Bild — so gross wie der Bildschirm zulässt, runde Ecken */}
                <div className={`order-1 lg:col-span-7 ${flip ? "lg:order-1" : "lg:order-2"}`}>
                  <div
                    className={`img-frame relative aspect-[4/5] w-full rounded-[24px] md:rounded-[32px] lg:aspect-[5/6] lg:h-[min(calc(100svh-var(--nav-h)-88px),920px)] lg:w-auto ${flip ? "lg:mr-auto" : "lg:ml-auto"}`}
                    data-reveal-img="bottom"
                    data-at="0"
                  >
                    <Picture
                      name={t.image as ImageName}
                      alt={t.imageAlt}
                      sizes="(min-width: 1024px) 75vh, 92vw"
                      className="block h-full w-full"
                      imgClassName="h-full w-full object-cover"
                      position={t.id === "haarentfernung" ? "50% 75%" : "50% 46%"}
                      parallax
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
}
