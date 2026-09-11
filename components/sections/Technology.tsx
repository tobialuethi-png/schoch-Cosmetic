"use client";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useMotionMode } from "@/lib/useMotionMode";
import { technology } from "@/lib/site";
import Picture from "@/components/ui/Picture";
import type { ImageName } from "@/lib/images.generated";
import LuxButton from "@/components/ui/LuxButton";
import { staticTop } from "@/lib/dom";

/**
 * Section 5 — Technologie als «Lichtfaden» (Scroll Path / Thread Storytelling, vertikal, kein Pin).
 *  · Ein Faden aus Licht tritt hinter dem Intro-Bild hervor, schlängelt sich in weichen Bögen durch
 *    die Argumente und mündet unten in eine Cocoa-Fläche (Delta), die nahtlos zur Fläche von «Über mich» wird.
 *    Farbe: sanftes Apricot oben → Terracotta unten («Sanftes Licht. Tiefgehende Wirkung.» wörtlich: das Licht wird tiefer).
 *  · Der Faden ZEICHNET sich mit dem Scroll: die Spitze steht immer auf der 72-%-Linie des Viewports, dort sitzt der
 *    Lichtimpuls (.tech-pulse). Technik (composite-only, auch ohne GPU flüssig): der komplette Faden ist einmal gemalt;
 *    darüber liegt eine cremefarbene Deckfläche (.tech-cover) mit weicher Oberkante, die per transform mit der Spitze
 *    mitfährt — der Faden wird freigelegt statt pro Frame neu gezeichnet (kein Repaint, kein Raster; früher: stroke-dashoffset
 *    → Repaint der ganzen Section pro Frame). Weil der Pfad in y monoton ist, entspricht «alles oberhalb der Spitze» exakt
 *    dem gezeichneten Anteil. Position der Spitze: aus vorab gesampelten Punkten (getPointAtLength nur beim Bauen, nie pro Frame).
 *  · Form: aus den gemessenen Bildpositionen gebaut (data-thread-anchor) — passt sich jedem Viewport und jeder Texthöhe an.
 *  · Die vier Argumente liegen abwechselnd links/rechts als Karten neben dem Faden; die Fotos in Blattform sitzen auf dem Faden.
 *    Karten und Fotos fliegen an den Scroll gekoppelt ein (scrub) und stehen, kurz bevor die Spitze sie erreicht.
 *  Mobil: gleicher Faden durch die gestapelten Bilder. Reduced/Lite: Faden komplett gezeichnet, kein Impuls, Inhalte sofort sichtbar.
 */
const b = technology.benefits;
const intro = { image: "produkt", imageAlt: "MPL4-Handstück mit integrierter Wasserkühlung am Bein einer Kundin", position: "38% 50%" };
/* Bildregie wie bisher: Gesicht, Behandlung, Kunde, Gerät; Seiten wechseln → der Faden schlängelt sich */
const stations = [
  { kicker: "Komfort", title: b[0].title, text: b[0].text, image: "foto5", imageAlt: b[3].imageAlt, position: "50% 42%", side: "left" },
  { kicker: "Ergebnis", title: b[1].title, text: b[1].text, image: "haar", imageAlt: b[1].imageAlt, position: "50% 40%", side: "right" },
  { kicker: "Hauttyp", title: b[2].title, text: b[2].text, image: "foto7", imageAlt: b[2].imageAlt, position: "56% 40%", side: "left" },
  { kicker: "Sicherheit", title: b[3].title, text: b[3].text, image: "erstesBild", imageAlt: "MPL4-Gerät Multipulselight 4G in der Praxis von Schoch Cosmetic", position: "50% 55%", side: "right" },
] as const;
/* Segmente: Intro-Bild → 4 Stationen → Mündung (der Faden beginnt HINTER dem Intro-Bild, nicht aus dem Nichts) */
const SEGMENTS = stations.length + 1;
/* Spitze des Fadens steht auf dieser Viewport-Linie (Anteil der Höhe) */
const TIP = 0.72;
const SAMPLES = 40;
/* Weiche Oberkante der Deckfläche (px) — der Faden klingt zur Spitze hin aus; der Impuls sitzt in der Mitte des Verlaufs */
const FADE = 140;

