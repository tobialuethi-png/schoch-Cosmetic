# Modul: Mehrere Routen

Trigger: Scope-Klasse `Multi-Route Site`, `Portfolio Site` oder `Application`; Detail- oder Case-Seiten; Route-Transitions; geteilte Layouts; Kollektionen (CMS); App-Screens.

## Analyse-Zusätze (Phase 1)

- Pro Referenz die Routenstruktur beobachten: Navigationsziele, geteilte Layouts (Navigation, Footer, Seitenrahmen), Transition-Choreografie (Overlay, Shared Element, Fade — Muster benennen), Ladezustände, 404, Aufbau der Detailseiten, Kollektionsmuster (Listen, Filter, Grids).
- `capture_reference.py` pro In-Scope-Route separat ausführen (eigener Unterordner, z. B. `refs/ref-a/work`). Nur Routen erfassen, die der Nutzer im Scope hat.
- Strukturierte Inhalte (Tabellen, Preise, Formulare, Rechtstexte) auf Zielrouten notieren — sie werden nie in Cards «weichgezeichnet».

## Blend-Plan-Zusätze

- Routen-Plan: welche Routen die neue Seite braucht (Kundeninhalt), geteiltes Layout, ein Transition-Muster für die ganze Seite, Detailseiten-Template mit Section-Plan wie die Startseite.
- Mobile-Plan für Navigation und Transitions.

## Build-Zusätze

- Next.js App Router: Layout einmal; Transitions über eine zentrale Lösung (View Transitions oder eigene Overlay-Choreografie mit GSAP); ScrollTrigger beim Route-Wechsel sauber killen und neu anlegen; Lenis zurücksetzen.
- Jeder interne Link löst lokal auf; externe Links sind Absicht.

## Validierungs-Zusätze

- Matrix Route × Viewport; Transition in beide Richtungen getestet; Scroll-Position und Trigger nach dem Wechsel korrekt; strukturierte Module auf der richtigen Route und erkennbar; 404 und Ladezustände geprüft.
- Bei `Hero Only`, `Homepage` und `Landing Page` die Routen-Analyse kurz halten, außer Transitions sind Teil einer Rolle.
