# Modul: Scroll-Systeme, Pinning, Text-Splitting, Preloader, Cursor

Trigger: Smooth Scroll (Lenis, ScrollSmoother, Locomotive), Virtual- oder Wheel-Scroll (`scroll_mechanism: wheel_virtual_scroll`), Pinning, Scrub, Horizontal-Scroll-Sections, Snap, Text-Splitting (Zeichen / Wörter / Zeilen), Marquees, Preloader und Intro-Gates, Custom Cursor, Sticky-Stacks.

## Analyse-Zusätze (Phase 1)

- `reference.json → per_viewport.<vp>.scroll_mechanism` und `libs` (Lenis-Klasse, GSAP-/ScrollTrigger-Probe) auswerten. Bei `wheel_virtual_scroll` scrollt das Script per Wheel-Events — Schrittweite und Trägheit beobachten.
- ScrollTrigger-Probe (`motion.gsap.scrolltriggers[]`): `start`/`end` in px, `scrub`, `pin`, `snap`, `toggle_actions` → direkt ins Audit (Messbasis `gemessen`); Schwellen als Anteil der Viewport-Höhe umrechnen. Ohne Probe: Schwellen aus Frames `(est.)`.
- Text-Splitting erkennen (`libs.text_splitting`: Anzahl `.char`/`.word`/`.line`-Knoten, Inline-Block-Spans in Headlines) und Split-Ebene plus Stagger-Abstand messen oder schätzen.
- Preloader: Gesamtdauer, Zähler oder Balken, Übergang in den Hero (`motion/intro-*`, `preloader_suspected`). Cursor: Form, Zustände (Hover-Link, Drag), Trägheit (`custom_cursor`).
- Mobile: welche Pins und Scrubs abgeschaltet sind, ob Horizontal-Sections vertikal werden.

## Blend-Plan-Zusätze

- Eine Scroll-Mechanik für die ganze Seite (Lenis-Parameter in den Motion-Tokens). Keine Mischung aus Smooth- und Native-Scroll-Abschnitten.
- Pin- und Scrub-Sections zählen als schwer → Dichte-Rhythmus im Kohärenz-Check. Horizontal-Sections brauchen einen Mobile-Plan.
- Preloader nur, wenn er dem Einstieg dient (Ladezeit oder Inszenierung mit Inhalt); Dauer höchstens so lang wie die Intro-Choreografie der Rolle. Custom Cursor nur auf Desktop, mit Reduced-Motion-Fallback.

## Build-Zusätze

- Gesetze und Patterns aus `animation-performance` (Lenis + ScrollTrigger-Sync, Pin-Spacing, `invalidateOnRefresh`, Resize, keine Layout-Thrashes, Fonts geladen vor Text-Split).
- Rezepte aus `signature-animations` (Layer-Doktrin, Canvas-Scrollytelling, Velocity-Skew, FLIP …); Text-Split über eigene Implementierung oder GSAP SplitText; Zeilen-Split nach Font-Load und Resize neu berechnen.
- Preloader mit garantiertem terminalem Zustand (Timeout-Fallback), Scroll gesperrt bis zum Ende, `prefers-reduced-motion` überspringt ihn.

## Validierungs-Zusätze

- Schwellen, Scrub-Glättung, Pin-Dauer und Snap gegen den Plan messen (`compare.json → motion`, ScrollTrigger-Werte im Build); Horizontal-Sections in beide Richtungen; Resize während eines Pins; Mobile-Plan umgesetzt.
- Preloader erreicht den terminalen Zustand auch bei langsamem Netz (Throttling). Ein hängender Balken ist ein `Fidelity Gap`, kein Timing-Zufall.
- FPS-Sample durch jede gepinnte oder gescrubbte Section; lange Frames > 50 ms auflisten.
