"use client";
import { useId, useState } from "react";
import { faq } from "@/lib/site";

/* Section 10 — FAQ «Häufige Fragen» (chic #10): Headline in Section-Grösse links, Accordion rechts;
   Höhe über grid-template-rows (kein Layout-Tween per JS). Toggle = SC-Monogramm aus dem Logo (.sc-mark, Maske → tintbar):
   zu = Haarlinien-Kreis + orangenes Monogramm, offen = Cocoa-Scheibe + Creme-Monogramm. Fläche Apricot (warm nach Cocoa). */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <section id="faq" data-deck="bloom-r" className="bg-cocoa" aria-labelledby="faq-title">
      <div className="deck-inner section bg-[var(--tone)]" style={{ "--tone": "var(--color-apricot)" } as React.CSSProperties}>
        <div className="deck-wash" aria-hidden="true" />
        <div className="shell grid gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
          <header className="md:col-span-5">
            <h2 id="faq-title" className="t-h2" data-reveal-text>{faq.title}</h2>
            <p className="t-lead mt-8 max-w-[400px] text-umber" data-reveal>Antworten auf das, was vor dem ersten Termin am häufigsten gefragt wird.</p>
          </header>
          <div className="md:col-span-7" data-reveal-group>
            {faq.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q} className="border-t hairline last:border-b">
                  <h3>
                    <button
                      type="button"
                      id={`${id}-q${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`${id}-a${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left font-serif text-[clamp(22px,1.1rem+1.1vw,36px)] leading-[1.12] tracking-[-0.01em] md:py-7"
                    >
                      {item.q}
                      <span aria-hidden="true" className={`faq-toggle grid h-11 w-11 shrink-0 place-items-center rounded-full border hairline transition-colors duration-300 ease-[var(--ease-micro)] ${isOpen ? "faq-toggle--open" : ""}`}><span className="sc-mark" /></span>
                    </button>
                  </h3>
                  <div
                    id={`${id}-a${i}`}
                    role="region"
                    aria-labelledby={`${id}-q${i}`}
                    className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-micro)]"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="t-body max-w-[640px] pb-7 text-umber">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
