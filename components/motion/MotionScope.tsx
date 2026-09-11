"use client";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useMotionMode } from "@/lib/useMotionMode";
import { dur, ease, stagger, scroll, dist } from "@/lib/motion";
import { staticTop } from "@/lib/dom";

/**
 * Zentrale Motion-API (gsap-motion §II.2), reduziert auf die im Blend-Plan geplanten Muster:
 *  data-reveal        autoAlpha 0→1, y 40→0 (chic A3/A5)
 *  data-reveal-group  Kinder gestaffelt (ScrollTrigger.batch)
 *  data-reveal-text   Masked Line Reveal (SplitText lines + mask)
 *  data-reveal-img    Mask Wipe von links/unten + Bild scale 1.15→1, x 40→0 (lagence B3) — composite-only:
 *                     Maske (erstes Kind) fährt ein, das Bild darin fährt gegenläufig → das Bild steht, die Kante wandert.
 *  data-count         Counter mit Snap
 *  data-parallax      Bild-Parallax im overflow-hidden-Wrapper (scale 1.16, yPercent ∓8, scrub) — nur über den Eintritt der
 *                     Karte (Dokumentposition via offsetTop-Kette, endet sobald eine Sticky-Karte steht); der Wipe-Ausgleich
 *                     schreibt y/x in px → getrennte Transform-Komponenten, kein Doppel-Schreiber auf dem <img>.
 *  data-deck          Section-Übergang (Stacked Cards): zoom / rise / cover / bloom / bloom-l / bloom-c / bloom-r / bloom-b / petal für die eintretende Karte,
 *                     die vorherige dunkelt leicht ab. Nur Desktop.
 *  data-scene         Section-Choreografie (≥ 1024 px): alle Reveal-Elemente der Section laufen in EINER Timeline
 *                     mit überlappenden Positionen (Takt = data-scene="0.14" s) statt in Einzel-Triggern; Auslöser
 *                     einmalig beim Eintritt der Section (data-scene-start, Default «top 70%»). data-at="0.3" setzt
 *                     die Position eines Elements fest (Bilder z. B. auf 0). Counter starten mit ihrem Reveal-Element.
 *                     Nach Ablauf: SplitText revert + clearProps (kein Rest-DOM, keine Layer).
 *
 * Performance-Doktrin (gilt mit und ohne GPU — die Choreografie ist in beiden Fällen identisch):
 *  · nur transform/opacity; will-change ausschliesslich für die Dauer eines Übergangs (Klassen is-transitioning / is-dimming)
 *  · verdeckte Vollbild-Ebenen werden ausgeblendet (Stack-Karten unter der nächsten Karte, Footer unter dem Inhalt)
 *  · Bloom-Flächen werden nach dem Übergang durch die Hintergrundfarbe ersetzt (is-settled) — keine Ebene im Leerlauf
 *  · SplitText/Szenen werden nach fonts.ready EIN Element pro Frame gebaut (kein 80-ms-Layout-Task im Hero-Intro)
 * Reduced-Motion (Lite): alles sofort sichtbar (ein Codepfad).
 */
