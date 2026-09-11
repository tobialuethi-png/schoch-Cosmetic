---
name: baia-reference-synthesis
description: "Referenzgetriebener Website-Build auf Awwwards-Niveau in komplett eigenem Code. IMMER nutzen, wenn der Nutzer zwei oder mehr Referenzseiten (URLs, Screenshots, Screen-Recordings) vorgibt und daraus eine neue Seite will, deren Sections, Animationen, Interaktionen und Feinschliff das Niveau der Referenzen erreichen, die aber zu einer stimmigen Mischung verschmolzen und eigenständig implementiert ist (Next.js, GSAP, Lenis). Trigger: «Referenzseiten», «Referenz-Modus», «Mirror-Modus», «so gut wie diese Seite», «wie bei …», «mische diese Seiten», «Awwwards-Niveau», «gleiche Qualität wie», «nachbauen, aber eigener Code» — auch wenn nur eine URL mit «so soll es aussehen» kommt. Kein Mirror-, Clone- oder Kopier-Tool: nie fremder Code, nie fremde Assets — dafür messbare Evidenz, ein Blend-Plan mit Freigabe und Validierung des Builds gegen die Referenzen."
---

# BAIA Reference Synthesis v1.0

Aus zwei oder mehr vom Nutzer gewählten Referenzseiten eine neue Seite bauen, die in Layout-Präzision, Motion, Interaktion und Feinschliff das Niveau der Referenzen erreicht — als bewusste, kohärente Mischung, zu 100 % in eigenem Code, mit eigenen Assets und eigener Identität.

**Fidelity heißt hier:** gleiche Wirkung, gleiche Präzision, gleiche Werte (Timing, Rhythmus, Proportionen, Hierarchie) — nicht gleiche Bytes. Der Nachweis läuft wie bei einem Mirror-Workflow über Messwerte und Screenshots, nur wird gemessen, ob der *eigene* Build die im Blend-Plan festgelegten, aus den Referenzen abgeleiteten Werte erreicht.

Dieser Ordner enthält Hilfsdateien. Nur laden, wenn der Workflow es sagt:

- `modules/` — technologiespezifische Zusatzregeln (siehe Modul-Dispatch)
- `templates/` — Report-Vorlagen (read-only). Nur die benötigten nach `<project-dir>/reports/` kopieren und die Kopien füllen. Nie Projektdaten in den installierten Skill schreiben.
- `scripts/` — deterministische Helfer: `capture_reference.py` (Beobachtung und Messung einer Referenz) und `compare_sections.py` (Build vs. Referenz). Beide brauchen Playwright + Chromium; `compare_sections.py` nutzt Pillow optional für Side-by-side-Bilder. Beide Scripts speichern nie Assets oder Quelltext einer Referenz.

Platzhalter:

- `<skill-dir>` = dieser installierte Ordner
- `<project-dir>` = Projektordner des Nutzers (Next.js-Projekt)
- `<reports-dir>` = `<project-dir>/reports`

Voraussetzungen (derselbe Python-Interpreter für alles):

```sh
python3 -m pip install playwright pillow
python3 -m playwright install chromium
```

## Was dieser Skill nicht ist

- Kein Mirror, Clone oder Kopie. Von der Referenz wird nichts heruntergeladen, gespiegelt oder weiterverwendet: kein HTML, CSS, JS, keine Bilder, Videos, Fonts, Modelle, Shader.
- Kein Source-Reading. Bundles, Source-Maps, Repos und DevTools-«Copy styles/element» der Referenz werden nicht gelesen. Beobachtet wird Verhalten, gemessen werden Werte (Computed Styles, Animations-Timings, Layout-Geometrie) — das erledigt `capture_reference.py`.
- Keine 1:1-Nachbildung einer einzelnen Seite. Unter zwei Referenzen wird nicht gestartet (Ausnahme nur auf ausdrückliche Anweisung; dann heißt das Ergebnis «Single-Reference-Interpretation» und wird so benannt).
- Keine Strategie- oder Konzeptphase. Die Design-Richtung kommt aus den Referenzen, Inhalte, Marke und Zweck aus dem Projektkontext des Nutzers. Der strategiegetriebene Weg ist `baia-web-workflow`; dieser Skill ist der zweite, referenzgetriebene Modus. Der Blend-Plan übernimmt hier die Rolle des Design-Briefs (CLAUDE.md Phase 0).

