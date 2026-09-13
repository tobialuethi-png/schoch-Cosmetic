import { about, site } from "@/lib/site";
import Picture from "@/components/ui/Picture";
import type { ImageName } from "@/lib/images.generated";
import { ArrowRight } from "@/components/ui/Icons";
import { TransitionLink } from "@/components/motion/Transition";

/**
 * Section 7 — Über mich: der einzige dunkle Block der Seite (tiefes Cocoa, Creme-Text, Apricot-Akzente) — Kontrastpunkt in der Mitte.
 * Sticky-Collage links (ein Bildschirm, bleibt stehen — lagence #4), rechts Name in Section-Grösse, Pull-Quote in Serif-Italic.
 * Übergang: kein Deck — der Lichtfaden der Technologie mündet in eine Cocoa-Fläche (Delta), die nahtlos in diese Section übergeht.
 * Bilder mit Mask Wipe / Clip Reveal (kein Parallax: die Sticky-Collage würde mit scrub nachziehen und die 1.16-Skalierung
 * schneidet beim 818×615-Porträt die Haare ab). Ab 1024 px läuft die ganze Section als EINE Szene (data-scene):
 * beide Bilder zeitgleich bei 0 s, danach Jahre → Name → Rolle → Zitat → Absätze → CTA — ein Takt, keine Einzel-Trigger.
 * Bilder lazy: die Section liegt weit unter dem ersten Bildschirm, der Browser lädt lazy-Bilder ohnehin ein bis zwei
 * Bildschirmhöhen vor dem Eintritt — der Wipe (Trigger ab 75 % Viewport) trifft so auf ein fertiges Bild.
 */
export default function About() {
  const years = new Date().getFullYear() - site.since;
  return (
    <section id="ueber-mich" className="bg-cocoa" aria-labelledby="about-title" data-scene="0.12" data-scene-start="top 75%">
      <div className="relative bg-cocoa text-cream">
        <div className="shell py-[var(--section-y)] md:grid md:grid-cols-12 md:gap-10 md:py-0 lg:gap-16">
          {/* Sticky-Collage */}
          <div data-reveal-scope className="md:sticky md:top-0 md:col-span-5 md:flex md:h-[100svh] md:flex-col md:justify-center md:self-start md:pt-[var(--nav-h)]">
            <div className="relative pb-16 pr-16 md:pb-20 md:pr-20">
              <div className="img-frame aspect-[4/5] max-w-[460px] md:h-[min(58svh,600px)] md:w-auto md:max-w-none" data-reveal-img>
                <Picture name={about.image} alt={about.imageAlt} sizes="(min-width: 768px) 490px, 80vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" position="54% 0%" />
              </div>
              <div className="img-frame absolute bottom-0 right-0 aspect-[3/4] w-[46%] max-w-[240px] shadow-[var(--shadow-soft)]" data-reveal-img="bottom" data-at="0">
                <Picture name={about.secondImage as ImageName} alt={about.secondImageAlt} sizes="240px" imgClassName="h-full w-full object-cover" position="50% 40%" />
              </div>
            </div>
            <div className="mt-4 flex items-end gap-6 md:mt-5" data-reveal>
              <span className="font-serif text-[clamp(64px,3rem+3.6vw,120px)] leading-[0.9] tracking-[-0.03em] tnum text-apricot">{years}</span>
              <span className="t-eyebrow pb-2 text-cream/60">Jahre Erfahrung<br />in der eigenen Praxis</span>
            </div>
          </div>

          {/* Text zieht an der Collage vorbei */}
          <div className="mt-14 md:col-span-7 md:mt-0 md:pb-[var(--section-y)] md:pt-[calc(var(--nav-h)+40px)] lg:pl-6">
            <p className="t-eyebrow text-apricot" data-reveal>Über mich</p>
            <h2 id="about-title" className="t-h2 mt-6" data-reveal-text>{about.title}</h2>
            <p className="t-sub mt-5 text-cream/60" data-reveal>{about.role}</p>

            <blockquote className="t-statement mt-14 max-w-[720px] italic" data-reveal-text>
              «{about.quote}»
            </blockquote>

            <div className="mt-14 grid max-w-[720px] gap-7 t-body-lg text-cream/78" data-reveal-group>
              {about.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>

            {/* CTA führt wie alle anderen zum Kontaktformular (Transition: Section-Oberkante) */}
            <TransitionLink href={about.cta.href} className="btn btn-ghost btn-ghost--light mt-12" data-reveal>{about.cta.label} <ArrowRight /></TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
