"use client";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { priceGroups } from "@/lib/site";
import { TransitionLink } from "@/components/motion/Transition";
import { ArrowRight } from "@/components/ui/Icons";
import { dur, ease } from "@/lib/motion";

/**
 * Section 4 — Preise: Sticky-Headline links (ein Bildschirm, bleibt stehen), Liste rechts zieht vorbei
 * (lagence #4-Prinzip, umgekehrt). Tabs über der Liste (wonder #8), nummerierte Zeilen mit Leitlinie (chic #4).
 * Conversion-Strecke → ruhig (Stufe 1): Übergang «bloom» (nur Fläche), keine Scrub-Effekte im Inhalt.
 * Tab-Wechsel ändert die Seitenhöhe (die Fusspflege-Liste ist deutlich kürzer): synchron rendern (flushSync) und
 * ScrollTrigger.refresh() — sonst stehen Lichtfaden, Deck-Übergänge und Footer-Gate darunter an den alten Positionen.
 */
export default function Pricing() {
  const [active, setActive] = useState<(typeof priceGroups)[number]["id"]>("haarentfernung");
  const panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const baseId = useId();

  const { contextSafe } = useGSAP(() => {}, { scope: root });

  const switchTo = contextSafe((id: typeof active) => {
    if (id === active) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("lite");
    const show = (next: typeof active) => { flushSync(() => setActive(next)); ScrollTrigger.refresh(); };
    if (reduce) { show(id); return; }
    gsap.to(panel.current, { autoAlpha: 0, y: 8, duration: dur.micro, ease: ease.micro, onComplete: () => {
      show(id);
      gsap.set(panel.current, { autoAlpha: 1, y: 0 });
      gsap.fromTo(".price-row", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: dur.microSlow, ease: ease.out, stagger: 0.03, clearProps: "transform" });
    } });
  });

  const group = priceGroups.find((g) => g.id === active)!;

  const note = active === "haarentfernung" ? (
    <TransitionLink href="/behandlungsplan/" className="link-arrow text-orange-ink">
      Wie viele Sitzungen brauche ich? Zum Behandlungsplan <ArrowRight />
    </TransitionLink>
  ) : null;

  return (
    <section ref={root} id="preise" data-deck="bloom" className="bg-sage" aria-labelledby="preise-title">
      <div className="deck-inner bg-[var(--tone)]" style={{ "--tone": "var(--color-cream)" } as React.CSSProperties}>
        <div className="deck-wash" aria-hidden="true" />
        <div className="shell py-[var(--section-y)] md:grid md:grid-cols-12 md:gap-10 md:py-0 lg:gap-16">
          {/* Sticky-Spalte: ein Bildschirm hoch, bleibt stehen */}
          <header data-reveal-scope className="md:sticky md:top-0 md:col-span-5 md:flex md:h-[100svh] md:flex-col md:justify-center md:self-start md:pt-[var(--nav-h)]">
            {/* Headline dreizeilig: «pro Zone.» steht immer auf eigener Zeile */}
            <h2 id="preise-title" className="t-h2" data-reveal-text>Transparente Preise, <em className="block">pro Zone.</em></h2>
            <p className="t-lead mt-8 max-w-[440px] text-umber" data-reveal>{group.note}</p>
            {/* Mobil volle Breite, beide Pills gleich breit (zwei Uppercase-Labels passen sonst nicht in 312 px); ab sm Inline-Pille */}
            <div role="tablist" aria-label="Preisbereich" className="mt-9 flex w-full rounded-full bg-linen p-1 sm:inline-flex sm:w-auto sm:self-start" data-reveal>
              {priceGroups.map((g) => {
                const selected = g.id === active;
                return (
                  <button
                    key={g.id}
                    role="tab"
                    id={`${baseId}-tab-${g.id}`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel`}
                    tabIndex={selected ? 0 : -1}
                    type="button"
                    onClick={() => switchTo(g.id)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                        const idx = priceGroups.findIndex((x) => x.id === active);
                        const next = priceGroups[(idx + (e.key === "ArrowRight" ? 1 : priceGroups.length - 1)) % priceGroups.length];
                        switchTo(next.id);
                        document.getElementById(`${baseId}-tab-${next.id}`)?.focus();
                      }
                    }}
                    className={`tab-pill flex-1 text-center sm:flex-none ${selected ? "is-active" : ""}`}
                  >
                    {g.tab}
                  </button>
                );
              })}
            </div>
            {note && <div className="mt-10 hidden md:block" data-reveal>{note}</div>}
          </header>

          {/* Liste: zieht an der Sticky-Spalte vorbei */}
          <div className="mt-12 md:col-span-7 md:mt-0 md:pb-[var(--section-y)] md:pt-[calc(var(--nav-h)+40px)]">
            <div ref={panel} id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} data-reveal>
              {group.categories.map((cat, ci) => (
                <div key={cat.title} className={ci === 0 ? "" : "pt-10 md:pt-16"}>
                  <h3 className="t-h3">{cat.title}</h3>
                  <dl className="mt-5">
                    {cat.rows.map((row) => (
                      <div key={row.label} className="price-row -mx-3 grid grid-cols-[auto_1fr_auto] items-baseline gap-x-3 rounded-lg px-3 py-3.5 sm:gap-x-5 sm:py-4">
                        <dt className="t-body">{row.label}</dt>
                        <span aria-hidden="true" className="price-leader min-w-4" />
                        <dd className="t-body tnum whitespace-nowrap font-medium">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            {note && <footer className="mt-8 md:hidden" data-reveal>{note}</footer>}
          </div>
        </div>
      </div>
    </section>
  );
}