## Originalitäts-Gate (kanonisch — gilt in jeder Phase)

1. **Code.** Jede Zeile entsteht aus Blend-Plan und Animation-Audit, geschrieben im Stack des Projekts. Nie Code, Klassennamen-Systeme, Shader, Timeline-Definitionen oder Komponentenstrukturen der Referenz übernehmen — auch nicht «zum Verständnis» lesen. Erlaubt sind ausschließlich die Beobachtungen aus `capture_reference.py` und eigene Browser-Beobachtung (scrollen, hovern, klicken, Screenshots).
2. **Assets.** Keine Bilder, Videos, Illustrationen, Icons, Lottie/Rive-Dateien, 3D-Modelle, Texturen, Audio oder Logos der Referenz — weder direkt noch «leicht bearbeitet». Quellen sind: Kunden-Assets, selbst erzeugte Assets, lizenzierter Stock. Während des Builds sind Platzhalter erlaubt, wenn sie neutral sind (Flächen, Verläufe, eigene Formen) und mit `data-placeholder` markiert werden; nie Referenzbilder als Platzhalter.
3. **Copy.** Kein Text der Referenz. Die *Struktur* der Botschaft darf übernommen werden (Eyebrow + zweizeilige Headline + Sub + zwei CTAs); der Inhalt ist immer der des Kunden oder klar markierter Platzhalter.
4. **Fonts.** Schriftfamilien werden identifiziert (Script: `document.fonts`), nie von Referenz-Servern oder Referenz-Pfaden geladen. Zwei Wege, je Font dokumentiert: (a) Lizenz durch Kunden oder Agentur erwerben, (b) Alternative mit gleichem Charakter wählen (x-Höhe, Laufweite, Kontrast, verfügbare Schnitte, Ziffernform). Open-Source-Fonts sind frei.
5. **Muster ja, Identität nein.** *Muster* = Layout-Prinzip, Grid-Rhythmus, Section-Typ, Motion- und Interaktionsmuster (benannt nach dem Lexikon in `signature-animations`), Timing-Werte, Proportionen. *Identität* = Logo, Palette 1:1, Bildwelt, Illustrationsstil, Copy, markentypische Sonderelemente (z. B. ein Cursor in Markenform). Farben werden gemessen, um Tonalität und Kontrast zu verstehen; die Palette des Builds kommt von der Marke des Kunden oder wird eigenständig abgeleitet (gleiche Tonalität, andere Werte).
6. **Wiedererkennbarkeits-Test.** Keine Referenz darf im Ergebnis als Ganzes wiedererkennbar sein. Jede Referenz trägt materiell bei (keine 95/5-Mischung), und jede Section unterscheidet sich von ihrer Inspiration mindestens in Inhalt, Bildwelt und Palette — in der Regel zusätzlich in Komposition oder Proportion.
7. **WebGL, Canvas, Shader** sind Code — gleiche Regel: Szene, Kamera-Verhalten, Bewegung, Interaktion und Tonalität werden aus Beobachtung neu gebaut; nie Shader-Quellen, Modelle oder Texturen übernehmen.
8. **Nachweis.** Pro Section eine Zeile in `originality-log.md`; `compare_sections.py` prüft zusätzlich, dass der Build keine Requests an Referenz-Hosts sendet. Die Delivery nennt den Nachweis ausdrücklich.

## Evidenz-Regeln

- Priorität: (1) Screen-Recordings des Nutzers, (2) Screenshots des Nutzers, (3) Live-Referenz über Script und Browser, (4) Beschreibung des Nutzers. Höhere Priorität gewinnt; Konflikte werden in den Findings genannt.
- Jede Beobachtung ist **Fact** (gemessen oder gesehen), **Assumption** (plausibel, unbelegt) oder **Unknown** (offen). Schätzungen tragen `(est.)`, offene Werte `Unknown`. Nie erfinden.
- Messbasis pro Wert angeben: `gemessen` (Computed Style, `document.getAnimations()`, GSAP-/ScrollTrigger-Probe, Hover-Probe), `Frames` (aus Screenshot-Sequenz geschätzt) oder `beobachtet` (visuell).
- Ein Wert ohne Evidenz bleibt `Unknown` und wird vor dem Build der betroffenen Section aufgelöst — durch gezielte Nachmessung (`--burst-at`, `--click`, eigene Browser-Session) oder eine Rückfrage an den Nutzer, etwa die Bitte um ein kurzes Screen-Recording der Stelle.
- Kein Implementierungscode in Phase 1 und 2.

