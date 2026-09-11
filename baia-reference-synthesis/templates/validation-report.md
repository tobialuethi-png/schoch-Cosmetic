# Validierungs-Report — <Projekt>

> Installierte Vorlage — read-only. Nach `<project-dir>/reports/validation-report.md` kopieren und die Kopie füllen.
>
> Aussagen gelten nur für den deklarierten Scope und die aufgezeichnete Evidenz. Visuelle Beobachtung, Interaktionstest und Messwerte sind verschiedene Evidenzarten — nie eine aus der anderen ableiten. Zahlen aus `compare.json` referenzieren, nicht abtippen.

## Deklarierter Scope

- Lokale URL / Startbefehl (`next start` | `next dev`):
- Routen:
- Viewports:
- Interaktions- und Medienzustände:
- `compare-pairs.json` / `compare.json` / Bilder: `reports/compare/…`
- Datum Build / Datum Referenz-Capture:

## Section × Viewport

Prüfmethode: `Visuell beobachtet` | `Interaktion getestet` | `Werte gemessen` | `Nicht geprüft`.
Verdict: `Erreicht für deklarierte Evidenz` | `Teilweise` | `Fidelity Gap` | `Akzeptierte Ausnahme` | `Blockiert` | `Nicht geprüft` | `Out of scope`.

| Section | Viewport | Layout / Proportion vs. Inspiration | Typografie-Anmutung | Motion (Plan / gemessen im Build / Abweichung) | Interaktionen | Mobile-Plan umgesetzt | FPS-Sample (avg / lange Frames) | Prüfmethode | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | | |

## Globale Checks

- [ ] Kohärenz-Pass Desktop: die Seite wirkt als eine Seite (Tokens, Übergänge, Rhythmus) — Notizen:
- [ ] Kohärenz-Pass Mobile — Notizen:
- [ ] Motion-Tokens durchgängig (keine Ad-hoc-Easings oder -Durations im Code)
- [ ] Reduced-Motion-Pfad geprüft; Lite-Mode-Pfad geprüft (Test-Protokoll aus `animation-performance`)
- [ ] Konsole ohne Fehler; keine fehlgeschlagenen Requests
- [ ] Keine Requests an Referenz-Hosts (`compare.json → originality`)
- [ ] Bildgewichte, LCP-Kandidat, Gesamt-Transfer im Rahmen
- [ ] Tastatur: Navigation, Menü, Modals, sichtbarer Fokus
- [ ] Aktive Modul-Checks erledigt: (Liste)
- [ ] Originalitäts-Log vollständig, Fonts und Assets protokolliert

## Motion-Abgleich (Stichproben)

| Section | Animation (Audit #) | Zielwert (Plan) | Gemessen im Build (`compare.json → motion`) | Innerhalb Toleranz? |
| --- | --- | --- | --- | --- |
| | | | | |

## Fidelity Gaps

| Section / Muster | Fehlend oder abgeschwächt | Ursache | Mögliche Wege | Status (`Offen` / `Akzeptierte Ausnahme` / `Freigegebene Approximation`) |
| --- | --- | --- | --- | --- |
| | | | | |

## Projektstatus

`Vollständig für deklarierten Scope und Evidenz` | `Teilweise` | `Blockiert`

- Erledigt:
- Offen / blockiert:
- Freigegebene Approximationen:
- Nicht geprüft:
