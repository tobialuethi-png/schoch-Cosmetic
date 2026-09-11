# Animation-Audit — <Referenz-Slug>

> Installierte Vorlage — read-only. Nach `<project-dir>/reports/animation-audit.<slug>.md` kopieren und die Kopie füllen. Nie Projektdaten in den installierten Skill schreiben.
>
> Eine Zeile pro bedeutsamer Animation im Scope. Muster-Name aus dem Lexikon in `signature-animations` (englisch, wie dort). Messbasis: `gemessen` (Motion-Probe: `document.getAnimations()`, GSAP-/ScrollTrigger-Probe, Hover-Probe), `Frames` (aus Screenshot-Sequenz geschätzt — Wert mit `(est.)`), `beobachtet` (visuell). Unbekannte Werte: `Unknown`. WebGL-, Video- und Audio-gekoppelte Bewegung gehört hier hinein, wenn das Modul aktiv ist.

| # | Element / Section | Muster (Lexikon) | Trigger (load / scroll-enter / scrub / hover / click / time) | Start-Schwelle | Dauer | Easing | Delay / Stagger | Startzustand | Endzustand | Properties (transform / opacity / clip …) | Pin / Scrub / Parallax-Faktor | Sequenz / Abhängigkeit | Mobile-Verhalten | Messbasis | Evidenz |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | | | | | | | | |

## Motion-System

- Erkannte Bibliotheken und Mechanik (`libs`, `scroll_mechanism`):
- Easing-Familie (welche Kurven wiederholen sich, Werte aus `motion.waapi` / `motion.gsap.tweens`):
- Duration-Skala (Micro / UI / Section — gemessene Cluster):
- Stagger-Regeln (Abstände, Reihenfolge, Split-Ebene: Zeichen / Wort / Zeile — `libs.text_splitting`):
- Scroll-Kopplung (Lenis-Anmutung, Scrub-Glättung, Snap — `motion.gsap.scrolltriggers`):
- Intro-Choreografie (Frames `motion/intro-*` — Reihenfolge, Gesamtdauer `(est.)`):
- Signature-Momente der Referenz (Nennung, Machbarkeit im eigenen Stack, benötigte Assets):

## Zustände

- Geprüft (scroll / hover / click / resize / reduced-motion):
- Blockiert, nicht ausgelöst oder unsicher:
