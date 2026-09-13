"use client";
import { useRef, useState } from "react";
import { useGSAP, ScrollTrigger } from "@/lib/gsap";
import { treatmentPlan, treatmentPlanIntro, type PlanEntry } from "@/lib/site";
import { scrollToTarget } from "@/lib/lenis";

const zoneId = (zone: string) => `zone-${zone.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/* Eine Zone = Name in Serif + Preis, darunter eine ruhige Meta-Zeile (Sitzungen · Dauer · Abstand · Gesamt).
   Trennung nur über Luft (frontend-taste §3: erst Luft, dann Hairline, dann Karte). Die sichtbaren Trennpunkte sind
   leere CSS-Kreise; damit Text-Extraktion und Screenreader die Angaben nicht zusammenziehen («Behandlungenca.»),
   steht vor jeder weiteren Angabe ein unsichtbares «, » (sr-only, position: absolute — kein Einfluss auf das Layout). */
function Row({ e }: { e: PlanEntry }) {
  const meta = [e.sessions, e.duration, e.interval, `${e.total} gesamt`];
  return (
    <div className="plan-row -mx-4 rounded-2xl px-4 py-5 transition-colors duration-150 md:py-6">
      <div className="flex items-baseline justify-between gap-6">
        <dt className="font-serif text-[clamp(26px,1.2rem+1.2vw,40px)] leading-[1.05] tracking-[-0.015em]">{e.name}</dt>
        <dd className="t-body tnum whitespace-nowrap font-medium">{e.price}</dd>
      </div>
      {/* Mobil 2×2-Raster ohne Punkte (kein Trennpunkt am Zeilenanfang), ab md eine Zeile mit Mittelpunkten */}
      <dd className="t-small tnum mt-2.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-umber md:mt-3 md:block">
        {meta.map((m, i) => (
          <span key={m} className="md:inline-block md:whitespace-nowrap">
            {i > 0 && <span className="sr-only">, </span>}
            {i > 0 && <span aria-hidden="true" className="mx-2.5 hidden h-1 w-1 translate-y-[-0.2em] rounded-full bg-orange md:inline-block" />}
            {m}
          </span>
        ))}
      </dd>
    </div>
  );
}

/**
 * Section 1 der Route /behandlungsplan — stehende Spalte (H1, Lead, Zonen-Index) und rechts alle Zonen als editoriale
 * Serif-Zeilen ohne Tabellen-Raster (chic #4 Numbered List, multi-route: strukturierte Inhalte nie in Cards).
 * Der Index ist Scroll-Spy + Sprungmarke: die Zone im Bild leuchtet orange (ScrollTrigger pro Zone), Klick scrollt hin.
 */
export default function PlanView() {
  const [active, setActive] = useState<string>(treatmentPlan[0].zone);
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Scroll-Spy: aktiv ist die letzte Zone, deren Block-Oberkante über der 55-%-Linie liegt. Offsets werden bei
    // Refresh gecacht (kein Layout-Lesen pro Frame); robust auch bei Sprüngen (Anker, Lenis immediate).
    const els = treatmentPlan.map((z) => document.getElementById(zoneId(z.zone)));
    let tops: number[] = [];
    const measure = () => { tops = els.map((el) => (el ? el.getBoundingClientRect().top + window.scrollY : Infinity)); };
    const update = () => {
      const line = window.scrollY + window.innerHeight * 0.55;
      let i = 0;
      for (let k = 0; k < tops.length; k++) if (tops[k] <= line) i = k;
      const next = treatmentPlan[i].zone;
      setActive((prev) => (prev === next ? prev : next));
    };
    ScrollTrigger.create({ trigger: root.current, start: "top bottom", end: "bottom top", onRefresh: () => { measure(); update(); }, onUpdate: update });
  }, { scope: root });

  const jump = (zone: string) => {
    const el = document.getElementById(zoneId(zone));
    if (el) scrollToTarget(el, { offset: -(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 76) - 40 });
  };

  return (
    <section ref={root} className="bg-cream" aria-labelledby="plan-list-title">
      <div>
        <div className="shell pt-[calc(var(--nav-h)+var(--section-y)*0.5)] pb-[var(--section-y)] md:grid md:grid-cols-12 md:gap-10 md:py-0 lg:gap-16">
          {/* Stehende Spalte */}
          <header data-reveal-scope className="md:sticky md:top-0 md:col-span-5 md:flex md:h-[100svh] md:flex-col md:justify-center md:self-start md:pt-[var(--nav-h)] [container-type:inline-size]">
            <h1 id="plan-list-title" className="t-h2 plan-title" data-reveal-text>
              Ihr persönlicher <em className="block text-orange">Behandlungsplan.</em>
            </h1>
            <p className="t-lead mt-8 max-w-[420px] text-umber" data-reveal>{treatmentPlanIntro.listLead}</p>

            {/* Zonen-Index: Scroll-Spy (orange = im Bild) und Sprungmarke */}
            <nav aria-label="Zonen" className="mt-12 flex max-w-[420px] flex-col gap-1" data-reveal>
              {treatmentPlan.map((z) => {
                const on = z.zone === active;
                return (
                  <a
                    key={z.zone}
                    href={`#${zoneId(z.zone)}`}
                    aria-current={on ? "true" : undefined}
                    onClick={(e) => { e.preventDefault(); jump(z.zone); }}
                    className={`plan-index flex w-full items-baseline gap-4 py-2 transition-colors duration-300 ${on ? "text-orange-ink" : "text-ink/55 hover:text-ink"}`}
                  >
                    <span className="font-serif text-[clamp(24px,1.1rem+1vw,34px)] leading-[1.1]">{z.zone}</span>
                    <span className={`t-eyebrow tnum ml-auto transition-colors duration-300 ${on ? "text-orange-ink/70" : "text-umber/50"}`}>{z.entries.length}</span>
                  </a>
                );
              })}
            </nav>
          </header>

          {/* Zonen-Liste: zieht an der stehenden Spalte vorbei */}
          <div className="mt-14 md:col-span-7 md:mt-0 md:pb-[var(--section-y)] md:pt-[calc(var(--nav-h)+40px)]" data-reveal>
            {treatmentPlan.map((z, zi) => (
              <section key={z.zone} id={zoneId(z.zone)} aria-labelledby={`${zoneId(z.zone)}-title`} className={zi === 0 ? "" : "mt-20 md:mt-28"}>
                <h2 id={`${zoneId(z.zone)}-title`} className="t-statement">{z.zone}</h2>
                <dl className="mt-6 md:mt-8">
                  {z.entries.map((e) => <Row key={e.name} e={e} />)}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
