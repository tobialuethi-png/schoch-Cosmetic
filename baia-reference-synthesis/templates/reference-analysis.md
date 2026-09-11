# Referenz-Analyse — <Referenz-Slug>

> Installierte Vorlage — read-only. Nach `<project-dir>/reports/reference-analysis.<slug>.md` kopieren und die Kopie füllen. Nie Projektdaten in den installierten Skill schreiben.
>
> Jedes Feld füllen. `Unknown` oder `Nicht zutreffend`, wo nötig — nie raten. Evidenz notieren, keinen Code. Werte, die `reference.json` liefert, per Pfad referenzieren (z. B. `per_viewport.1440x900.typography[3]`), nicht abtippen. Schätzungen tragen `(est.)`.

## Referenz

- URL / finale URL:
- Capture: `reports/refs/<slug>/reference.json` — Datum, Viewports, Status:
- Nutzer-Evidenz (Recordings / Screenshots):
- Was der Nutzer an dieser Seite mag (wörtlich):
- Vorläufige Rolle in der Mischung (1–3 Beiträge):
- Scope-Klasse der Referenz:

## Erster Eindruck (nach dem Durchscrollen, Desktop und Mobile)

- Tonalität (hell/dunkel, warm/kalt, luftig/dicht, laut/leise):
- Was macht die Qualität aus (drei konkrete Sätze — Rhythmus, Weißraum, Hierarchie, Motion-Sprache, Details):
- Was ist Identität und wird nicht übernommen (Logo, Palette, Bildwelt, Illustrationsstil, markentypische Elemente):

## Gemessenes System

### Typografie

| Rolle | Familie (`fonts`) | Schnitt(e) | Größe Desktop / Mobile | Zeilenhöhe | Tracking | Transform | Messbasis |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Display / H1 | | | | | | | gemessen |
| H2 | | | | | | | |
| H3 | | | | | | | |
| Fließtext | | | | | | | |
| Label / Eyebrow | | | | | | | |
| Navigation / Button | | | | | | | |

- Abgeleitete Type-Scale (Basis, Ratio, Stufen):
- Font-Charakter für Lizenz oder Alternative (x-Höhe, Laufweite, Kontrast, Ziffern, Schnitte):

### Farbe

- Tonalität und Kontrastverhältnis (Fläche ↔ Text ↔ Akzent):
- Rollen der gemessenen Farben (Fläche, Fläche-alt, Text, gedämpfter Text, Akzent, Linie) — aus `colors`:
- Verläufe, Overlays, Blend-Modes:
- CSS-Variablen der Seite, die Tokens verraten (`root_vars`, nur Namen und Rollen — keine 1:1-Übernahme):

### Spacing und Layout

- Container-Breite(n) und Außenränder:
- Grid (Spalten, Gutter, Ausrichtung — linksbündig / zentriert / asymmetrisch):
- Section-Padding vertikal (Desktop / Mobile):
- Abstandsrhythmus innerhalb von Gruppen vs. zwischen Gruppen:
- Radius / Border / Schatten-System:

### Responsive

- Breakpoints (`breakpoints`):
- Was sich mobil ändert (Reihenfolge, Pin/Scrub aus, Navigation, Bildbeschnitt, Type-Scale):

## Section-Inventar (Source-Reihenfolge)

| # | Section | Typ / Muster | Layout-Prinzip | Motion (→ Audit #) | Interaktionen | Warum wirkt es | Als Muster übernehmbar? | Evidenz (`step-XX`) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | |

## Navigation, Footer, globale Elemente

- Navigation (Verhalten beim Scroll, Menü-Typ, Öffnungs-Choreografie, Evidenz `click-*`):
- Footer (Struktur, Motion):
- Preloader, Cursor, Page-Transitions, Marquees, Sticky-Elemente (`preloader_suspected`, `custom_cursor`):

## Interaktionen

| Element | Hover / Press / Focus-Verhalten | Dauer / Easing (Hover-Probe) | Evidenz |
| --- | --- | --- | --- |
| | | | |

## Modul-Trigger-Scan

| Trigger | Erkannt? (Ja / Vermutet / Nein) | Modul |
| --- | --- | --- |
| WebGL / Canvas / 3D | | `modules/webgl.md` |
| Video / Bildsequenz | | `modules/video.md` |
| Audio | | `modules/audio.md` |
| Mehrere Routen | | `modules/multi-route.md` |
| Scroll-Systeme (Smooth/Virtual Scroll, Pin, Scrub, Horizontal, Text-Split, Preloader, Cursor) | | `modules/scroll-systems.md` |

## Findings

### Facts
-

### Assumptions
-

### Unknowns (mit Weg zur Auflösung)
-