## Phase 0 — Preflight

Erfassen, bevor irgendetwas geöffnet wird:

- **Referenzen:** mindestens zwei URLs (plus optionale Screenshots/Recordings). Weniger als zwei → stoppen und nach der zweiten fragen.
- **Rollen** (optional vom Nutzer): welche Referenz was liefert. Fehlen sie, werden sie in Phase 2 vorgeschlagen.
- **Projektkontext:** Kunde und Zweck, Branche, Inhalte und Sections, die die Seite braucht, Marke (Logo, Farben, Fonts) und verfügbare Assets.
- **Scope-Klasse:** `Hero Only` | `Homepage` | `Landing Page` | `Multi-Route Site` | `Portfolio Site` | `Application`.
- **Viewports:** Standard `1440x900` und `390x844`; `1920x1080` oder `1024x768` nur bei erkanntem Signal (Ultrawide-Layouts, Tablet-spezifische Breakpoints).
- **Stack:** bestehendes Repo → dessen Konventionen. Neu → Next.js App Router, GSAP + ScrollTrigger, Lenis, Tailwind mit CSS-Variablen für Tokens, Sanity nur bei CMS-Bedarf. Eine zweite Motion-Engine (Framer Motion o. ä.) neben GSAP nur auf ausdrücklichen Wunsch und nie für Scroll.
- **Interaktions-Scope:** Navigation/Menü, Hover, Modals, Route-Wechsel, Media, Formulare — was validiert werden soll.
- **Freigabe-Modus:** Standard = Blend-Plan-Gate mit Rückfrage. «Ohne Rückfrage» oder «Auto» → Annahmen protokollieren und durchlaufen.

Fehlende Angaben in **einer** gebündelten Rückfrage klären, nicht in mehreren. Skills in Phase 0 und 1: **keine Craft-Skills laden** — sonst wird die Referenz «verbessert», statt gemessen.

## Phase 1 — Referenz-Analyse (pro Referenz, kein Code)

1. Script ausführen — pro Referenz, alle deklarierten Viewports:

   ```sh
   python3 "<skill-dir>/scripts/capture_reference.py" "https://ref-a.example" \
     --slug ref-a --out "<reports-dir>/refs/ref-a" --viewports 1440x900,390x844 --hover 12
   ```

   Ergebnis: `reference.json` (Messwerte, Motion-Probe, Fonts, CSS-Variablen, Breakpoints, Section-Inventar, Hover-Diffs), Screenshots pro Viewport und Scroll-Schritt (`start` direkt nach dem Scroll, `settled` nach dem Einschwingen), Frame-Bursts der Intro-Choreografie. Für Menüs und Modals `--click "<selector>"`, für Motion-Bursts an bestimmten Stellen `--burst-at y1,y2`, für realistische Timings `--headed`. Exit-Code ≠ 0 (Challenge, Login, Navigationsfehler) → Zustand melden, nicht weiterrechnen.
2. **Alle** Screenshots ansehen, Desktop und Mobile, in Scroll-Reihenfolge. Was ein Screenshot nicht zeigt, selbst im Browser beobachten (Playwright-Session): scrollen, hovern, Menü öffnen.
3. `templates/reference-analysis.md` kopieren und füllen: vorläufige Rolle, Section-Inventar in Source-Reihenfolge mit dem Feld «Warum wirkt es» (Rhythmus, Weißraum, Hierarchie, Kontrast, Motion), gemessene Typografie (Familien, Schnitte, Type-Scale), Farbtonalität, Spacing (Section-Paddings, Container, Grid), Breakpoints und was sich mobil ändert, Navigation und Footer, Interaktionen, Modul-Trigger-Scan.
4. `templates/animation-audit.md` kopieren und füllen: eine Zeile pro Animation, Muster-Name aus dem Lexikon in `signature-animations` (nur zum Benennen laden), Werte aus der Motion-Probe (`gemessen`) oder aus Frames (`est.`). `start`/`settled`-Paare und Bursts liefern Start- und Endzustände sowie grobe Dauern.
5. Modul-Trigger-Scan → betroffene Module lesen (siehe Modul-Dispatch).
6. Findings: Facts / Assumptions / Unknowns.

Phase 1 ist fertig, wenn jede Referenz Analyse und Audit hat. Unknowns dürfen offen bleiben, bis der Blend-Plan entscheidet, ob die betroffene Section genutzt wird — für genutzte Sections müssen sie vor Phase 3 aufgelöst sein.

