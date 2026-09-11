"use client";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useMotionMode } from "@/lib/useMotionMode";
import { hero } from "@/lib/site";
import Picture from "@/components/ui/Picture";
import LuxButton from "@/components/ui/LuxButton";
import { dur, ease, stagger } from "@/lib/motion";

/**
 * Signature 1 — Salon-Hero nach chic #1 (Split Hero: grosse Serif-Headline links, organisch maskiertes Bild
 * + kleines Kreisbild rechts, weich getönte Fläche) mit eigener Formsprache (Blattform statt Bogen, Apricot/Sage-Wash).
 * Motion: Fixed Hero Cover (wonder C2) + Curtain-Wipe im Bild (lagence B1) + Masked Line Reveal (chic A1).
 * Eine Timeline (Apple-Blueprint: Bühne → Headline → Details): 0 Curtain hebt sich (800 ms), Collage steigt 48 px
 * und Bild 1.12→1 (1.6 s); 350/440/530 ms Zeilen aus der Maske (1 s); 850 CTA; 950 Kreisbild setzt sich (scale .8→1).
 * Initialzustände in CSS (.hero-line / .gs-reveal hidden) — kein Frame mit sichtbarer Headline vor dem Start.
 * Gate: fonts + Hero-Bild dekodiert, 1500-ms-Fallback. Mobil / reduced / lite: Layer im Fluss, Inhalt sofort sichtbar.
 */
export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const mode = useMotionMode();

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({ isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { isDesktop, reduce } = ctx.conditions as { isDesktop: boolean; reduce: boolean };
      const lite = mode === "lite";
      const q = gsap.utils.selector(section);
      const fixed = isDesktop && !reduce && !lite;
      gsap.set(layer.current, fixed ? { position: "fixed", autoAlpha: 1 } : { clearProps: "position", autoAlpha: 1 });

      if (reduce || lite) {
        gsap.set(q(".hero-curtain"), { autoAlpha: 0 });
        gsap.set(q(".gs-reveal, .hero-line"), { clearProps: "transform,opacity,visibility", autoAlpha: 1 });
        return;
      }

      if (fixed) {
        ScrollTrigger.create({
          trigger: section.current, start: "bottom top",
          onEnter: () => gsap.set(layer.current, { autoAlpha: 0 }),
          onLeaveBack: () => gsap.set(layer.current, { autoAlpha: 1 }),
        });
      }

      // Magnetic Button (gsap-motion §III.7): ein quickTo pro Achse, nie ein Tween pro pointermove
      if (isDesktop) {
        const btn = section.current?.querySelector<HTMLElement>(".btn-lux");
        const disc = btn?.querySelector<HTMLElement>(".disc");
        if (btn && disc) {
          const bx = gsap.quickTo(btn, "x", { duration: 1.1, ease: "power2" });
          const by = gsap.quickTo(btn, "y", { duration: 1.1, ease: "power2" });
          const dx = gsap.quickTo(disc, "x", { duration: 1.1, ease: "power2" });
          const dy = gsap.quickTo(disc, "y", { duration: 1.1, ease: "power2" });
          const zone = btn.parentElement as HTMLElement;
          const onMove = (e: PointerEvent) => {
            const r = btn.getBoundingClientRect();
            const ox = e.clientX - (r.left + r.width / 2);
            const oy = e.clientY - (r.top + r.height / 2);
            bx(ox * 0.1); by(oy * 0.1); dx(ox * 0.05); dy(oy * 0.05);
          };
          const onLeave = () => { bx(0); by(0); dx(0); dy(0); };
          zone.addEventListener("pointermove", onMove);
          zone.addEventListener("pointerleave", onLeave);
          ctx.add(() => () => { zone.removeEventListener("pointermove", onMove); zone.removeEventListener("pointerleave", onLeave); });
        }
      }

      const tl = gsap.timeline({ paused: true, defaults: { ease: ease.out } });
      tl.addLabel("in", 0)
        // Bühne: Vorhang hebt sich, Collage steigt, Bild atmet auf 1
        .to(q(".hero-curtain"), { yPercent: -100, duration: 0.8, ease: ease.reveal }, "in")
        .fromTo(q(".hero-collage"), { y: isDesktop ? 48 : 24 }, { y: 0, duration: 1.5, ease: ease.reveal }, "in")
        // will-change während des Zooms: der Compositor rastert das Bild einmal statt bei jedem Scale-Schritt neu
        .fromTo(q(".hero-img"), { scale: 1.12, willChange: "transform" }, { scale: 1, duration: dur.heroTotal, ease: ease.reveal, clearProps: "willChange" }, "in")
        // Headline: Zeilen aus der Maske (visibility im selben Tick wie yPercent 110 → kein FOUC)
        .fromTo(q(".hero-line"), { yPercent: 110, visibility: "visible" }, { yPercent: 0, duration: 1.0, stagger: stagger.lines + 0.01 }, "in+=0.35")
        // Details
        .fromTo(q(".hero-actions"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "in+=0.85")
        .fromTo(q(".hero-circle"), { autoAlpha: 0, scale: 0.8, y: 16 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.9 }, "in+=0.95")
        .set(q(".hero-curtain"), { autoAlpha: 0 });

      const img = section.current?.querySelector<HTMLImageElement>(".hero-img");
      const decoded = img && !img.complete ? img.decode().catch(() => undefined) : Promise.resolve();
      const timeout = new Promise<void>((r) => setTimeout(r, 1500));
      let started = false;
      let raf = 0;
      // Zwei Frames Abstand: das Font-Swap-Relayout (ein langer Layout-Task) läuft im ersten Frame, die Timeline
      // startet im zweiten mit sauberem Hauptthread — kein Sprung im Curtain-Wipe, auch auf schwachen Geräten
      const start = () => { if (!started) { started = true; raf = requestAnimationFrame(() => { raf = requestAnimationFrame(() => tl.play()); }); } };
      Promise.race([Promise.all([document.fonts.ready, decoded]), timeout]).then(start, start);
      return () => { cancelAnimationFrame(raf); tl.kill(); };
    });
  }, { scope: section, dependencies: [mode], revertOnUpdate: true });

  return (
    <section ref={section} id="top" className="relative md:h-[100svh] md:min-h-[680px]" aria-labelledby="hero-title">
      <div ref={layer} className="hero-layer hero-wash relative z-0 text-ink md:absolute md:inset-0 md:overflow-hidden">
        {/* Mobil: ein Bildschirm (100svh), Reihenfolge Headline → Bild → CTA (Text-Spalte per display: contents aufgelöst),
            unten Platz für die Bottom-Bar (64 px) — nichts hängt über die Falz. Ab md: Split-Layout wie bisher. */}
        <div className="shell flex min-h-[100svh] flex-col justify-center pt-[calc(var(--nav-h)+16px)] pb-[84px] md:h-full md:min-h-0 md:pt-[calc(var(--nav-h)+24px)] md:pb-6" style={{ maxWidth: "calc(1760px + 2 * var(--gutter))" }}>
          <div className="grid items-center gap-7 md:grid-cols-12 md:gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
            {/* Text — links, zentriert: nur Headline + ein CTA */}
            <div className="contents text-center md:block md:col-span-6 lg:col-span-1 md:[container-type:inline-size]">
              <h1 id="hero-title" className="t-hero order-1 md:order-none">
                {hero.lines.map((line) => (
                  <span key={line} className="block pb-[0.1em] -mb-[0.1em] [clip-path:inset(0_-40%_0_-40%)]">
                    <span className="hero-line block whitespace-nowrap">
                      {line.split("*").map((part, i) => (i % 2 ? <em key={i} className="text-orange">{part}</em> : <span key={i}>{part}</span>))}
                    </span>
                  </span>
                ))}
              </h1>
              <div className="hero-actions gs-reveal order-3 flex justify-center md:order-none md:mt-12 md:px-6">
                <LuxButton href={hero.primary.href}>{hero.primary.label}</LuxButton>
              </div>
            </div>

            {/* Bild-Collage — rechts: Blattform + Kreisbild */}
            <div className="order-2 md:order-none md:col-span-6 lg:col-span-1">
              <div className="hero-collage relative mx-auto w-full max-w-[520px] pb-3 md:mx-0 md:ml-auto md:w-[calc(min(74svh,920px)*0.8)] md:max-w-full md:pb-0 md:pr-10">
                {/* Mobil querer Ausschnitt (5:4) in Blattform, ab md Hochformat 4:5 */}
                <div className="hero-petal relative aspect-[5/4] w-full overflow-hidden bg-linen md:aspect-[4/5]">
                  <Picture
                    name="Hero2x"
                    alt="Kundin mit Schutzbrille während der MPL4-Behandlung im Gesicht, Andrea Schoch führt das Handstück"
                    sizes="(min-width: 1280px) 520px, (min-width: 768px) 46vw, 92vw"
                    priority
                    className="absolute inset-0 block h-full w-full"
                    imgClassName="hero-img h-full w-full object-cover object-[50%_32%] md:object-[50%_40%]"
                  />
                  <div aria-hidden="true" className="hero-curtain absolute inset-0 z-[5] bg-cream" />
                </div>
                <div className="hero-circle gs-reveal absolute -bottom-1 right-2 h-[96px] w-[96px] overflow-hidden rounded-full ring-[5px] ring-cream shadow-[var(--shadow-soft)] md:-right-6 md:-bottom-6 md:h-[clamp(180px,12vw,280px)] md:w-[clamp(180px,12vw,280px)] md:ring-8 lg:-right-10">
                  <Picture
                    name="produkt"
                    alt="MPL4-Handstück am Bein einer Kundin"
                    sizes="180px"
                    className="block h-full w-full"
                    imgClassName="h-full w-full object-cover"
                    position="55% 45%"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
