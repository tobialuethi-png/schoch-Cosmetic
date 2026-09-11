# Blend-Plan — <Projekt>

> Installierte Vorlage — read-only. Nach `<project-dir>/reports/blend-plan.md` kopieren und die Kopie füllen.
>
> Dieser Plan ist im Referenz-Modus das Äquivalent des Design-Briefs: Er entscheidet, was gebaut wird, bevor Code entsteht. Ohne freigegebenen (oder im Auto-Modus dokumentierten) Blend-Plan kein Build. Alle Werte hier sind eigene Werte — abgeleitet aus den Messungen, nicht kopiert.

## Projekt

- Kunde / Zweck / Branche:
- Scope-Klasse und Routen:
- Viewports:
- Stack:
- Marke (Logo, Farben, Fonts, Bildwelt — vorhanden / zu entwickeln):
- Verfügbare Assets (Kunde / eigen / Stock / Platzhalter):
- Freigabe-Modus: `Gate` | `Auto` (Annahmen unter «Gate» protokolliert)

## Rollen der Referenzen

| Referenz | Liefert (1–3 Beiträge) | Liefert ausdrücklich nicht | Begründung |
| --- | --- | --- | --- |
| ref-a | | | |
| ref-b | | | |

- Entschiedene Konflikte (Tonalität, Dichte, Motion-Tempo — was gewinnt und warum):
- Gestrichene Referenzen (bei mehr als drei) und Begründung:

## Unified System (eigene Werte)

### Typografie

- Display-Font / Text-Font (Herkunft: Lizenz / Open Source / Alternative zu … wegen …):
- Type-Scale (Basis, Ratio, Stufen mit Größen Desktop/Mobile, Schnitte, Tracking-Regel nach Größe):

### Farbe

- Tonalität (übernommen von ref-…):
- Palette (eigene Werte; Rollen: Fläche, Fläche-alt, Text, gedämpfter Text, Akzent, Linie):
- Kontrast-Check (AA für Text, Akzent auf Fläche):

### Layout

- Container / Außenränder / Grid / Ausrichtung:
- Spacing-Scale (Stufen) und Section-Rhythmus (Padding Desktop/Mobile):
- Radius / Border / Schatten-System:
- Icon-Set / Strichstärke:

### Motion-Tokens

- Easing-Familie (maximal drei, benannt: Eintritt / Scrub / Micro — mit Kurvenwerten):
- Duration-Skala (Micro / UI / Section) — abgeleitet aus den Audit-Clustern von ref-…:
- Stagger-Regeln (Abstand, Reihenfolge, Split-Ebene):
- Scroll-Mechanik (Lenis-Parameter, Scrub-Glättung, Snap ja/nein):
- Reduced-Motion und Lite-Mode (was bleibt, was fällt weg):

## Section-Plan

| # | Section (neu) | Zweck / Inhalt (Kunde) | Inspiration (Referenz + Section #) | Übernommenes Muster (Layout / Motion / Interaktion) | Angepasst — was und warum | Übergang zur nächsten Section | Mobile-Plan | Module | Assets | Skills |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | | | |

## Motion-Choreografie der Seite

- Einstieg (Preloader / Hero-Intro — Reihenfolge, Gesamtdauer):
- Signature-Momente (maximal 1–2; welche, wo, warum dort, benötigte Assets):
- Rhythmus schwer/leicht über die Seite (Abfolge):
- Navigation und Footer (Verhalten, Motion):
- Page-Transitions (nur bei Multi-Route):

## Kohärenz-Check (alle «Ja», sonst Plan überarbeiten)

- [ ] Alle Sections nutzen dieselben Tokens (Typo, Farbe, Spacing, Radius)
- [ ] Eine Easing-Familie, eine Duration-Skala
- [ ] Keine zwei benachbarten Sections aus verschiedenen Referenzen ohne definierten Übergang
- [ ] Dichte-Rhythmus: nach jeder schweren Section (Pin / Scrub / Signature) eine ruhige
- [ ] Navigation und Footer passen zur gewählten Tonalität
- [ ] Jede Section hat einen Mobile-Plan
- [ ] Eine Bildsprache, ein Icon-Set
- [ ] Jede Section hat einen Inhaltszweck des Kunden

## Originalitäts-Checkliste (vor dem Build)

- [ ] Fonts entschieden (Lizenz oder Alternative), keine Referenz-Pfade
- [ ] Assets beschafft oder als neutrale Platzhalter (`data-placeholder`) deklariert
- [ ] Palette eigen (Marke oder abgeleitet), nicht 1:1
- [ ] Copy-Plan: Kundeninhalt oder markierte Platzhalter
- [ ] Wiedererkennbarkeit pro Referenz eingeschätzt: ref-a … / ref-b …

## Gate

- Kurzfassung an den Nutzer gesendet am:
- Freigabe / Änderungswünsche:
- Annahmen im Auto-Modus:
