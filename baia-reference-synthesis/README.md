# BAIA Reference Synthesis v1.0

Claude-Code-Skill für den referenzgetriebenen Website-Build: Aus zwei oder mehr Referenzseiten wird eine neue Seite auf Awwwards-Niveau gebaut — als bewusste Mischung, in komplett eigenem Code, mit Messwerten und Validierung wie bei einem Mirror-Workflow, aber ohne Mirror.

Der Skill ist der zweite Modus neben `baia-web-workflow` (strategiegetrieben). Dort kommt die Richtung aus Strategie und Design-Brief, hier aus den Referenzen. Der **Blend-Plan** übernimmt die Rolle des Design-Briefs (CLAUDE.md Phase 0); Build und QA teilen sich beide Workflows die gleichen Craft-Skills.

## Installation

```sh
# Ordner in die Claude-Code-Skills legen (global oder pro Projekt)
cp -r baia-reference-synthesis ~/.claude/skills/baia-reference-synthesis
#   oder: <projekt>/.claude/skills/baia-reference-synthesis

# Voraussetzungen der Scripts (einmalig, gleicher Python-Interpreter)
python3 -m pip install playwright pillow
python3 -m playwright install chromium

# Optional: Slash-Command
cp baia-reference-synthesis/extras/commands/ref-synth.md ~/.claude/commands/ref-synth.md
```

Der Ordnername muss `baia-reference-synthesis` bleiben (er entspricht `name` im Frontmatter der SKILL.md).

## Ordnerstruktur

```
baia-reference-synthesis/
├── SKILL.md                         Workflow (Phasen 0–5, Originalitäts-Gate, Skill- und Modul-Dispatch)
├── README.md                        diese Datei
├── templates/                       Report-Vorlagen (read-only; Kopien nach <projekt>/reports/)
│   ├── reference-analysis.md        pro Referenz: gemessenes System, Section-Inventar, Findings
│   ├── animation-audit.md           pro Referenz: eine Zeile pro Animation, Muster-Name, Messbasis
│   ├── blend-plan.md                Rollen, Unified System, Section-Plan, Choreografie, Kohärenz, Gate
│   ├── originality-log.md           Nachweis pro Section, Fonts, Assets, Netzcheck
│   └── validation-report.md         Build vs. Referenz, Verdicts, Fidelity Gaps, Status
├── modules/                         Zusatzregeln, nur bei Trigger lesen
│   ├── webgl.md · video.md · audio.md · multi-route.md · scroll-systems.md
├── scripts/
│   ├── capture_reference.py         Phase 1: Referenz beobachten und messen
│   └── compare_sections.py          Phase 4: Build vs. Referenz vergleichen
└── extras/commands/ref-synth.md     Slash-Command für Claude Code
```

## Ablauf

| Phase | Was passiert | Artefakt |
| --- | --- | --- |
| 0 Preflight | Referenzen (≥ 2), Rollen, Projektkontext, Scope, Viewports, Stack, Freigabe-Modus — eine gebündelte Rückfrage | — |
| 1 Analyse | `capture_reference.py` pro Referenz; alle Screenshots ansehen; Analyse + Animation-Audit; Modul-Trigger-Scan; Facts/Assumptions/Unknowns | `reports/refs/<slug>/`, `reference-analysis.<slug>.md`, `animation-audit.<slug>.md` |
| 2 Blend-Plan | Rollen, Unified System (Tokens inkl. Motion-Tokens), Section-Plan, Choreografie, Kohärenz-Check, Originalitäts-Checkliste → **Gate** (Freigabe) | `blend-plan.md` |
| 3 Build | Fundament (Tokens, Motion-Tokens, Lenis + ScrollTrigger), dann Section für Section mit Selbstcheck gegen die Zielwerte | Code, `originality-log.md` |
| 4 Validierung | `compare_sections.py`; jedes Side-by-side ansehen; Verdicts; globale Checks (Kohärenz, Performance, Konsole, Netzcheck) | `compare/`, `validation-report.md` |
| 5 Delivery | Kurzfassung mit Evidenz, Gaps, Originalitäts-Nachweis | — |

## Was die Scripts tun — und was nicht

`capture_reference.py` öffnet die Referenz in Chromium, scrollt sie in Schritten durch alle Viewports und speichert **nur Screenshots und Messwerte**: Computed-Style-Typografie, Farbinventar, CSS-Variablen von `:root`, Media-Queries/Breakpoints, Section-Inventar mit Geometrie, `document.fonts`, erkannte Bibliotheken (GSAP/ScrollTrigger, Lenis, Three, Text-Splitting, Custom Cursor …), `document.getAnimations()` (Dauer, Easing, Delay), GSAP-Tweens und ScrollTrigger-Werte (start/end/scrub/pin), Hover-Diffs, Klick-Proben, Intro-Frame-Bursts. Es lädt keine Assets herunter und liest keinen Quelltext.

`compare_sections.py` öffnet den lokalen Build und die zugeordneten Referenzstellen in denselben Viewports, erzeugt Side-by-side-Bilder, misst die Motion-Werte im Build (begrenzt auf die jeweilige Section), nimmt ein FPS-Sample beim Scroll durch die Section, sammelt Konsolenfehler und fehlgeschlagene Requests und prüft, dass der Build **keine Requests an Referenz-Hosts** sendet.

Beide Scripts sind syntaxgeprüft und die reinen Python-Helfer getestet; ein vollständiger Browser-Lauf war in der Erstellungsumgebung nicht möglich (kein Chromium-Download). **Ersten Lauf auf einer Test-URL machen** und die Ausgabe prüfen — Exit-Codes und Meldungen sind auf Diagnose ausgelegt.

### Beispiele

```sh
# Phase 1 — pro Referenz
python3 ~/.claude/skills/baia-reference-synthesis/scripts/capture_reference.py "https://ref-a.example" \
  --slug ref-a --out reports/refs/ref-a --viewports 1440x900,390x844 --hover 12 \
  --click "button[aria-label='Menu']" --burst-at 0,2400

# Phase 4 — Build vs. Referenz
python3 ~/.claude/skills/baia-reference-synthesis/scripts/compare_sections.py \
  --pairs reports/compare-pairs.json --out reports/compare --viewports 1440x900,390x844 --headed
```

`compare-pairs.json` schreibt Claude Code aus dem Section-Plan; das Format steht im Docstring von `compare_sections.py` (`url + selector`, `url + section_index`, `url + scroll_y` oder ein vorhandener Screenshot aus Phase 1).

## Welche Skills im Build laden

| Skill | Empfehlung | Warum |
| --- | --- | --- |
| `gsap-master` | **Ja** (Phase 3) | Motion-Engine des Stacks; Timelines, ScrollTrigger, SplitText |
| `signature-animations` | **Ja** (Phase 1 zum Benennen, 2, 3) | Muster-Lexikon und Rezepte; Layer-Doktrin; max. 1–2 Signature-Momente |
| `animation-performance` | **Ja** (Phase 3 vor dem ersten Motion-Code, 4) | Performance-Gesetze, Lite-Mode, Test-Protokoll |
| `frontend-taste` **oder** `design-taste-frontend` | **Ja, genau einer** (Phase 3) | Feinschliff; zwei Taste-Skills gleichzeitig widersprechen sich |
| `emilkowalski` | optional (Phase 3) | Hover-, Press- und Menü-Feel |
| `frontend-design` (Anthropic) | **Nein** | setzt eigene ästhetische Richtung — hier kommt sie aus den Referenzen |
| `ui-ux-pro-max` | **Nein** | Stil-, Paletten- und Font-Datenbank für Designs ohne Referenz; Kontextballast, kollidiert mit gemessenen Tokens |
| `motion-framer` | **Nein** | zweite Motion-Engine neben GSAP; nie für Scroll |

In Phase 0 und 1 keine Craft-Skills laden — sonst wird die Referenz «verbessert», statt gemessen.

## Quick-Prompts

```
Referenz-Modus: Nutze baia-reference-synthesis. Referenzen: https://ref-a.example (Typo, Hero-Choreografie)
und https://ref-b.example (Grid, Section-Rhythmus, Footer). Kunde: Treuhand AG in Aarau, Homepage,
dunkle Tonalität, Marke vorhanden (Logo + Blau). Viewports Standard. Gate vor dem Build.
```

```
/ref-synth https://ref-a.example https://ref-b.example -- Landing Page für eine Zahnarztpraxis, helle Tonalität, Auto-Modus
```

```
Phase 4 für den bestehenden Build: compare-pairs.json aus dem Blend-Plan schreiben, compare_sections.py laufen lassen,
jedes Side-by-side ansehen, validation-report.md füllen.
```

## Originalität in einem Absatz

Muster ja, Identität nein. Es werden Layout-Prinzipien, Section-Typen, Motion- und Interaktionsmuster, Timings und Proportionen übernommen — nie Code, Assets, Copy oder Fonts von Referenz-Servern, nie die Palette 1:1, nie die Bildwelt. Jede Referenz trägt materiell bei, keine ist im Ergebnis als Ganzes wiedererkennbar. Der Nachweis steht im `originality-log.md` und im Netzcheck von `compare_sections.py`.