## Phase 2 — Blend-Plan (Herzstück, mit Gate)

Nur `signature-animations` laden (Muster-Namen, Machbarkeit). `templates/blend-plan.md` kopieren und in dieser Reihenfolge füllen:

1. **Rollen finalisieren.** Jede Referenz bekommt 1–3 ausdrückliche Beiträge: Typo-System, Grid/Layout, Section-Rhythmus, Hero-Choreografie, Scroll-Mechanik, Interaktions-Feel, Navigation, Footer, Farb-Tonalität, Bildsprache-Prinzip. Konflikte werden entschieden, nicht gemittelt: eine Tonalität für die ganze Seite (hell/dunkel, warm/kalt, luftig/dicht); die andere Referenz liefert dann Struktur oder Motion, nicht Tonalität. Ab vier Referenzen verliert die Mischung ihre Handschrift — auf zwei bis drei begrenzen und die Streichung begründen.
2. **Unified System (Tokens).** Eigene Werte, abgeleitet aus den Messungen der jeweils zuständigen Referenz: Type-Scale (Basis, Ratio, Schnitte), Font-Entscheidungen nach Originalitäts-Gate 4, Palette (Marke oder eigenständig abgeleitet), Spacing-Scale, Container-Breiten, Grid, Radius/Border/Schatten-System, Icon-Set. **Motion-Tokens:** eine Easing-Familie (maximal drei Easings: Eintritt, Scrub, Micro), eine Duration-Skala (Micro/UI/Section — aus den Audit-Clustern abgeleitet), Stagger-Regeln, Lenis-Parameter, Verhalten bei `prefers-reduced-motion` und im Lite-Mode.
3. **Section-Plan.** Die neue Seite in Reihenfolge; pro Section: Zweck und Inhalt (Kunde), Inspiration (Referenz + Section-Nummer), übernommenes Muster (Layout / Motion / Interaktion, benannt), Anpassungen und warum, Übergang zur nächsten Section (wie Tonalität und Bewegung übergeben werden), aktive Module, benötigte Assets (Kunde/eigen/Stock), Skills für den Build. Eine Section ohne Inhaltszweck wird gestrichen oder umgewidmet — «weil die Referenz sie hat» ist kein Zweck.
4. **Motion-Choreografie der Seite.** Einstieg (Preloader nur, wenn eine Rolle ihn vorsieht und er dem Inhalt dient), Hero, Rhythmus schwer/leicht (nach einer gepinnten oder gescrubbten Section folgt eine ruhige), maximal 1–2 Signature-Momente pro Seite mit Platzierung, Übergänge, Footer.
5. **Kohärenz-Check** — alle Punkte müssen «Ja» sein: überall dieselben Tokens; eine Easing-Familie; keine zwei benachbarten Sections aus verschiedenen Referenzen ohne definierten Übergang; Dichte-Rhythmus stimmt; Navigation und Footer passen zur Tonalität; jede Section hat einen Mobile-Plan (was fällt weg: Pin, Scrub, Parallax; was bleibt); eine Bildsprache.
6. **Originalitäts-Checkliste** vor dem Build: Fonts entschieden, Assets beschafft oder Platzhalter deklariert, Palette eigen, Copy-Plan, Wiedererkennbarkeits-Einschätzung pro Referenz.
7. **Gate.** Kurzfassung an den Nutzer: Rollen, Section-Liste mit Inspiration, Tokens in einem Absatz, offene Entscheidungen. Warten auf «go». Erst dann Phase 3. Im Auto-Modus: Annahmen ins Plan-Dokument, weiter.

## Phase 3 — Build (eigener Code, Section für Section)

Laden: `gsap-master`, `signature-animations`, `animation-performance` (vor der ersten Zeile Motion-Code), genau einen Taste-Skill (`frontend-taste` **oder** `design-taste-frontend`), optional `emilkowalski` für Hover-, Press- und Menü-Feel. Nicht laden: `frontend-design`, `ui-ux-pro-max`, `motion-framer`.

1. **Fundament zuerst.** Tokens als CSS-Variablen/Tailwind-Theme aus dem Unified System; Motion-Tokens zentral (z. B. `lib/motion.ts`: Easings, Durations, Stagger); Lenis + ScrollTrigger einmal global verdrahtet (Ticker-Sync, Resize); Layer-Doktrin aus `signature-animations`; Reduced-Motion- und Lite-Mode-Pfad aus `animation-performance` von Anfang an.
2. **Section für Section in Seitenreihenfolge.** Pro Section: (a) Plan-Zeile und die Audit-Zeilen der Inspiration lesen; (b) Struktur → Styles → Motion → Interaktionen; (c) Selbstcheck gegen die Zielwerte (Timing, Easing, Trigger-Schwellen, Start-/Endzustände, Proportionen — Toleranzen siehe Defaults); (d) Mobile-Plan umsetzen; (e) Zeile in `originality-log.md`; (f) Screenshot des lokalen Builds ansehen, erst dann die nächste Section. Nie die ganze Seite in einem Durchgang, nie Motion für mehrere Sections «auf Vorrat».
3. **Performance-Gesetze** sind nicht verhandelbar: nur `transform` und `opacity`, `will-change` gezielt, Bildbudgets, Scrub-Disziplin, keine Layout-Thrashes. Signature-Momente sind das Erste, was unter Reduced-Motion und im Lite-Mode wegfällt — die Seite muss ohne sie vollständig funktionieren.
4. **Baseline-Qualität:** semantische Sections, Fokus-Stile, Tastatur für Menü und Modals, `text-wrap: balance/pretty`, `tabular-nums` bei Zahlen, echte Anführungszeichen — der Taste-Skill regelt die letzten 10 %.
5. **Fidelity-Eskalation.** Kann ein Muster nicht mit hoher Sicherheit erreicht werden (z. B. Szene braucht Assets, die es nicht gibt): Section stoppen, Blocker benennen, Wege auflisten (Muster vereinfachen / Nutzer liefert Asset / Section umplanen), andere Sections weiterbauen. Nie still herunterstufen.

## Phase 4 — Validierung (Build vs. Referenz)

1. Produktionsnah starten (`next build && next start`; sonst `next dev` ausdrücklich benennen) und die lokale URL deklarieren.
2. `<reports-dir>/compare-pairs.json` aus dem Section-Plan schreiben: pro Section lokaler Selektor + Referenz (URL mit Selektor, Section-Index oder Scroll-Position — oder ein vorhandener Screenshot aus Phase 1) + `reference_hosts`. Dann:

   ```sh
   python3 "<skill-dir>/scripts/compare_sections.py" \
     --pairs "<reports-dir>/compare-pairs.json" --out "<reports-dir>/compare" --viewports 1440x900,390x844
   ```

   Ergebnis: Side-by-side-Bilder pro Section × Viewport, Motion-Werte im Build, Konsolenfehler, fehlgeschlagene Requests, Request-Hosts (Originalitäts-Netzcheck), FPS-Sample beim Scroll durch jede Section, `compare.html` als Übersicht. Exit-Code ≠ 0 → Zustand melden. FPS-Werte aus dem Headless-Browser sind relativ, nicht absolut — für belastbare Zahlen `--headed`.
3. **Jedes** Side-by-side-Bild ansehen und pro Section × Viewport urteilen: Layout und Proportion (Rhythmus, Weißraum, Hierarchie), Typografie-Anmutung, Motion (Werte gegen Plan, visuell gegen Referenz), Interaktionen (per Playwright ausgelöst), Responsive-Verhalten. Verdict und Prüfmethode nach `templates/validation-report.md`.
4. **Globale Checks:** Kohärenz-Pass über die ganze Seite bei Desktop und Mobile (wirkt die Seite wie *eine* Seite, oder erkennt man Sections «von woanders»?); Performance (FPS-Sample ohne lange Frames, Bildgewichte, LCP-Kandidat); Konsole sauber; keine Requests an Referenz-Hosts; Reduced-Motion-Pfad; Tastatur-Bedienung; aktive Modul-Checks.
5. **Ehrlichkeitsregeln.** Ein im Scope geplantes Muster, das fehlt, eingefroren, ersetzt oder deutlich schwächer ist: `Fidelity Gap` mit Scope und Evidenz, kein Pass. Nutzer-Kenntnisnahme macht daraus `Akzeptierte Ausnahme`, kein Pass. Eine Approximation braucht Freigabe *vor* dem Einbau. Kompilieren ist keine Validierung; ein Screenshot der Startansicht belegt nur den ersten Viewport. Nie eine enge Prüfung zu einer Aussage über die ganze Seite aufblasen.
6. **Fix-Loop.** Nach einem Fix nur betroffene Paare erneut laufen lassen; nach Änderungen an Tokens oder globaler Motion die volle Matrix.