type Pt = { x: number; y: number };

export default function Technology() {
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const mode = useMotionMode();

  useGSAP(() => {
    const el = root.current;
    const s = svg.current;
    if (!el || !s) return;
    const cores = Array.from(s.querySelectorAll<SVGPathElement>(".th-core"));
    const halos = Array.from(s.querySelectorAll<SVGPathElement>(".th-halo"));
    const grads = Array.from(s.querySelectorAll<SVGLinearGradientElement>("linearGradient"));
    const anchors = Array.from(el.querySelectorAll<HTMLElement>("[data-thread-anchor]"));
    const merge = el.querySelector<HTMLElement>(".tech-merge");
    const pulse = el.querySelector<HTMLElement>(".tech-pulse");
    const cover = el.querySelector<HTMLElement>(".tech-cover");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    // Mobil (Gesetz 10): der Faden steht komplett gezeichnet — keine Deckfläche, kein Impuls, kein Scroll-Handler pro Frame,
    // keine gescrubbten Stationen. Natives Scrollen bleibt so vollständig im Compositor-Thread.
    const draw = !reduce && mode !== "lite" && isDesktop && !!pulse && !!cover;

    // Alle Punkte des Fadens (y monoton steigend), einmal gesampelt
    let samples: Pt[] = [];
    let endY = 0;
    let sectionTop = 0;
    let vh = 0;
    const f = (n: number) => n.toFixed(1);

    // Pfad aus den gemessenen Ankern bauen: kubische Bögen mit senkrechten Tangenten (weiche S-Kurven, keine Knicke)
    const build = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      sectionTop = staticTop(el);
      vh = window.innerHeight;
      // Erster Anker = Intro-Bild: der Startpunkt (Rundkappe) liegt verdeckt hinter dem Bild, der Faden tritt unten aus ihm aus
      const pts: Pt[] = [];
      anchors.forEach((a) => {
        // Offsets statt getBoundingClientRect: die Anker fliegen per transform ein, gemessen wird ihre Ruhelage
        let x = 0, y = 0;
        for (let n: HTMLElement | null = a; n && n !== el; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; }
        const k = parseFloat(a.dataset.threadAnchor || "0") || 0; // Versatz zur Karten-Seite, damit der Faden neben dem Bild sichtbar bleibt
        pts.push({ x: x + a.offsetWidth / 2 + k * a.offsetWidth, y: y + a.offsetHeight / 2 });
      });
      if (merge) pts.push({ x: W / 2, y: merge.offsetTop + 90 });
      s.setAttribute("viewBox", `0 0 ${W} ${H}`);
      // Verlauf endet an der Oberkante der Mündung (dort trifft der Faden auf die Ellipse) → letzter Stop = Cocoa exakt am Eintritt
      const gradEnd = merge ? merge.offsetTop : H;
      grads.forEach((g) => g.setAttribute("y2", String(gradEnd)));
      samples = [];
      for (let i = 0; i < SEGMENTS && i + 1 < pts.length; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const c = (p1.y - p0.y) * 0.5;
        const d = `M ${f(p0.x)} ${f(p0.y)} C ${f(p0.x)} ${f(p0.y + c)} ${f(p1.x)} ${f(p1.y - c)} ${f(p1.x)} ${f(p1.y)}`;
        cores[i].setAttribute("d", d);
        halos[i].setAttribute("d", d);
        if (draw) {
          const L = cores[i].getTotalLength();
          for (let k = i === 0 ? 0 : 1; k <= SAMPLES; k++) {
            const p = cores[i].getPointAtLength((L * k) / SAMPLES);
            samples.push({ x: p.x, y: p.y });
          }
        }
      }
      endY = pts.length ? pts[pts.length - 1].y : H;
      update();
    };

    // Pro Frame: nur Arithmetik + zwei Transforms (Deckfläche, Impuls) — keine Layout-Reads, kein Repaint
    const setCover = cover ? gsap.quickSetter(cover, "y", "px") : null;
    const setX = pulse ? gsap.quickSetter(pulse, "x", "px") : null;
    const setY = pulse ? gsap.quickSetter(pulse, "y", "px") : null;
    const setA = pulse ? gsap.quickSetter(pulse, "opacity") : null;
    function update() {
      if (!draw || !samples.length || !setCover || !setX || !setY || !setA) return;
      const tipY = window.scrollY - sectionTop + vh * TIP;
      setCover(tipY - FADE / 2);
      const startY = samples[0].y;
      if (tipY <= startY || tipY >= endY) { setA(0); return; }
      // Spitze = Schnittpunkt des Fadens mit der Linie y = tipY (y ist entlang des Pfads monoton)
      let lo = 0, hi = samples.length - 1;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (samples[mid].y <= tipY) lo = mid; else hi = mid; }
      const a = samples[lo];
      const b2 = samples[hi];
      const u = (tipY - a.y) / Math.max(1e-6, b2.y - a.y);
      setX(a.x + (b2.x - a.x) * u); setY(tipY); setA(1);
    }

    build();
    // Vor jeder Trigger-Berechnung (Resize, fonts.ready) und bei jeder Höhenänderung der Section neu bauen
    ScrollTrigger.addEventListener("refreshInit", build);
    let raf = 0;
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(build); });
    ro.observe(el);
    let alive = true;
    document.fonts.ready.then(() => { if (alive) build(); });

    if (!draw && !reduce && mode !== "lite") {
      // Mobil: Stationen erscheinen einmalig (autoAlpha + y, once) statt gescrubbt — kein Trigger bleibt aktiv
      el.querySelectorAll<HTMLElement>(".tech-station .tech-petal, .tech-card").forEach((item) => {
        gsap.fromTo(item, { autoAlpha: 0, y: 32 }, {
          autoAlpha: 1, y: 0, duration: 0.8, ease: "out",
          scrollTrigger: { trigger: item, start: "top 90%", once: true },
        });
      });
    }

    if (draw) {
      // will-change auf Deckfläche und Impuls nur, solange die Section im Bild ist — die Deckfläche ist viewport-gross,
      // eine dauerhafte Ebene kostet mobil (DPR 3) zweistellig MB Raster-Speicher
      ScrollTrigger.create({
        trigger: el, start: "top bottom", end: "bottom top", onUpdate: update, onRefresh: update,
        onToggle: (self) => {
          if (cover) cover.style.willChange = self.isActive ? "transform" : "auto";
          if (pulse) pulse.style.willChange = self.isActive ? "transform, opacity" : "auto";
        },
      });

      // Stationen fliegen an den Scroll gekoppelt ein (scrub) und stehen bei 74 % — kurz bevor die Spitze (72 %) ankommt.
      // Karten kommen von ihrer Seite, Bilder von unten mit leichtem Scale; nur transform + opacity.
      // will-change nur solange der Trigger aktiv ist (Compositor rastert das skalierte Bild einmal).
      el.querySelectorAll<HTMLElement>(".tech-station .tech-petal, .tech-card").forEach((item) => {
        const isCard = item.classList.contains("tech-card");
        const side = item.closest<HTMLElement>(".tech-station")?.dataset.side; // left = Bild links, Karte rechts
        const from = isCard ? { autoAlpha: 0, y: 56, x: side === "left" ? 56 : -56 } : { autoAlpha: 0, y: 96, scale: 0.94 };
        gsap.fromTo(item, from, {
          autoAlpha: 1, x: 0, y: 0, scale: 1, ease: "power2.out",
          scrollTrigger: {
            trigger: item, start: "top 100%", end: "top 74%", scrub: 0.5,
            onToggle: (self) => gsap.set(item, { willChange: self.isActive ? "transform" : "auto" }),
          },
        });
      });
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      ScrollTrigger.removeEventListener("refreshInit", build);
    };
  }, { scope: root, dependencies: [mode], revertOnUpdate: true });

  const segIdx = Array.from({ length: SEGMENTS }, (_, i) => i);

  return (
    <section ref={root} id="technologie" className="tech" aria-labelledby="tech-title" data-reveal-scope>
      {/* Lichtfaden: pro Segment ein Saum + ein Kern (Verläufe im Section-Koordinatensystem, y2 = Höhe aus build()) */}
      <svg ref={svg} className="tech-thread" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="tech-thread-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
            <stop offset="0" stopColor="#f4d6c0" />
            <stop offset="0.38" stopColor="#f2b58c" />
            <stop offset="0.64" stopColor="#c8653a" />
            <stop offset="0.84" stopColor="#7b3f27" />
            <stop offset="1" stopColor="#2b1e17" />
          </linearGradient>
          {/* Lichtsaum klingt vor der Mündung aus — das tiefe Ende steht ohne hellen Rand in der Fläche. Deckkraft im Verlauf
              (stopOpacity) statt opacity auf dem Pfad: kein Transparenz-Puffer pro Pfad und Kachel beim Malen (mobil spürbar). */}
          <linearGradient id="tech-halo-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
            <stop offset="0" stopColor="#f6e1d2" stopOpacity="0.5" />
            <stop offset="0.7" stopColor="#f6e1d2" stopOpacity="0.5" />
            <stop offset="0.93" stopColor="#f6e1d2" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g>{segIdx.map((i) => <path key={i} className="th-halo" />)}</g>
        <g>{segIdx.map((i) => <path key={i} className="th-core" />)}</g>
      </svg>
      {/* Deckfläche: legt den Faden mit dem Scroll frei (nur transform) */}
      <div className="tech-cover" aria-hidden="true" />
      <span className="tech-pulse" aria-hidden="true" />

      <div className="tech-body">
        {/* Intro: Headline links, Handstück-Bild rechts auf dem Faden */}
        <div className="section">
          <div className="shell grid items-center gap-12 md:grid-cols-12 md:gap-10 lg:gap-14 xl:gap-20">
            {/* Mobil: Text zuerst, Bild darunter — der Faden beginnt hinter dem Bild und kreuzt so keinen Text */}
            <div className="order-1 md:order-none md:col-span-6 [container-type:inline-size]">
              <h2 id="tech-title" className="t-h2 tech-title" data-reveal-text>
                Sanftes Licht. <em>Tiefgehende</em> Wirkung.
              </h2>
              <p className="t-lead mt-7 max-w-[540px] text-umber" data-reveal>{technology.lead}</p>
              <div className="mt-10" data-reveal>
                <LuxButton href={technology.cta.href}>{technology.cta.label}</LuxButton>
              </div>
            </div>
            <div className="order-2 md:order-none md:col-span-6">
              <div className="tech-petal tech-petal--r tech-intro-media relative w-full bg-linen md:ml-auto" data-reveal data-thread-anchor="-0.22">
                <Picture
                  name={intro.image as ImageName}
                  alt={intro.imageAlt}
                  sizes="(min-width: 1280px) 46vw, (min-width: 768px) 50vw, 92vw"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  position={intro.position}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stationen: Bild auf dem Faden, Karte daneben — Seiten wechseln */}
        <div className="shell tech-stations">
          {stations.map((st, i) => (
            <div key={st.title} className="tech-station" data-side={st.side}>
              <div className="tech-st-media">
                <div
                  className={`tech-petal ${st.side === "left" ? "tech-petal--l" : "tech-petal--r"} relative bg-linen`}
                  data-thread-anchor={st.side === "left" ? "0.22" : "-0.22"}
                >
                  <Picture
                    name={st.image as ImageName}
                    alt={st.imageAlt}
                    sizes="(min-width: 1280px) 34vw, (min-width: 768px) 40vw, 78vw"
                    className="block h-full w-full"
                    imgClassName="h-full w-full object-cover"
                    position={st.position}
                  />
                </div>
              </div>
              <article className="tech-card">
                <p className="t-eyebrow text-orange-ink">{st.kicker}</p>
                <h3 className="tech-st-title mt-3">{st.title}</h3>
                <p className="t-body-lg tech-card-text mt-4 text-umber">{st.text}</p>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Mündung: der Faden läuft in eine Cocoa-Ellipse, die unten die volle Breite hat = Fläche von «Über mich» */}
      <div className="tech-merge" aria-hidden="true">
        <div className="tech-delta" />
      </div>
    </section>
  );
}