export default function MotionScope({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const mode = useMotionMode();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { isDesktop: "(min-width: 768px)", isLarge: "(min-width: 1024px)", isMobile: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { isDesktop, isLarge, reduce } = ctx.conditions as { isDesktop: boolean; isLarge: boolean; reduce: boolean };
          const all = "[data-reveal], [data-reveal-text], [data-reveal-img], [data-reveal-group] > *";
          if (reduce || mode === "lite") {
            const els = gsap.utils.toArray<HTMLElement>(all);
            if (els.length) gsap.set(els, { clearProps: "all", autoAlpha: 1 });
            gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => { el.textContent = el.dataset.countDisplay ?? el.dataset.count ?? ""; });
            return;
          }
          const y = isDesktop ? dist.text : dist.textMobile;
          const main = document.getElementById("main");
          // Ruhelage im Dokument (lib/dom.ts): ohne Sticky-Versatz (Chromium liefert ihn auch in offsetTop) und ohne Transforms
          const docTop = staticTop;
          // Sticky-/Pinned-Sections (data-reveal-scope): Elemente im unteren Bildschirmdrittel erreichen die
          // normale Startlinie nie, weil die Section steht → Trigger direkt an der Viewport-Unterkante.
          // Footer (sticky bottom, liegt hinter dem Inhalt): sein Rect steht beim Refresh immer im Viewport →
          // Trigger ist das Ende von <main> (der Footer wird freigelegt, sobald main nach oben wegzieht).
          const triggerFor = (el: Element): { trigger: Element; start: string } => {
            if (main && el.closest(".site-footer")) return { trigger: main, start: "bottom 78%" };
            return { trigger: el, start: el.closest("[data-reveal-scope]") ? "top 97%" : scroll.start };
          };
          // Szenen nur ab 1024 px (Section = ein Bildschirm); darunter sind die Sections höher als der Viewport,
          // dann wäre eine Section-Timeline teils off-screen → Einzel-Trigger.
          const scenesOn = isLarge;
          const solo = <T extends HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel).filter((el) => !(scenesOn && el.closest("[data-scene]")));

          // data-reveal
          solo<HTMLElement>("[data-reveal]").forEach((el) => {
            const delay = parseFloat(el.dataset.reveal || "0") || 0;
            gsap.fromTo(el, { autoAlpha: 0, y }, {
              autoAlpha: 1, y: 0, duration: dur.text, ease: ease.out, delay,
              scrollTrigger: { ...triggerFor(el), once: true },
            });
          });

          // data-reveal-group
          solo<HTMLElement>("[data-reveal-group]").forEach((group) => {
            const kids = Array.from(group.children) as HTMLElement[];
            gsap.set(kids, { autoAlpha: 0, y });
            ScrollTrigger.create({
              ...triggerFor(group), once: true,
              onEnter: () => gsap.to(kids, { autoAlpha: 1, y: 0, duration: dur.text, ease: ease.out, stagger: stagger.items }),
            });
          });

          // data-reveal-img — Mask Wipe, composite-only (kein clip-path): Wrapper = stehende Clip-Box (overflow hidden),
          // Maske = erstes Kind (<picture>, overflow hidden) fährt von unten/rechts ein, Bild darin gegenläufig.
          // will-change nur für die Dauer des Wipes (Compositor rastert das skalierte Bild einmal statt pro Frame).
          // Maske trägt Wipe + Scale 1.15→1 (+ x 40→0 beim Wipe von links, wie bisher auf dem <picture>); das Bild darin
          // kompensiert nur den Wipe-Versatz (px, geteilt durch die aktuelle Skalierung) → steht exakt wie beim Clip-Reveal.
          // Parallax schreibt yPercent auf dem Bild, der Ausgleich y/x in px — getrennte Transform-Komponenten, kein Konflikt.
          const imgWipe = (wrap: HTMLElement, tl: gsap.core.Timeline, at: number, cleanup?: HTMLElement[]) => {
            const mask = wrap.firstElementChild as HTMLElement | null;
            const img = wrap.querySelector("img, video") as HTMLElement | null;
            const bottom = wrap.dataset.revealImg === "bottom";
            const axis = bottom ? "yPercent" : "xPercent";
            tl.fromTo(wrap, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur.image, ease: ease.reveal }, at);
            if (!mask) return;
            let size = 0;
            const setBack = img && img !== mask ? gsap.quickSetter(img, bottom ? "y" : "x", "px") : null;
            tl.fromTo(mask,
              { [axis]: 100, scale: 1.15, x: bottom ? 0 : dist.imageX, willChange: "transform" },
              {
                [axis]: 0, scale: 1, x: 0, duration: dur.image, ease: ease.reveal, clearProps: "willChange",
                onStart: () => { size = bottom ? mask.offsetHeight : mask.offsetWidth; if (img && img !== mask) gsap.set(img, { willChange: "transform" }); },
                onUpdate: () => {
                  if (!setBack) return;
                  const s = (gsap.getProperty(mask, "scale") as number) || 1;
                  const off = (gsap.getProperty(mask, axis) as number) || 0;
                  setBack((-off / 100) * size / s);
                },
                onComplete: () => { if (setBack) { setBack(0); gsap.set(img, { clearProps: "willChange" }); } },
              }, at);
            // Parallax-Bilder behalten ihre Transform (yPercent/scale werden vom Scrub geführt) — clearProps würde sie
            // auf scale 1 zurückwerfen, bis der nächste Scroll-Tick sie wieder setzt (sichtbarer Sprung).
            if (cleanup) { cleanup.push(wrap, mask); if (img && img !== mask && !img.hasAttribute("data-parallax")) cleanup.push(img); }
          };
          solo<HTMLElement>("[data-reveal-img]").forEach((wrap) => {
            const tl = gsap.timeline({ scrollTrigger: { ...triggerFor(wrap), toggleActions: "play none none reverse" } });
            imgWipe(wrap, tl, 0);
          });

          // Counter: Textänderungen invalidieren sonst die Root-Ebene → eigene Ebene für die Dauer des Zählens
          const counter = (el: HTMLElement, tl: gsap.core.Timeline, at: number) => {
            const target = parseFloat(el.dataset.count || "0");
            const suffix = el.dataset.countSuffix ?? "";
            const proxy = { v: parseFloat(el.dataset.countFrom || "0") || 0 };
            tl.set(el, { willChange: "transform" }, at);
            tl.to(proxy, { v: target, snap: { v: 1 }, duration: 1.6, ease: "power2.out", onUpdate: () => { el.textContent = `${Math.round(proxy.v)}${suffix}`; } }, at);
            tl.set(el, { clearProps: "willChange" }, at + 1.65);
          };

          // data-reveal-text — Masked Line Reveal (solo)
          const splitSolo = (el: HTMLElement) => {
            SplitText.create(el, {
              type: "lines", mask: "lines", autoSplit: true, linesClass: "split-line",
              onSplit: (self) => {
                gsap.set(el, { autoAlpha: 1 });
                return gsap.from(self.lines, {
                  yPercent: 110, duration: dur.text + 0.2, ease: ease.out, stagger: stagger.lines,
                  scrollTrigger: { ...triggerFor(el), once: true },
                });
              },
            });
          };

          // data-scene — Section-Choreografie: EINE Timeline pro Section (gsap-motion §III.3), Elemente in DOM-Reihenfolge
          // mit überlappenden Positionen; data-at fixiert eine Position.
          const buildScene = (scene: HTMLElement) => {
            const step = parseFloat(scene.dataset.scene || "") || 0.14;
            const tl = gsap.timeline({ paused: true, defaults: { ease: ease.out, duration: dur.text + 0.2 } });
            const cleanup: HTMLElement[] = [];
            const splits: SplitText[] = [];
            const positions = new Map<Element, number>();
            let done = false;
            let cursor = 0;

            const items = gsap.utils
              .toArray<HTMLElement>(scene.querySelectorAll("[data-reveal], [data-reveal-text], [data-reveal-group], [data-reveal-img]"))
              .filter((el) => el.closest("[data-scene]") === scene);

            items.forEach((el) => {
              const explicit = el.dataset.at;
              const at = explicit != null ? parseFloat(explicit) || 0 : cursor;
              let span = step;
              positions.set(el, at);

              if (el.hasAttribute("data-reveal-text")) {
                SplitText.create(el, {
                  type: "lines", mask: "lines", autoSplit: true, linesClass: "split-line",
                  onSplit: (self) => {
                    if (done) return;
                    if (!splits.includes(self)) splits.push(self);
                    gsap.set(el, { autoAlpha: 1 });
                    const tw = gsap.from(self.lines, { yPercent: 110, duration: dur.text + 0.3, ease: ease.out, stagger: stagger.lines });
                    tl.add(tw, at);
                    span = step + stagger.lines * Math.max(0, self.lines.length - 1);
                    return tw;
                  },
                });
              } else if (el.hasAttribute("data-reveal-group")) {
                const kids = Array.from(el.children) as HTMLElement[];
                const each = stagger.items * 0.7;
                tl.fromTo(kids, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, stagger: each }, at);
                cleanup.push(...kids);
                span = step + each * Math.max(0, kids.length - 1) * 0.5;
              } else if (el.hasAttribute("data-reveal-img")) {
                imgWipe(el, tl, at, cleanup);
                span = step * 2;
              } else {
                tl.fromTo(el, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0 }, at);
                cleanup.push(el);
              }
              // Takt läuft immer hinter dem spätesten Element weiter — auch nach einer festen Position (data-at),
              // sonst würden nachfolgende Elemente vor einem vorgezogenen Element starten
              cursor = Math.max(cursor, at + span);
            });

            // Counter laufen mit dem Reveal-Element, in dem sie stehen
            scene.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
              let host: Element | null = el.parentElement;
              while (host && host !== scene && !positions.has(host)) host = host.parentElement;
              const at = (host && positions.get(host)) || 0;
              counter(el, tl, at + 0.1);
            });

            // Zustand am DOM (Mess-Harness liest den animierten Kanal, nicht Stillstand)
            scene.dataset.sceneState = "idle";
            tl.eventCallback("onStart", () => { scene.dataset.sceneState = "playing"; });
            tl.eventCallback("onComplete", () => {
              done = true;
              splits.forEach((s) => s.revert());
              if (cleanup.length) gsap.set(cleanup, { clearProps: "transform,willChange" });
              scene.dataset.sceneState = "done";
            });
            // data-scene-delay: Startverzögerung in s (Szenen above the fold auf Unterseiten warten den Transition-Vorhang ab)
            const delay = parseFloat(scene.dataset.sceneDelay || "") || 0;
            ScrollTrigger.create({ trigger: scene, start: scene.dataset.sceneStart || "top 70%", once: true, onEnter: () => { delay ? gsap.delayedCall(delay, () => tl.play()) : tl.play(); } });
          };

          // Font-abhängige Arbeit (SplitText misst Zeilen → erzwungenes Layout pro Element): nach fonts.ready
          // EIN Auftrag pro Frame in DOM-Reihenfolge, damit kein langer Task ins Hero-Intro fällt. Alles im Kontext
          // (ctx.add) — sonst entgehen späte Tweens dem Cleanup (StrictMode-Doppelaufruf, Routenwechsel).
          let alive = true;
          let raf = 0;
          document.fonts.ready.then(() => {
            if (!alive) return;
            const jobs: Array<[Element, () => void]> = [];
            solo<HTMLElement>("[data-reveal-text]").forEach((el) => jobs.push([el, () => splitSolo(el)]));
            if (scenesOn) gsap.utils.toArray<HTMLElement>("[data-scene]").forEach((scene) => jobs.push([scene, () => buildScene(scene)]));
            jobs.sort((a, b) => (a[0].compareDocumentPosition(b[0]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
            const run = () => {
              if (!alive) return;
              const job = jobs.shift();
              if (!job) { ScrollTrigger.refresh(); return; }
              ctx.add(job[1]);
              raf = requestAnimationFrame(run);
            };
            // Erst das Font-Swap-Relayout des Browsers durchlassen (nächster Frame), dann Auftrag für Auftrag
            raf = requestAnimationFrame(() => { raf = requestAnimationFrame(run); });
          });

          // data-parallax — nur Desktop (Gesetz 10). yPercent ∓8 (Scale 1.16 deckt genau ±8 %), Scale konstant.
          // Positionen als Ruhelage (staticTop): eine stehende Sticky-Karte meldet in getBoundingClientRect UND offsetTop ihren
          // Versatz — beim Refresh (Fonts, Preis-Tabs, Resize) verrutschten sonst Start/Ende → Sprung.
          // In einer Sticky-Karte endet der Versatz, sobald die Karte steht (top = 0): sonst zieht das Bild weiter,
          // während die Karte und der Text stehen (spürbares «Schwimmen» hinter dem Scroll).
          if (isDesktop) {
            gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((img) => {
              const wrap = (img.closest(".img-frame") ?? img.parentElement) as HTMLElement;
              const card = img.closest<HTMLElement>(".stack-card");
              const start = () => docTop(card ?? wrap) - window.innerHeight;
              const end = () => (card ? docTop(card) : docTop(wrap) + wrap.offsetHeight);
              gsap.fromTo(img, { yPercent: -8, scale: 1.16 }, {
                yPercent: 8, scale: 1.16, ease: "none",
                scrollTrigger: { trigger: wrap, start, end, scrub: 0.5, invalidateOnRefresh: true },
              });
            });
          }

          // Verdeckte Vollbild-Ebenen ausblenden (Composite-Kosten ohne GPU): Sticky-Stack-Karten, sobald die nächste
          // Karte sie vollständig überdeckt; Footer (sticky bottom hinter dem Inhalt), bis <main> ihn freilegt.
          // Rein visibility → kein Layout, identisches Bild.
          if (isDesktop) {
            // Schwellen-Wächter über den ganzen Scrollweg (robust gegen Sprünge: Anker, Lenis immediate, Reload mitten
            // auf der Seite) — setzt nur bei Zustandswechsel, nie pro Frame
            const gate = (threshold: () => number, set: (past: boolean) => void) => {
              let th = threshold();
              let past: boolean | null = null;
              const check = (self: ScrollTrigger) => { const p = self.scroll() >= th; if (p !== past) { past = p; set(p); } };
              check(ScrollTrigger.create({ start: 0, end: "max", onRefresh: (self) => { th = threshold(); check(self); }, onUpdate: check }));
            };
            const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
            const firstDeck = document.querySelector<HTMLElement>("[data-deck]");
            cards.forEach((card, i) => {
              const next = cards[i + 1] ?? (firstDeck && docTop(firstDeck) > docTop(card) ? firstDeck : null);
              if (!next) return;
              gate(() => docTop(next), (past) => gsap.set(card, { visibility: past ? "hidden" : "inherit" }));
            });
            const footer = document.querySelector<HTMLElement>(".site-footer");
            if (footer && main) {
              gate(() => docTop(main) + main.offsetHeight - window.innerHeight, (past) => gsap.set(footer, { visibility: past ? "inherit" : "hidden" }));
            }
          }

          // data-deck — Section-Übergänge (gsap-motion §III.7 Stacked Cards + eigene Varianten), scrub über den Eintritt der Karte
          //  zoom  : Karte wächst 0.9 → 1 (Origin oben)
          //  rise  : Karte holt auf (yPercent 10 → 0)
          //  cover : Karte schiebt sich nur darüber (ruhig — Conversion-Strecken)
          //  Farbfüllungen (eine Familie, abwechselnde Richtung — die eigene Fläche wächst als weiche Ellipse (.deck-wash) über die vorherige, nur transform):
          //  bloom   : von oben (Ellipse senkt sich aus der Oberkante)
          //  bloom-l : aus der linken Kante
          //  bloom-c : aus der Mitte (Iris)
          //  bloom-r : aus der rechten Kante
          //  bloom-b : aus der Unterkante (Schluss-Bildschirm)
          //  petal   : Hero-Blattform (Markenform) aus der oberen rechten Ecke
          //  Vorgänger dunkelt nur leicht ab (kein Schrumpfen, kein Kippen → keine sichtbaren Ränder, keine Perspektive).
          //  Ebenen-Hygiene: is-transitioning (will-change auf Wash + Inhalt) nur während des Scrubs; danach is-settled
          //  (Fläche = Hintergrundfarbe, Wash unsichtbar) → im Leerlauf keine zusätzliche Ebene.
          if (isDesktop) {
            const decks = gsap.utils.toArray<HTMLElement>("[data-deck]");
            decks.forEach((sec, i) => {
              const inner = sec.querySelector<HTMLElement>(":scope > .deck-inner");
              if (!inner) return;
              const prev = decks[i - 1];
              let node: HTMLElement = sec;
              while (node.parentElement?.classList.contains("pin-spacer")) node = node.parentElement;
              const sib = node.previousElementSibling;
              const prevInner = prev && sib && (sib === prev || sib.contains(prev)) ? prev.querySelector<HTMLElement>(":scope > .deck-inner") : null;
              // Beim ersten Refresh ist isActive noch undefined → classList.toggle(name, undefined) SCHALTET UM statt zu setzen:
              // jede Karte trüge is-transitioning (will-change auf Fläche und Inhalt) vom Laden an bis zum ersten Toggle → !!
              const phase = (self: ScrollTrigger) => {
                const active = !!self.isActive;
                sec.classList.toggle("is-transitioning", active);
                sec.classList.toggle("is-settled", !active && (self.progress || 0) >= 1);
                prevInner?.classList.toggle("is-dimming", active);
              };
              const st = { trigger: sec, start: "top bottom", end: "top top", scrub: 0.6, onToggle: phase, onRefresh: phase };
              const kind = sec.dataset.deck;
              if (kind === "zoom") gsap.fromTo(inner, { scale: 0.9, transformOrigin: "50% 0%" }, { scale: 1, transformOrigin: "50% 0%", ease: "none", scrollTrigger: st });
              if (kind === "rise") gsap.fromTo(inner, { yPercent: 10 }, { yPercent: 0, ease: "none", scrollTrigger: st });
              const wash = inner.querySelector<HTMLElement>(":scope > .deck-wash");
              if (wash) {
                // Eine Timeline pro Karte, gescrubbt über den Eintritt: 0–1 wächst die Fläche (erst ruhig, dann zügig —
                // wirkt satter als linear), ab 0.76 blendet der Inhalt ein. So steht nie Inhalt über der noch
                // unbedeckten Aussenfläche (z. B. Creme-Text auf Leinen) — erst die Farbe, dann der Inhalt.
                const tl = gsap.timeline({ scrollTrigger: st });
                const grow = { ease: "power1.in", duration: 1 } as const;
                if (kind === "bloom")   tl.fromTo(wash, { scale: 0.22, yPercent: -44, transformOrigin: "50% 50%" }, { scale: 1.5, yPercent: 0, ...grow }, 0);
                if (kind === "bloom-b") tl.fromTo(wash, { scale: 0.18, yPercent: 46, transformOrigin: "50% 50%" }, { scale: 1.5, yPercent: 0, ...grow }, 0);
                if (kind === "bloom-c") tl.fromTo(wash, { scale: 0.12, transformOrigin: "50% 50%" }, { scale: 1.5, transformOrigin: "50% 50%", ...grow }, 0);
                // Kanten-Füllungen: Origin knapp innerhalb der Kante, scale 2.4 deckt alle vier Ecken (wie petal)
                if (kind === "bloom-l") tl.fromTo(wash, { scale: 0.1, transformOrigin: "12% 50%" }, { scale: 2.4, transformOrigin: "12% 50%", ...grow }, 0);
                if (kind === "bloom-r") tl.fromTo(wash, { scale: 0.1, transformOrigin: "88% 50%" }, { scale: 2.4, transformOrigin: "88% 50%", ...grow }, 0);
                if (kind === "petal")   tl.fromTo(wash, { scale: 0.1, transformOrigin: "82% 6%" }, { scale: 2.4, transformOrigin: "82% 6%", ...grow }, 0);
                const content = Array.from(inner.children).filter((c) => !c.classList.contains("deck-wash"));
                if (content.length) tl.fromTo(content, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24, ease: "power2.out" }, 0.76);
              } else if (kind === "cover" || !kind) {
                const { scrub: _scrub, ...bare } = st;
                ScrollTrigger.create(bare);
              }
              // Der Vorgänger wird NIE kleiner, verschoben oder gekippt (das würde seine eigene Aussenfläche als Rand freilegen) —
              // er dunkelt nur leicht ab, damit die wachsende Fläche Tiefe bekommt.
              if (prevInner) gsap.fromTo(prevInner, { "--dim": 0 }, { "--dim": 0.22, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: 0.6 } });
            });
          }

          // data-count (ausserhalb von Szenen)
          solo<HTMLElement>("[data-count]").forEach((el) => {
            const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
            counter(el, tl, 0);
          });

          return () => { alive = false; cancelAnimationFrame(raf); };
        },
      );
    },
    { scope: root, dependencies: [mode], revertOnUpdate: true },
  );

  return <div ref={root} className={className}>{children}</div>;
}