Stop, wenn: alle deklarierten Sections × Viewports ein Verdict haben; kein `Fidelity Gap` ohne Nutzerentscheidung offen ist; die Originalitätschecks bestanden sind (keine Referenz-Hosts, Fonts entschieden, Assets protokolliert, Log vollständig); der Kohärenz-Pass bestanden ist; Performance-Schwellen erreicht oder begründet dokumentiert sind.

## Phase 5 — Delivery

Antwortformat: Scope und Referenzen mit Rollen → Blend-Plan in Kurzform → Build-Status pro Section → Validierungs-Evidenz (Paare, Verdicts, Messwerte) → Fidelity Gaps und offene Entscheidungen → Originalitäts-Nachweis → nächste Schritte. Details bleiben in `<reports-dir>/`; die Zusammenfassung bleibt kurz. Zahlen aus `reference.json` und `compare.json` referenzieren statt abtippen.

## Skill-Dispatch

| Phase | Laden | Nicht laden |
| --- | --- | --- |
| 0 Preflight, 1 Analyse | keine Craft-Skills; `signature-animations` nur zum Benennen der Muster im Audit | alle Taste- und Motion-Skills |
| 2 Blend-Plan | `signature-animations` | `frontend-design`, `ui-ux-pro-max` |
| 3 Build | `gsap-master`, `signature-animations`, `animation-performance`, ein Taste-Skill (`frontend-taste` oder `design-taste-frontend`), optional `emilkowalski` | `frontend-design`, `ui-ux-pro-max`, `motion-framer` |
| 4 Validierung | `animation-performance` (Test-Protokoll, Lite-Mode) | — |

Warum nicht: `frontend-design` und `ui-ux-pro-max` setzen eigene Stil-, Paletten- und Font-Richtungen — hier kommt die Richtung aus den Referenzen; alles andere ist Rauschen und Kontextballast. `motion-framer` ist eine zweite Motion-Engine; zwei Engines auf einer Scroll-Seite kämpfen um den Frame. Mehr als drei Craft-Skills gleichzeitig widersprechen sich — pro Subagent kuratieren.

## Modul-Dispatch

In Phase 1 ist der Trigger-Scan Pflicht. Ein Modul nur lesen, wenn sein Trigger erkannt oder begründet vermutet wird; Vermutung → `Unknown` und Modul lesen, nie Abwesenheit annehmen.

| Trigger | Lesen |
| --- | --- |
| WebGL, Three.js/R3F, Canvas-Szenen, Shader, 3D, GLB/GLTF, Partikel, Bild-Distortion | `modules/webgl.md` |
| Video (Datei, Provider, Hintergrund, scroll-gekoppelt), Bildsequenzen | `modules/video.md` |
| Audio, UI-Sounds, Web Audio, Mute-Controls | `modules/audio.md` |
| Mehrere Routen, Detailseiten, App-Screens, Route-Transitions, CMS-Kollektionen | `modules/multi-route.md` |
| Smooth/Virtual Scroll, Pinning, Scrub, Horizontal-Scroll, Text-Splitting, Preloader, Custom Cursor, Sticky-Stacks | `modules/scroll-systems.md` |

## Defaults

- Bestehendes Repo: dessen Konventionen; keine neue Bibliothek ohne Modul-Bedarf (Three.js nur über `modules/webgl.md`).
- Toleranzen Build vs. Plan: Timings ±15 %, Easing gleiche Familie, Trigger-Schwellen ±10 % der Viewport-Höhe, Spacing ±8 px Desktop / ±4 px Mobile, Type-Scale exakt. Der Vergleich mit der Referenz prüft Muster-Treue (Komposition, Proportion, Hierarchie, Timing) so nah wie möglich an der Inspiration — nicht Pixelgleichheit, weil Palette, Copy und Bildwelt bewusst anders sind.
- Reports: `reports/refs/<slug>/` (Script-Output), `reports/reference-analysis.<slug>.md`, `reports/animation-audit.<slug>.md`, `reports/blend-plan.md`, `reports/originality-log.md`, `reports/compare-pairs.json`, `reports/compare/`, `reports/validation-report.md`.
- Sprache der Reports: Deutsch; Muster-Namen englisch wie im Lexikon.
